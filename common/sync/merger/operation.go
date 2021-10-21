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
	"fmt"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type patchOperation struct {
	OpType    OperationType
	Dir       OperationDirection
	Node      *tree.Node
	EventInfo model.EventInfo

	InternalStatus *model.ProcessingStatus
	Processed      bool

	processingError       error
	ProcessingErrorString string // for marshalling/unmarshalling

	patch Patch
}

type conflictOperation struct {
	patchOperation
	ConflictType ConflictType
	LeftOp       Operation
	RightOp      Operation
}

func NewOperation(t OperationType, e model.EventInfo, loadedNode ...*tree.Node) Operation {
	o := &patchOperation{
		OpType:    t,
		EventInfo: e,
		Dir:       OperationDirDefault,
	}
	if len(loadedNode) > 0 {
		o.Node = loadedNode[0]
	}
	return o
}

func NewConflictOperation(node *tree.Node, t ConflictType, left, right Operation) Operation {
	return &conflictOperation{
		patchOperation: patchOperation{
			OpType: OpConflict,
			Node:   node,
			Dir:    OperationDirDefault,
		},
		ConflictType: t,
		LeftOp:       left,
		RightOp:      right,
	}
}

func (c *conflictOperation) ConflictInfo() (t ConflictType, left Operation, right Operation) {
	return c.ConflictType, c.LeftOp, c.RightOp
}

func (c *conflictOperation) Clone(replaceType ...OperationType) Operation {
	return NewConflictOperation(c.Node, c.ConflictType, c.LeftOp, c.RightOp)
}

func (o *patchOperation) Clone(replaceType ...OperationType) Operation {
	op := &patchOperation{
		OpType:    o.OpType,
		EventInfo: o.EventInfo,
		Node:      o.Node,
		Dir:       o.Dir,
	}
	if len(replaceType) > 0 {
		op.OpType = replaceType[0]
	}
	return op
}

func NewOpForUnmarshall() Operation {
	return &patchOperation{}
}

func (o *patchOperation) IsTypeMove() bool {
	return o.OpType == OpMoveFolder || o.OpType == OpMoveFile
}

func (o *patchOperation) IsTypeData() bool {
	return o.OpType == OpCreateFile || o.OpType == OpUpdateFile
}

func (o *patchOperation) IsTypePath() bool {
	return o.OpType == OpCreateFolder || o.OpType == OpDelete || o.IsTypeMove()
}

func (o *patchOperation) SetProcessed() {
	o.Processed = true
}

func (o *patchOperation) IsProcessed() bool {
	return o.Processed
}

func (o *patchOperation) CleanError() {
	o.processingError = nil
	o.ProcessingErrorString = ""
}

func (o *patchOperation) Error() error {
	// May have been unmarshalled from string
	if o.processingError == nil && o.ProcessingErrorString != "" {
		o.processingError = fmt.Errorf(o.ProcessingErrorString)
	}
	return o.processingError
}

func (o *patchOperation) ErrorString() string {
	return o.ProcessingErrorString
}

func (o *patchOperation) SetDirection(direction OperationDirection) Operation {
	o.Dir = direction
	return o
}

func (o *patchOperation) Status(status model.Status) {
	// Transform status to ProcessingStatus
	if p, ok := status.(*model.ProcessingStatus); ok {
		o.InternalStatus = p
	}
	if status.IsError() {
		o.processingError = status.Error()
		o.ProcessingErrorString = status.Error().Error()
	}
	o.patch.Status(status)
}

func (o *patchOperation) GetStatus() model.Status {
	// This is super important!
	// nil struct model.ProcessingStatus is NOT nil interface model.Status
	if o.InternalStatus == nil {
		return nil
	}
	return o.InternalStatus
}

func (o *patchOperation) GetRefPath() string {
	return o.EventInfo.Path
}

func (o *patchOperation) UpdateRefPath(p string) {
	o.EventInfo.Path = p
	// If not a move, update underlying node path as well (otherwise use UpdateMoveOriginPath)
	if o.Node != nil && !o.IsTypeMove() {
		o.Node.Path = p
	}
}

func (o *patchOperation) GetMoveOriginPath() string {
	return o.Node.Path
}

func (o *patchOperation) UpdateMoveOriginPath(p string) {
	o.Node.Path = p
}

func (o *patchOperation) IsScanEvent() bool {
	return o.EventInfo.ScanEvent
}

func (o *patchOperation) SetNode(n *tree.Node) {
	o.Node = n
}

func (o *patchOperation) GetNode() *tree.Node {
	return o.Node
}

func (o *patchOperation) Type() OperationType {
	return o.OpType
}

func (o *patchOperation) UpdateType(t OperationType) {
	o.OpType = t
}

func (o *patchOperation) CreateContext(ctx context.Context) context.Context {
	return o.EventInfo.CreateContext(ctx)
}

func (o *patchOperation) Source() model.PathSyncSource {
	if o.Dir == OperationDirDefault || o.Dir == OperationDirRight {
		return o.patch.Source()
	} else {
		return o.patch.Target().(model.PathSyncSource)
	}
}

func (o *patchOperation) Target() model.PathSyncTarget {
	if o.Dir == OperationDirDefault || o.Dir == OperationDirRight {
		return o.patch.Target()
	} else {
		return o.patch.Source().(model.PathSyncTarget)
	}
}

func (o *patchOperation) AttachToPatch(p Patch) {
	o.patch = p
}

func (o *patchOperation) NodeFromSource(ctx context.Context) (node *tree.Node, err error) {
	if o.EventInfo.ScanEvent && o.EventInfo.ScanSourceNode != nil {
		node = o.EventInfo.ScanSourceNode
	} else {
		node, err = o.Source().LoadNode(o.CreateContext(ctx), o.GetRefPath())
	}
	if err == nil {
		o.Node = node
	}
	return
}

func (o *patchOperation) NodeInTarget(ctx context.Context, cache ...model.PathSyncSource) (node *tree.Node, found bool) {
	if o.Node != nil {
		// If deleteEvent has node, it is already loaded from a snapshot, no need to reload from target
		return o.Node, true
	} else {
		// Eventually load from a cached version of the target if it was loaded
		tgt, _ := model.AsPathSyncSource(o.Target())
		if len(cache) > 0 && cache[0] != nil {
			tgt = cache[0]
		}
		node, err := tgt.LoadNode(o.CreateContext(ctx), o.GetRefPath())
		if err != nil {
			return nil, false
		} else {
			return node, true
		}
	}
}

func (o *patchOperation) String() string {
	dir := ""
	if o.Dir == OperationDirRight {
		dir = " => "
	} else if o.Dir == OperationDirLeft {
		dir = " <= "
	}
	switch o.OpType {
	case OpMoveFolder:
		return "MoveFolder to " + o.GetRefPath() + dir
	case OpMoveFile:
		return "MoveFile to " + o.GetRefPath() + dir
	case OpCreateFile:
		return "CreateFile" + dir
	case OpCreateFolder:
		return "CreateFolder" + dir
	case OpUpdateFile:
		return "UpdateFile" + dir
	case OpDelete:
		return "Delete" + dir
	case OpRefreshUuid:
		return "RefreshUuid" + dir
	case OpCreateMeta, OpUpdateMeta, OpDeleteMeta:
		return o.OpType.String() + dir
	default:
		return "UnknownType" + dir
	}
}
