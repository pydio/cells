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
	"sync"
	"sync/atomic"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

var metadataTypes = []merger.OperationType{merger.OpCreateMeta, merger.OpUpdateMeta, merger.OpDeleteMeta}

// metadataParent returns the node a metadata operation applies to
func metadataParent(operation merger.Operation) (*tree.Node, error) {
	opNode := operation.GetNode()
	if opNode == nil {
		return nil, errors.New("cannot find operation node for operating on metadata")
	}
	protoNode := opNode.AsProto()
	parentUuid := protoNode.GetStringMeta(merger.MetaNodeParentUUIDMeta)
	parentPath := protoNode.GetStringMeta(merger.MetaNodeParentPathMeta)
	if parentUuid == "" {
		return nil, errors.New("cannot find parent Uuid for operating on Metadata")
	}
	if parentPath == "" {
		// Metadata always belong to a non-root node: an empty path means the parent path could not
		// be decoded, and must not resolve to the endpoint root.
		return nil, errors.New("cannot find parent Path for operating on Metadata")
	}
	return &tree.Node{Uuid: parentUuid, Path: parentPath}, nil
}

// processMetadata applies the Metadata operations (OpCreateMeta, OpUpdateMeta, OpDeleteMeta)
func (pr *Processor) processMetadata(canceler context.Context, operation merger.Operation, operationId string, progress chan int64) error {
	if mr, ok := operation.Target().(model.MetadataReceiver); ok {
		parent, err := metadataParent(operation)
		if err != nil {
			return err
		}
		opNode := operation.GetNode()
		switch operation.Type() {
		case merger.OpCreateMeta:
			return mr.CreateMetadata(canceler, parent, path.Base(opNode.GetPath()), opNode.GetEtag())
		case merger.OpUpdateMeta:
			return mr.UpdateMetadata(canceler, parent, path.Base(opNode.GetPath()), opNode.GetEtag())
		case merger.OpDeleteMeta:
			return mr.DeleteMetadata(canceler, parent, path.Base(opNode.GetPath()))
		default:
			// ignore
		}
	}
	return nil
}

// processMetadataBatches applies the metadata operations with one call per node instead of one per value,
// processing nodes in parallel.
func (pr *Processor) processMetadataBatches(ctx context.Context, patch merger.Patch, br model.MetadataBatchReceiver, interrupted *atomic.Bool) {
	type batch struct {
		node    *tree.Node
		ops     []merger.Operation
		values  map[string]string
		deleted []string
	}
	var batches []*batch
	byNode := make(map[string]*batch)
	patch.WalkOperations(metadataTypes, func(op merger.Operation) {
		if op.IsProcessed() {
			return
		}
		parent, err := metadataParent(op)
		if err != nil {
			op.Status(model.NewProcessingStatus("Error while updating metadata").SetError(err))
			return
		}
		b, ok := byNode[parent.Uuid]
		if !ok {
			b = &batch{node: parent, values: make(map[string]string)}
			byNode[parent.Uuid] = b
			batches = append(batches, b)
		}
		namespace := path.Base(op.GetNode().GetPath())
		if op.Type() == merger.OpDeleteMeta {
			b.deleted = append(b.deleted, namespace)
		} else {
			b.values[namespace] = op.GetNode().GetEtag()
		}
		b.ops = append(b.ops, op)
	})

	wg := &sync.WaitGroup{}
	throttle := make(chan struct{}, pr.QueueSize)
	for _, b := range batches {
		if interrupted.Load() {
			break
		}
		wg.Add(1)
		throttle <- struct{}{}
		go func() {
			defer func() {
				<-throttle
				wg.Done()
			}()
			err := br.ApplyMetadata(ctx, b.node, b.values, b.deleted)
			msg := "Updated metadata"
			fields := []zapcore.Field{zap.String(common.KeyNodePath, b.node.GetPath()), zap.Int("count", len(b.ops))}
			if err != nil {
				msg = "Error while updating metadata"
				fields = append(fields, zap.Error(err))
				if !pr.Silent {
					pr.Logger().Error(msg, fields...)
				}
			} else if !pr.Silent {
				pr.Logger().Info(msg, fields...)
			}
			for _, op := range b.ops {
				if err == nil {
					op.SetProcessed()
				}
				op.Status(model.NewProcessingStatus(pr.logAsString(msg, err, fields...)).SetError(err))
			}
		}()
	}
	wg.Wait()
}
