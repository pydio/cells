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

package proc

import (
	"context"
	"path"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// processMetadata applies the Metadata operations (OpCreateMeta, OpUpdateMeta, OpDeleteMeta)
func (pr *Processor) processMetadata(canceler context.Context, operation merger.Operation, operationId string, progress chan int64) error {
	if mr, ok := operation.Target().(model.MetadataReceiver); ok {
		opNode := operation.GetNode()
		if opNode == nil {
			return errors.New("cannot find operation node for operating on metadata")
		}
		protoNode := &tree.Node{}
		var parentUuid, parentPath string
		if operation.GetNode().As(protoNode) {
			parentUuid = protoNode.GetStringMeta(merger.MetaNodeParentUUIDMeta)
			parentPath = protoNode.GetStringMeta(merger.MetaNodeParentPathMeta)
		}
		if parentUuid == "" {
			return errors.New("cannot find parent Uuid for operating on Metadata")
		}
		switch operation.Type() {
		case merger.OpCreateMeta:
			return mr.CreateMetadata(canceler, &tree.Node{Uuid: parentUuid, Path: parentPath}, path.Base(opNode.GetPath()), opNode.GetEtag())
		case merger.OpUpdateMeta:
			return mr.UpdateMetadata(canceler, &tree.Node{Uuid: parentUuid, Path: parentPath}, path.Base(opNode.GetPath()), opNode.GetEtag())
		case merger.OpDeleteMeta:
			return mr.DeleteMetadata(canceler, &tree.Node{Uuid: parentUuid, Path: parentPath}, path.Base(opNode.GetPath()))
		default:
			// ignore
		}
	}
	return nil
}
