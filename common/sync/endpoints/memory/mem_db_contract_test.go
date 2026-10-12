/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package memory

import (
	"testing"
	"time"

	"go.uber.org/goleak"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

func contractDB() *MemDB {
	db := NewMemDB()
	for _, n := range []*tree.Node{
		{Path: "/a", Type: tree.NodeType_COLLECTION, Uuid: "ua"},
		{Path: "/a/b", Type: tree.NodeType_COLLECTION, Uuid: "uab"},
		{Path: "/a/b/c.txt", Type: tree.NodeType_LEAF, Etag: "e1"},
		{Path: "/a/d.txt", Type: tree.NodeType_LEAF, Etag: "e2"},
		{Path: "/ab", Type: tree.NodeType_COLLECTION, Uuid: "uab2"},
		{Path: "/ab/e.txt", Type: tree.NodeType_LEAF, Etag: "e3"},
	} {
		_ = db.CreateNode(memTestCtx, n, false)
	}
	return db
}

func walkPaths(db *MemDB, root string, recursive bool) []string {
	var pp []string
	_ = db.Walk(memTestCtx, func(path string, node tree.N, err error) error {
		pp = append(pp, path)
		return nil
	}, root, recursive)
	return pp
}

func TestMemDBWalkContract(t *testing.T) {
	Convey("Walk on a sub-root does not leak into siblings sharing the same prefix", t, func() {
		So(walkPaths(contractDB(), "a", true), ShouldResemble, []string{"/a", "/a/b", "/a/b/c.txt", "/a/d.txt"})
		So(walkPaths(contractDB(), "/a/", true), ShouldResemble, []string{"/a", "/a/b", "/a/b/c.txt", "/a/d.txt"})
	})
	Convey("Non-recursive Walk lists all direct children, not stopping at the first nested path", t, func() {
		So(walkPaths(contractDB(), "a", false), ShouldResemble, []string{"/a", "/a/b", "/a/d.txt"})
		So(walkPaths(contractDB(), "/", false), ShouldResemble, []string{"/", "/a", "/ab"})
	})
	Convey("Walk callback may write to the same DB without deadlocking", t, func() {
		db := contractDB()
		done := make(chan error)
		go func() {
			done <- db.Walk(memTestCtx, func(path string, node tree.N, err error) error {
				if path == "/a/d.txt" {
					return db.CreateNode(memTestCtx, &tree.Node{Path: "/a/f.txt", Type: tree.NodeType_LEAF}, false)
				}
				return nil
			}, "a", true)
		}()
		select {
		case e := <-done:
			So(e, ShouldBeNil)
		case <-time.After(2 * time.Second):
			t.Fatal("Walk deadlocked")
		}
	})
}

func TestMemDBLoadNodeContract(t *testing.T) {
	Convey("LoadNode returns a typed NodeNotFound error", t, func() {
		_, e := contractDB().LoadNode(memTestCtx, "/missing")
		So(e, ShouldNotBeNil)
		So(errors.Is(e, errors.NodeNotFound), ShouldBeTrue)
	})
}

func TestMemDBMoveNodeContract(t *testing.T) {
	Convey("MoveNode works with mixed leading slashes and keeps children", t, func() {
		db := contractDB()
		So(db.MoveNode(memTestCtx, "a", "z"), ShouldBeNil)
		n, e := db.LoadNode(memTestCtx, "z/b/c.txt")
		So(e, ShouldBeNil)
		So(n.GetPath(), ShouldEqual, "/z/b/c.txt")
		_, e = db.LoadNode(memTestCtx, "a/b/c.txt")
		So(errors.Is(e, errors.NodeNotFound), ShouldBeTrue)
		_, e = db.LoadNode(memTestCtx, "ab/e.txt")
		So(e, ShouldBeNil)
	})
	Convey("MoveNode does not mutate nodes previously handed out", t, func() {
		db := contractDB()
		before, _ := db.LoadNode(memTestCtx, "/a/d.txt")
		So(db.MoveNode(memTestCtx, "/a", "/z"), ShouldBeNil)
		So(before.GetPath(), ShouldEqual, "/a/d.txt")
	})
}

func nextEvent(t *testing.T, wo *model.WatchObject) model.EventInfo {
	select {
	case ev := <-wo.Events():
		return ev
	case <-time.After(2 * time.Second):
		t.Fatal("timeout waiting for watch event")
	}
	return model.EventInfo{}
}

func TestMemDBWatchContract(t *testing.T) {
	Convey("Watch emits create, move and delete events", t, func() {
		defer goleak.VerifyNone(t, goleak.IgnoreCurrent())
		db := NewMemDB()
		wo, er := db.Watch(memTestCtx, "")
		So(er, ShouldBeNil)

		So(db.CreateNode(memTestCtx, &tree.Node{Path: "/f", Type: tree.NodeType_COLLECTION}, false), ShouldBeNil)
		ev := nextEvent(t, wo)
		So(ev.Type, ShouldEqual, model.EventCreate)
		So(ev.Path, ShouldEqual, "/f")
		So(ev.Folder, ShouldBeTrue)

		So(db.CreateNode(memTestCtx, &tree.Node{Path: "/f/x.txt", Type: tree.NodeType_LEAF, Etag: "e"}, false), ShouldBeNil)
		ev = nextEvent(t, wo)
		So(ev.Path, ShouldEqual, "/f/x.txt")
		So(ev.Folder, ShouldBeFalse)
		So(ev.Etag, ShouldEqual, "e")

		So(db.MoveNode(memTestCtx, "/f/x.txt", "/f/y.txt"), ShouldBeNil)
		ev = nextEvent(t, wo)
		So(ev.Type, ShouldEqual, model.EventSureMove)
		So(ev.Path, ShouldEqual, "/f/y.txt")
		So(ev.MoveSource, ShouldNotBeNil)
		So(ev.MoveSource.GetPath(), ShouldEqual, "/f/x.txt")
		So(ev.MoveTarget, ShouldNotBeNil)
		So(ev.MoveTarget.GetPath(), ShouldEqual, "/f/y.txt")

		So(db.DeleteNode(memTestCtx, "/f/y.txt"), ShouldBeNil)
		ev = nextEvent(t, wo)
		So(ev.Type, ShouldEqual, model.EventRemove)
		So(ev.Path, ShouldEqual, "/f/y.txt")

		// Stop the way sync-watcher does: blocking send on DoneChan
		wo.DoneChan <- true
		// Writes after the watcher stopped must not block
		So(db.CreateNode(memTestCtx, &tree.Node{Path: "/g", Type: tree.NodeType_COLLECTION}, false), ShouldBeNil)
	})

	Convey("Watch can also be stopped with Close, while events are pending", t, func() {
		defer goleak.VerifyNone(t, goleak.IgnoreCurrent())
		db := NewMemDB()
		wo, _ := db.Watch(memTestCtx, "")
		So(db.CreateNode(memTestCtx, &tree.Node{Path: "/h", Type: tree.NodeType_COLLECTION}, false), ShouldBeNil)
		wo.Close()
		for i := 0; i < 3; i++ {
			So(db.CreateNode(memTestCtx, &tree.Node{Path: "/i", Type: tree.NodeType_COLLECTION}, false), ShouldBeNil)
		}
	})
}
