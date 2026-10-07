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
