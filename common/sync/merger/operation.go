/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type OperationType int

const (
	OpCreateFile OperationType = iota
	OpUpdateFile
	OpCreateFolder
	OpMoveFolder
	OpMoveFile
	OpDelete
	OpRefreshUuid
)

func (t OperationType) String() string {
	switch t {
	case OpCreateFolder:
		return "CreateFolder"
	case OpCreateFile:
		return "CreateFile"
	case OpMoveFolder:
		return "MoveFolder"
	case OpMoveFile:
		return "MoveFile"
	case OpUpdateFile:
		return "UpdateFile"
	case OpDelete:
		return "Delete"
	case OpRefreshUuid:
		return "RefreshUuid"
	}
	return ""
}

type Operation struct {
	opType    OperationType
	node      *tree.Node
	eventInfo model.EventInfo
	processed bool
	patch     Patch
}

func NewOpFromEvent(t OperationType, e model.EventInfo, loadedNode ...*tree.Node) *Operation {
	o := &Operation{
		opType:    t,
		eventInfo: e,
	}
	if len(loadedNode) > 0 {
		o.node = loadedNode[0]
	}
	return o
}

func (o *Operation) Clone(replaceType ...OperationType) *Operation {
	op := &Operation{
		opType:    o.opType,
		eventInfo: o.eventInfo,
		node:      o.node,
	}
	if len(replaceType) > 0 {
		op.opType = replaceType[0]
	}
	return op
}

func (o *Operation) IsTypeMove() bool {
	return o.opType == OpMoveFolder || o.opType == OpMoveFile
}

func (o *Operation) IsTypeData() bool {
	return o.opType == OpCreateFile || o.opType == OpUpdateFile
}

func (o *Operation) IsTypePath() bool {
	return o.opType == OpCreateFolder || o.opType == OpDelete || o.IsTypeMove()
}

func (o *Operation) SetProcessed() {
	o.processed = true
}

func (o *Operation) IsProcessed() bool {
	return o.processed
}

func (o *Operation) Status(status ProcessStatus) {
	o.patch.Status(status)
}

func (o *Operation) GetRefPath() string {
	return o.eventInfo.Path
}

func (o *Operation) UpdateRefPath(p string) {
	o.eventInfo.Path = p
	// If not a move, update underlying node path as well (otherwise use UpdateMoveOriginPath)
	if o.node != nil && o.IsTypeMove() {
		o.node.Path = p
	}
}

func (o *Operation) GetMoveOriginPath() string {
	return o.node.Path
}

func (o *Operation) UpdateMoveOriginPath(p string) {
	o.node.Path = p
}

func (o *Operation) IsScanEvent() bool {
	return o.eventInfo.ScanEvent
}

func (o *Operation) SetNode(n *tree.Node) {
	o.node = n
}

func (o *Operation) GetNode() *tree.Node {
	return o.node
}

func (o *Operation) Type() OperationType {
	return o.opType
}

func (o *Operation) UpdateType(t OperationType) {
	o.opType = t
}

func (o *Operation) CreateContext(ctx context.Context) context.Context {
	return o.eventInfo.CreateContext(ctx)
}

func (o *Operation) Source() model.PathSyncSource {
	return o.patch.Source()
}

func (o *Operation) Target() model.PathSyncTarget {
	return o.patch.Target()
}

func (o *Operation) AttachToPatch(p Patch) {
	o.patch = p
}

func (o *Operation) NodeFromSource(ctx context.Context) (node *tree.Node, err error) {
	if o.eventInfo.ScanEvent && o.eventInfo.ScanSourceNode != nil {
		node = o.eventInfo.ScanSourceNode
	} else {
		node, err = o.Source().LoadNode(o.CreateContext(ctx), o.GetRefPath())
	}
	if err == nil {
		o.node = node
	}
	return
}

func (o *Operation) NodeInTarget(ctx context.Context) (node *tree.Node, found bool) {
	if o.node != nil {
		// If deleteEvent has node, it is already loaded from a snapshot, no need to reload from target
		return o.node, true
	} else {
		node, err := o.Target().LoadNode(o.CreateContext(ctx), o.GetRefPath())
		if err != nil {
			return nil, false
		} else {
			return node, true
		}
	}
}

func (o *Operation) String() string {
	switch o.opType {
	case OpMoveFolder:
		return "MoveFolder to " + o.GetRefPath()
	case OpMoveFile:
		return "MoveFile to " + o.GetRefPath()
	case OpCreateFile:
		return "CreateFile"
	case OpCreateFolder:
		return "CreateFolder"
	case OpUpdateFile:
		return "UpdateFile"
	case OpDelete:
		return "Delete"
	case OpRefreshUuid:
		return "RefreshUuid"
	default:
		return "UnknownType"
	}
}
