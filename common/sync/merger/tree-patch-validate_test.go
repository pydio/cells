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

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

func TestTreePatch_Validate(t *testing.T) {

	Convey("Test TreePatch Validate", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		source.SetTestPathURI("source")
		target.SetTestPathURI("target")
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		create1 := &tree.Node{Path: "/create-ignored", Uuid: "u1", Etag: "etag"}
		mkdir1 := &tree.Node{Path: "/mkdir-ignored", Uuid: "dir", Type: tree.NodeType_COLLECTION}

		// Fill the target as if the patch has been already processed
		target.CreateNode(ctx, create1, false)
		target.CreateNode(ctx, mkdir1, false)

		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/ignored-delete",
			},
			Node:      &tree.Node{Path: "/ignored-delete"},
			Processed: true,
			Dir:       OperationDirRight,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create1.Path},
			Node:      create1,
			Processed: true,
			Dir:       OperationDirRight,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFolder,
			EventInfo: model.EventInfo{Path: mkdir1.Path},
			Node:      mkdir1,
			Processed: true,
			Dir:       OperationDirRight,
		})

		e := patch.Validate(ctx)
		So(e, ShouldBeNil)

	})

	Convey("Test TreePatch Validate with Cache", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDBWithCacheTest()
		source.SetTestPathURI("source")
		target.SetTestPathURI("target")
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		create1 := &tree.Node{Path: "/create-ignored", Uuid: "u1", Etag: "etag"}
		mkdir1 := &tree.Node{Path: "/mkdir-ignored", Uuid: "dir", Type: tree.NodeType_COLLECTION}

		// Fill the target as if the patch has been already processed
		target.CreateNode(ctx, create1, false)
		target.CreateNode(ctx, mkdir1, false)

		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/ignored-delete",
			},
			Node:      &tree.Node{Path: "/ignored-delete"},
			Processed: true,
			Dir:       OperationDirRight,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create1.Path},
			Node:      create1,
			Processed: true,
			Dir:       OperationDirRight,
		})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFolder,
			EventInfo: model.EventInfo{Path: mkdir1.Path},
			Node:      mkdir1,
			Processed: true,
			Dir:       OperationDirRight,
		})

		e := patch.Validate(ctx)
		So(e, ShouldBeNil)

	})

	Convey("Test TreePatch Validate Fail", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		source.SetTestPathURI("source")
		target.SetTestPathURI("target")
		create1 := &tree.Node{Path: "/create-ignored", Uuid: "u1", Etag: "etag"}
		mkdir1 := &tree.Node{Path: "/mkdir-ignored", Uuid: "dir", Type: tree.NodeType_COLLECTION}
		delete1 := &tree.Node{Path: "/delete", Uuid: "del", Etag: "del"}

		// The target has not been processed
		target.CreateNode(ctx, delete1, false)

		patch := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		patch.Enqueue(&patchOperation{
			OpType:    OpDelete,
			EventInfo: model.EventInfo{Path: delete1.Path},
			Node:      delete1,
			Processed: true,
			Dir:       OperationDirRight,
		})
		e := patch.Validate(ctx)
		So(e, ShouldNotBeNil)

		patch = newTreePatch(source, target, PatchOptions{MoveDetection: false})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create1.Path},
			Node:      create1,
			Processed: true,
			Dir:       OperationDirRight,
		})
		e = patch.Validate(ctx)
		So(e, ShouldNotBeNil)

		patch = newTreePatch(source, target, PatchOptions{MoveDetection: false})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFolder,
			EventInfo: model.EventInfo{Path: mkdir1.Path},
			Node:      mkdir1,
			Processed: true,
			Dir:       OperationDirRight,
		})
		e = patch.Validate(ctx)
		So(e, ShouldNotBeNil)

		// MoveFile : source (/delete) is still present
		patch = newTreePatch(source, target, PatchOptions{MoveDetection: false})
		patch.Enqueue(&patchOperation{
			OpType:    OpMoveFile,
			EventInfo: model.EventInfo{Path: "/delete-target"},
			Node:      delete1,
			Processed: true,
			Dir:       OperationDirRight,
		})
		target.CreateNode(ctx, &tree.Node{Path: "/delete-target"}, false)
		e = patch.Validate(ctx)
		So(e, ShouldNotBeNil)

		// MoveFile : target is not found still present
		patch = newTreePatch(source, target, PatchOptions{MoveDetection: false})
		patch.Enqueue(&patchOperation{
			OpType:    OpMoveFile,
			EventInfo: model.EventInfo{Path: "/move-target"},
			Node:      &tree.Node{Path: "/move-source"},
			Processed: true,
			Dir:       OperationDirRight,
		})
		e = patch.Validate(ctx)
		So(e, ShouldNotBeNil)

		// CreateFile: etag differ
		createdWrong := create1.Clone()
		createdWrong.Etag = "wrong-etag"
		target.CreateNode(ctx, createdWrong, false)
		patch = newTreePatch(source, target, PatchOptions{MoveDetection: false})
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: create1.Path},
			Node:      create1,
			Processed: true,
			Dir:       OperationDirRight,
		})
		e = patch.Validate(ctx)
		So(e, ShouldNotBeNil)

	})

}
