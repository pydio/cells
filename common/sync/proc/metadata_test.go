/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package proc

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// recordingMetaTarget records the node paths metadata are written to.
type recordingMetaTarget struct {
	*memory.MemDB
	paths []string
}

func (r *recordingMetaTarget) CreateMetadata(_ context.Context, node tree.N, _ string, _ string) error {
	r.paths = append(r.paths, node.GetPath())
	return nil
}

func (r *recordingMetaTarget) UpdateMetadata(ctx context.Context, node tree.N, ns string, v string) error {
	return r.CreateMetadata(ctx, node, ns, v)
}

func (r *recordingMetaTarget) DeleteMetadata(ctx context.Context, node tree.N, ns string) error {
	return r.CreateMetadata(ctx, node, ns, "")
}

func metaOperation(target *recordingMetaTarget, store map[string]string) merger.Operation {
	patch := merger.NewPatch(memory.NewMemDB(), target, merger.PatchOptions{})
	n := &tree.Node{Path: "a/f/usermeta-x", Uuid: "f1-usermeta-x", Type: merger.NodeType_METADATA, Etag: `"v"`, MetaStore: store}
	op := merger.NewOperation(merger.OpCreateMeta, model.NodeToEventInfo(testCtx, n.Path, n, model.EventCreate), n)
	patch.Enqueue(op)
	return op
}

func TestProcessMetadataParent(t *testing.T) {
	Convey("Metadata are written to their parent node", t, func() {
		target := &recordingMetaTarget{MemDB: memory.NewMemDB()}
		op := metaOperation(target, merger.ParentMetaStore("f1", `a/double "quotes".txt`))
		So(NewProcessor(testCtx).processMetadata(testCtx, op, "op", nil), ShouldBeNil)
		So(target.paths, ShouldResemble, []string{`a/double "quotes".txt`})
	})

	Convey("A parent path that cannot be decoded fails, instead of resolving to the endpoint root", t, func() {
		target := &recordingMetaTarget{MemDB: memory.NewMemDB()}
		// Unescaped quotes, as produced before ParentMetaStore.
		op := metaOperation(target, map[string]string{
			merger.MetaNodeParentUUIDMeta: `"f1"`,
			merger.MetaNodeParentPathMeta: `"a/double "quotes".txt"`,
		})
		So(NewProcessor(testCtx).processMetadata(testCtx, op, "op", nil), ShouldNotBeNil)
		So(target.paths, ShouldBeEmpty)
	})
}

// batchMetaTarget records the ApplyMetadata calls, by node path.
type batchMetaTarget struct {
	*memory.MemDB
	mu      sync.Mutex
	values  map[string]map[string]string
	deleted map[string][]string
	calls   int
	err     error
}

func (b *batchMetaTarget) ApplyMetadata(_ context.Context, node tree.N, values map[string]string, deleted []string) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.calls++
	b.values[node.GetPath()] = values
	b.deleted[node.GetPath()] = deleted
	return b.err
}

func TestProcessMetadataBatches(t *testing.T) {
	enqueue := func(patch merger.Patch, t merger.OperationType, parentUuid, parentPath, ns, value string) merger.Operation {
		p := parentPath + "/" + ns
		n := &tree.Node{Path: p, Uuid: parentUuid + "-" + ns, Type: merger.NodeType_METADATA, Etag: value, MetaStore: merger.ParentMetaStore(parentUuid, parentPath)}
		op := merger.NewOperation(t, model.NodeToEventInfo(testCtx, p, n, model.EventCreate), n)
		patch.Enqueue(op)
		return op
	}
	setup := func(err error) (*batchMetaTarget, merger.Patch, []merger.Operation) {
		target := &batchMetaTarget{MemDB: memory.NewMemDB(), values: map[string]map[string]string{}, deleted: map[string][]string{}, err: err}
		patch := merger.NewPatch(memory.NewMemDB(), target, merger.PatchOptions{})
		ops := []merger.Operation{
			enqueue(patch, merger.OpCreateMeta, "a1", "a/file.zip", "usermeta-x", `"x"`),
			enqueue(patch, merger.OpUpdateMeta, "a1", "a/file.zip", "usermeta-y", `"y"`),
			enqueue(patch, merger.OpDeleteMeta, "a1", "a/file.zip", "usermeta-z", ""),
			enqueue(patch, merger.OpCreateMeta, "b1", "b/other.txt", "usermeta-x", `"bx"`),
		}
		return target, patch, ops
	}

	Convey("Metadata operations are applied with one call per node", t, func() {
		target, patch, ops := setup(nil)
		NewProcessor(testCtx).processMetadataBatches(testCtx, patch, target, &atomic.Bool{})

		So(target.calls, ShouldEqual, 2)
		So(target.values["a/file.zip"], ShouldResemble, map[string]string{"usermeta-x": `"x"`, "usermeta-y": `"y"`})
		So(target.deleted["a/file.zip"], ShouldResemble, []string{"usermeta-z"})
		So(target.values["b/other.txt"], ShouldResemble, map[string]string{"usermeta-x": `"bx"`})
		So(target.deleted["b/other.txt"], ShouldBeEmpty)
		for _, op := range ops {
			So(op.IsProcessed(), ShouldBeTrue)
			So(op.Error(), ShouldBeNil)
		}
	})

	Convey("Process uses the batch path when the target supports it", t, func() {
		target, patch, ops := setup(nil)
		pr := NewProcessor(testCtx)
		pr.SkipTargetChecks = true
		pr.Process(patch, nil)

		So(target.calls, ShouldEqual, 2)
		for _, op := range ops {
			So(op.IsProcessed(), ShouldBeTrue)
		}
	})

	Convey("A failed call marks every operation of the node as failed", t, func() {
		target, patch, ops := setup(errors.New("meta service down"))
		NewProcessor(testCtx).processMetadataBatches(testCtx, patch, target, &atomic.Bool{})

		for _, op := range ops {
			So(op.IsProcessed(), ShouldBeFalse)
			So(op.Error(), ShouldNotBeNil)
		}
		_, has := patch.HasErrors()
		So(has, ShouldBeTrue)
	})

	Convey("Operations whose parent cannot be decoded fail without a call", t, func() {
		target := &batchMetaTarget{MemDB: memory.NewMemDB(), values: map[string]map[string]string{}, deleted: map[string][]string{}}
		patch := merger.NewPatch(memory.NewMemDB(), target, merger.PatchOptions{})
		n := &tree.Node{Path: "a/f/usermeta-x", Uuid: "f1-usermeta-x", Type: merger.NodeType_METADATA, Etag: `"v"`, MetaStore: map[string]string{
			merger.MetaNodeParentUUIDMeta: `"f1"`,
			merger.MetaNodeParentPathMeta: `"a/double "quotes".txt"`,
		}}
		op := merger.NewOperation(merger.OpCreateMeta, model.NodeToEventInfo(testCtx, n.Path, n, model.EventCreate), n)
		patch.Enqueue(op)
		NewProcessor(testCtx).processMetadataBatches(testCtx, patch, target, &atomic.Bool{})
		So(target.calls, ShouldEqual, 0)
		So(op.Error(), ShouldNotBeNil)
	})
}
