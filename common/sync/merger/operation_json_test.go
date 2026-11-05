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
	"os"
	"testing"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
	json "github.com/pydio/cells/v5/common/utils/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

// unmarshalOp decodes an operation the way cells-sync PatchStore.Load does.
func unmarshalOp(data []byte) (Operation, error) {
	op := NewOpForUnmarshall()
	err := json.Unmarshal(data, &op)
	return op, err
}

func TestOperationJSON_V4Golden(t *testing.T) {
	Convey("Operations serialized by v4 (cells-sync patch store) must still decode", t, func() {
		data, er := os.ReadFile("testdata/operations-v4.json")
		So(er, ShouldBeNil)
		var golden map[string]json.RawMessage
		So(json.Unmarshal(data, &golden), ShouldBeNil)

		Convey("Processed create with status and metadata", func() {
			op, er := unmarshalOp(golden["create"])
			So(er, ShouldBeNil)
			So(op.Type(), ShouldEqual, OpCreateFile)
			So(op.IsProcessed(), ShouldBeTrue)
			So(op.GetRefPath(), ShouldEqual, "folder/a.txt")
			n := op.GetNode()
			So(n, ShouldNotBeNil)
			So(n.GetUuid(), ShouldEqual, "uuid-a")
			So(n.GetPath(), ShouldEqual, "folder/a.txt")
			So(n.IsLeaf(), ShouldBeTrue)
			So(n.GetEtag(), ShouldEqual, "etag-a")
			So(n.GetSize(), ShouldEqual, 42)
			So(n.GetMTime(), ShouldEqual, 1700000000)
			So(n.GetStringMeta("name"), ShouldEqual, "a.txt")
			ei := op.(*patchOperation).EventInfo
			So(ei.Type, ShouldEqual, model.EventCreate)
			So(ei.OperationId, ShouldEqual, "op-1")
			So(ei.Metadata["X-Pydio-Session"], ShouldEqual, "sess")
			So(ei.ScanSourceNode, ShouldBeNil)
			So(ei.MoveSource, ShouldBeNil)
			So(ei.MoveTarget, ShouldBeNil)
			So(op.GetStatus(), ShouldNotBeNil)
			So(op.GetStatus().String(), ShouldEqual, "Transferred file")
			So(op.Error(), ShouldBeNil)
		})

		Convey("Move keeps origin, source and target nodes", func() {
			op, er := unmarshalOp(golden["move"])
			So(er, ShouldBeNil)
			So(op.Type(), ShouldEqual, OpMoveFile)
			So(op.GetRefPath(), ShouldEqual, "folder/a.txt")
			So(op.GetMoveOriginPath(), ShouldEqual, "folder/old.txt")
			ei := op.(*patchOperation).EventInfo
			So(ei.MoveSource, ShouldNotBeNil)
			So(ei.MoveSource.GetPath(), ShouldEqual, "folder/old.txt")
			So(ei.MoveTarget, ShouldNotBeNil)
			So(ei.MoveTarget.GetPath(), ShouldEqual, "folder/a.txt")
		})

		Convey("Scan event keeps its source node", func() {
			op, er := unmarshalOp(golden["scan"])
			So(er, ShouldBeNil)
			So(op.Type(), ShouldEqual, OpCreateFolder)
			So(op.IsScanEvent(), ShouldBeTrue)
			So(op.GetNode().IsLeaf(), ShouldBeFalse)
			So(op.(*patchOperation).EventInfo.ScanSourceNode, ShouldNotBeNil)
			So(op.(*patchOperation).EventInfo.ScanSourceNode.GetUuid(), ShouldEqual, "uuid-f")
		})

		Convey("Failed operation keeps its error", func() {
			op, er := unmarshalOp(golden["failed"])
			So(er, ShouldBeNil)
			So(op.Type(), ShouldEqual, OpDelete)
			So(op.Error(), ShouldNotBeNil)
			So(op.Error().Error(), ShouldEqual, "permission denied")
			So(op.GetStatus(), ShouldNotBeNil)
			So(op.GetStatus().IsError(), ShouldBeTrue)
		})

		Convey("v4 conflicts lost their details but must still decode as a conflict", func() {
			op, er := unmarshalOp(golden["conflict"])
			So(er, ShouldBeNil)
			So(op.Type(), ShouldEqual, OpConflict)
			So(op.GetNode().GetPath(), ShouldEqual, "folder/a.txt")
		})
	})
}

func TestOperationJSON_RoundTrip(t *testing.T) {
	Convey("Operations survive a marshal/unmarshal round trip", t, func() {
		patch := newTreePatch(memory.NewMemDB(), memory.NewMemDB(), PatchOptions{})
		src := &tree.Node{Uuid: "u", Path: "d/old", Type: tree.NodeType_LEAF, Etag: "e"}
		tgt := &tree.Node{Uuid: "u", Path: "d/new", Type: tree.NodeType_LEAF, Etag: "e"}
		move := NewOperation(OpMoveFile, model.EventInfo{Path: "d/new", Type: model.EventSureMove, MoveSource: src, MoveTarget: tgt}, src)
		patch.Enqueue(move)
		move.Status(model.NewProcessingStatus("Moving").SetError(errors.New("boom")))

		data, er := json.Marshal(move)
		So(er, ShouldBeNil)
		back, er := unmarshalOp(data)
		So(er, ShouldBeNil)
		So(back.Type(), ShouldEqual, OpMoveFile)
		So(back.GetRefPath(), ShouldEqual, "d/new")
		So(back.GetMoveOriginPath(), ShouldEqual, "d/old")
		So(back.Error(), ShouldNotBeNil)
		So(back.Error().Error(), ShouldEqual, "boom")
		ei := back.(*patchOperation).EventInfo
		So(ei.MoveSource.GetPath(), ShouldEqual, "d/old")
		So(ei.MoveTarget.GetPath(), ShouldEqual, "d/new")
		So(ei.ScanSourceNode, ShouldBeNil)

		Convey("An operation without node keeps a nil node", func() {
			op := NewOperation(OpDelete, model.EventInfo{Path: "x"})
			data, er := json.Marshal(op)
			So(er, ShouldBeNil)
			back, er := unmarshalOp(data)
			So(er, ShouldBeNil)
			So(back.GetNode(), ShouldBeNil)
		})
	})
}

func TestConflictOperationJSON(t *testing.T) {
	Convey("Conflict operations serialize their type and both sides", t, func() {
		n := &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "L"}
		left := NewOperation(OpUpdateFile, model.EventInfo{Path: "a.txt"}, n)
		right := NewOperation(OpUpdateFile, model.EventInfo{Path: "a.txt"}, &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "R"})
		c := NewConflictOperation(n, ConflictFileContent, left, right)

		data, er := json.Marshal(c)
		So(er, ShouldBeNil)

		Convey("Decodes as a plain operation (cells-sync first pass)", func() {
			op, er := unmarshalOp(data)
			So(er, ShouldBeNil)
			So(op.Type(), ShouldEqual, OpConflict)
			So(op.GetNode().GetEtag(), ShouldEqual, "L")
		})

		Convey("Exposes ConflictType, LeftOp, RightOp keys (cells-sync unmarshalConflict)", func() {
			var raw map[string]json.RawMessage
			So(json.Unmarshal(data, &raw), ShouldBeNil)
			var ct ConflictType
			So(json.Unmarshal(raw["ConflictType"], &ct), ShouldBeNil)
			So(ct, ShouldEqual, ConflictFileContent)
			l, er := unmarshalOp(raw["LeftOp"])
			So(er, ShouldBeNil)
			So(l.GetNode().GetEtag(), ShouldEqual, "L")
			r, er := unmarshalOp(raw["RightOp"])
			So(er, ShouldBeNil)
			So(r.GetNode().GetEtag(), ShouldEqual, "R")
		})

		Convey("Conflicts without side operations still serialize", func() {
			data, er := json.Marshal(NewConflictOperation(n, ConflictFolderUUID, nil, nil))
			So(er, ShouldBeNil)
			op, er := unmarshalOp(data)
			So(er, ShouldBeNil)
			So(op.Type(), ShouldEqual, OpConflict)
		})
	})
}
