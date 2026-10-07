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

package task

import (
	"context"
	"path/filepath"
	"sync"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints"
	"github.com/pydio/cells/v5/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// routerLike wraps a snapshot to behave like the Cells router for metadata:
// creating a node does not store its metadata, which only arrive through
// MetadataReceiver calls, and those fail on paths that do not exist.
type routerLike struct {
	*snapshot.BoltSnapshot
	mu    sync.Mutex
	calls []string
}

func (r *routerLike) record(op string, node tree.N, namespace string) {
	r.mu.Lock()
	r.calls = append(r.calls, op+" "+node.GetPath()+"/"+namespace)
	r.mu.Unlock()
}

func (r *routerLike) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) error {
	c := node.AsProto().Clone()
	c.MetaStore = nil
	return r.BoltSnapshot.CreateNode(ctx, c, updateIfExists)
}

func (r *routerLike) CreateMetadata(ctx context.Context, node tree.N, namespace, jsonValue string) error {
	r.record("create", node, namespace)
	return r.BoltSnapshot.CreateMetadata(ctx, node, namespace, jsonValue)
}

func (r *routerLike) UpdateMetadata(ctx context.Context, node tree.N, namespace, jsonValue string) error {
	r.record("update", node, namespace)
	return r.BoltSnapshot.UpdateMetadata(ctx, node, namespace, jsonValue)
}

func (r *routerLike) DeleteMetadata(ctx context.Context, node tree.N, namespace string) error {
	r.record("delete", node, namespace)
	return r.BoltSnapshot.DeleteMetadata(ctx, node, namespace)
}

// openSnap opens (or reopens: a sync shutdown closes its endpoints) a bolt
// snapshot endpoint exposing usermeta-* metadata.
func openSnap(t *testing.T, file string) *snapshot.BoltSnapshot {
	t.Helper()
	ep, err := endpoints.OpenEndpoint(context.Background(), "snapshot://"+file+"?createBucket=true&metadataGlobs=usermeta-*")
	So(err, ShouldBeNil)
	return ep.(*snapshot.BoltSnapshot)
}

// runMetaSync runs one left-to-right sync to completion and returns its
// patch (with processing errors, if any).
func runMetaSync(t *testing.T, left, right model.Endpoint, dryRun bool) merger.Patch {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	statuses, done, events := make(chan model.Status), make(chan interface{}), make(chan interface{})
	finished := make(chan struct{})
	go func() {
		for {
			select {
			case <-statuses:
			case <-events:
			case <-done:
				close(finished)
				return
			case <-ctx.Done():
				return
			}
		}
	}()
	s := NewSync(left, right, model.DirectionRight)
	s.SetupEventsChan(statuses, done, events)
	s.Start(ctx, false)
	defer s.Shutdown()
	st, err := s.Run(ctx, dryRun, true)
	So(err, ShouldBeNil)
	select {
	case <-finished:
	case <-ctx.Done():
		t.Fatal("sync did not finish")
	}
	p, ok := st.(merger.Patch)
	So(ok, ShouldBeTrue)
	return p
}

func pendingOps(p merger.Patch) int {
	p.Filter(context.Background())
	n := 0
	p.WalkOperations([]merger.OperationType{}, func(merger.Operation) { n++ })
	return n
}

func TestSyncMetadataOfNewNodes(t *testing.T) {
	ctx := context.Background()

	Convey("Given a source exposing metadata and a router-like target", t, func() {
		dir := t.TempDir()
		leftFile, rightFile := filepath.Join(dir, "left.db"), filepath.Join(dir, "right.db")
		left := openSnap(t, leftFile)
		So(left.CreateNode(ctx, &tree.Node{Path: "a", Uuid: "fa", Type: tree.NodeType_COLLECTION, Etag: "-1",
			MetaStore: map[string]string{"usermeta-x": `"folder"`}}, true), ShouldBeNil)
		So(left.CreateNode(ctx, &tree.Node{Path: "a/f", Uuid: "f1", Type: tree.NodeType_LEAF, Etag: "h1", Size: 1,
			MetaStore: map[string]string{"usermeta-x": `"file"`, "other": `"ignored"`}}, true), ShouldBeNil)
		left.Close()
		right := &routerLike{}

		// run syncs left to right once. Snapshots are reopened for each run: the
		// sync shutdown closes its endpoints (and a snapshot close takes ~1s).
		run := func(dryRun bool) merger.Patch {
			right.BoltSnapshot = openSnap(t, rightFile)
			right.calls = nil
			return runMetaSync(t, openSnap(t, leftFile), right, dryRun) // Shutdown closes both
		}
		load := func(p string) tree.N {
			s := openSnap(t, rightFile)
			defer s.Close()
			n, err := s.LoadNode(ctx, p)
			So(err, ShouldBeNil)
			return n
		}
		noErrors := func(p merger.Patch) {
			errs, has := p.HasErrors()
			So(errs, ShouldBeEmpty)
			So(has, ShouldBeFalse)
		}

		Convey("one run creates files with their metadata, and a second run is a no-op", func() {
			noErrors(run(false))
			So(right.calls, ShouldContain, "create a/f/usermeta-x")

			f := load("a/f")
			So(f.GetMetaStore()["usermeta-x"], ShouldEqual, `"file"`)
			So(f.GetMetaStore(), ShouldNotContainKey, "other")
			So(load("a").GetMetaStore()["usermeta-x"], ShouldEqual, `"folder"`)

			So(pendingOps(run(true)), ShouldEqual, 0)
		})

		Convey("a moved folder keeps its metadata, without metadata deletes", func() {
			noErrors(run(false))

			l := openSnap(t, leftFile)
			So(l.MoveNode(ctx, "a", "b"), ShouldBeNil)
			l.Close()

			noErrors(run(false))
			for _, c := range right.calls {
				So(c, ShouldNotStartWith, "delete")
			}
			So(load("b/f").GetMetaStore()["usermeta-x"], ShouldEqual, `"file"`)
			So(load("b").GetMetaStore()["usermeta-x"], ShouldEqual, `"folder"`)

			So(pendingOps(run(true)), ShouldEqual, 0)
		})
	})
}
