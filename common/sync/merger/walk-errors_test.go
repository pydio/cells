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

package merger

import (
	"context"
	"errors"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

// failingWalkSource is a MemDB whose Walk reports an error after listing its nodes, the way
// endpoints report a node they cannot read: with or without its path, and a nil node.
type failingWalkSource struct {
	*memory.MemDB
	errPath string
}

func (f *failingWalkSource) Walk(ctx context.Context, fn model.WalkNodesFunc, root string, recursive bool) error {
	if e := f.MemDB.Walk(ctx, fn, root, recursive); e != nil {
		return e
	}
	return fn(f.errPath, nil, errors.New("permission denied"))
}

func TestWalkErrorsAbortTheDiff(t *testing.T) {
	ctx := context.Background()
	for _, errPath := range []string{"", "b.txt"} {
		Convey("A walk error reported with path '"+errPath+"' fails the tree loading", t, func() {
			src := &failingWalkSource{MemDB: memory.NewMemDB(), errPath: errPath}
			_ = src.CreateNode(ctx, &tree.Node{Path: "/a.txt", Type: tree.NodeType_LEAF, Etag: "e"}, false)
			var e error
			So(func() { _, e = TreeNodeFromSource(ctx, src, "/", nil, nil) }, ShouldNotPanic)
			So(e, ShouldNotBeNil)
		})
	}

	Convey("A walk error on one side fails the diff instead of deleting the unread nodes on the other side", t, func() {
		left := &failingWalkSource{MemDB: memory.NewMemDB()}
		right := memory.NewMemDB()
		for _, db := range []model.PathSyncTarget{left, right} {
			_ = db.CreateNode(ctx, &tree.Node{Path: "/a.txt", Type: tree.NodeType_LEAF, Etag: "e"}, false)
		}
		_ = right.CreateNode(ctx, &tree.Node{Path: "/b.txt", Type: tree.NodeType_LEAF, Etag: "f"}, false)
		diff := newTreeDiff(left, right)
		e := diff.Compute(ctx, "/", nil, nil)
		patch := NewPatch(left, right, PatchOptions{})
		_ = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, patch)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldBeEmpty)
		So(e, ShouldNotBeNil)
	})
}
