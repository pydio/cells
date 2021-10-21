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
	"testing"

	"github.com/pydio/cells/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/sync/endpoints/memory"
	"github.com/pydio/cells/common/sync/model"
)

func TestTreePatch_FilterToTarget(t *testing.T) {

	Convey("Test FilterToTarget", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		create1 := &tree.Node{Path: "/create-ignored", Uuid: "u1", Etag: "etag"}
		mkdir1 := &tree.Node{Path: "/mkdir-ignored", Uuid: "dir", Type: tree.NodeType_COLLECTION}
		create2 := &tree.Node{Path: "/create-valid", Uuid: "u2", Etag: "etag2"}

		// Put create1 already in target => will be ignored
		target.CreateNode(ctx, create1, false)
		target.CreateNode(ctx, mkdir1, false)

		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/ignored-delete",
			},
			Node: &tree.Node{Path: "/ignored-delete"},
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create1.Path},
			Node:      create1,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create2.Path},
			Node:      create2,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFolder,
			EventInfo: model.EventInfo{Path: mkdir1.Path},
			Node:      mkdir1,
		})
		// Before filter : 1 delete, 1 create
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 2)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 1)

		patch.FilterToTarget(ctx)

		// After filter : 0 delete, 0 create
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 0)

	})

	Convey("Test FilterToTarget on CachedBranchProvider", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDBWithCacheTest()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		create1 := &tree.Node{Path: "/create-ignored", Uuid: "u1", Etag: "etag"}
		mkdir1 := &tree.Node{Path: "/mkdir-ignored", Uuid: "dir", Type: tree.NodeType_COLLECTION}
		create2 := &tree.Node{Path: "/create-valid", Uuid: "u2", Etag: "etag2"}

		// Put create1 already in target => will be ignored
		target.CreateNode(ctx, create1, false)
		target.CreateNode(ctx, mkdir1, false)

		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/ignored-delete",
			},
			Node: &tree.Node{Path: "/ignored-delete"},
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create1.Path},
			Node:      create1,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create2.Path},
			Node:      create2,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFolder,
			EventInfo: model.EventInfo{Path: mkdir1.Path},
			Node:      mkdir1,
		})
		// Before filter : 1 delete, 1 create
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 2)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 1)

		patch.FilterToTarget(ctx)

		// After filter : 0 delete, 0 create
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 0)

	})

}
