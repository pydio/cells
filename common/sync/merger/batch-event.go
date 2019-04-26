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

type BatchOperationType int

const (
	OpCreateFile BatchOperationType = iota
	OpUpdateFile
	OpCreateFolder
	OpMoveFolder
	OpMoveFile
	OpDelete
	OpRefreshUuid
)

type BatchOperation struct {
	Key       string
	Type      BatchOperationType
	Node      *tree.Node
	EventInfo model.EventInfo
	Batch     Batch
}

func (e *BatchOperation) Source() model.PathSyncSource {
	return e.Batch.Source()
}

func (e *BatchOperation) Target() model.PathSyncTarget {
	return e.Batch.Target()
}

func (e *BatchOperation) NodeFromSource(ctx context.Context) (node *tree.Node, err error) {
	if e.EventInfo.ScanEvent && e.EventInfo.ScanSourceNode != nil {
		node = e.EventInfo.ScanSourceNode
	} else {
		node, err = e.Source().LoadNode(e.EventInfo.CreateContext(ctx), e.EventInfo.Path)
	}
	if err == nil {
		e.Node = node
	}
	return
}

func (e *BatchOperation) NodeInTarget(ctx context.Context) (node *tree.Node, found bool) {
	if e.Node != nil {
		// If deleteEvent has node, it is already loaded from a snapshot, no need to reload from target
		return e.Node, true
	} else {
		node, err := e.Target().LoadNode(e.EventInfo.CreateContext(ctx), e.EventInfo.Path)
		if err != nil {
			return nil, false
		} else {
			return node, true
		}
	}
}
