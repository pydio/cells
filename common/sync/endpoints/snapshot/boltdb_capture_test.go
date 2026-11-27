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

package snapshot

import (
	"context"
	"errors"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

// walkSource replays a fixed list of walk callbacks, like endpoints reporting the root
// with an empty path (index) or errors with a nil node (filesystem).
type walkSource struct {
	*memory.MemDB
	entries []walkEntry
}

type walkEntry struct {
	path string
	node tree.N
	err  error
}

func (w *walkSource) Walk(ctx context.Context, fn model.WalkNodesFunc, root string, recursive bool) error {
	for _, e := range w.entries {
		if er := fn(e.path, e.node, e.err); er != nil {
			return er
		}
	}
	return nil
}

func TestBoltSnapshotCapture(t *testing.T) {
	Convey("Capture skips the root node, reported with an empty path by some endpoints", t, func() {
		s, e := NewBoltSnapshot(context.Background(), t.TempDir(), "capture")
		So(e, ShouldBeNil)
		defer s.Close()
		src := &walkSource{MemDB: memory.NewMemDB(), entries: []walkEntry{
			{path: "", node: &tree.Node{Path: "", Type: tree.NodeType_COLLECTION, Etag: "-1"}},
			{path: "/", node: &tree.Node{Path: "/", Type: tree.NodeType_COLLECTION, Etag: "-1"}},
			{path: "a.txt", node: &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "e"}},
		}}
		So(s.Capture(context.Background(), src), ShouldBeNil)
		n, e := s.LoadNode(context.Background(), "a.txt")
		So(e, ShouldBeNil)
		So(n.GetEtag(), ShouldEqual, "e")
		var keys []string
		_ = s.Walk(context.Background(), func(p string, n tree.N, e error) error {
			keys = append(keys, p)
			return nil
		}, "/", true)
		So(keys, ShouldResemble, []string{"a.txt"})
	})

	Convey("Capture returns walk errors instead of panicking on their nil node", t, func() {
		s, e := NewBoltSnapshot(context.Background(), t.TempDir(), "capture")
		So(e, ShouldBeNil)
		defer s.Close()
		src := &walkSource{MemDB: memory.NewMemDB(), entries: []walkEntry{
			{path: "a.txt", node: &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "e"}},
			{path: "", node: nil, err: errors.New("permission denied")},
		}}
		var er error
		So(func() { er = s.Capture(context.Background(), src) }, ShouldNotPanic)
		So(er, ShouldNotBeNil)
	})
}
