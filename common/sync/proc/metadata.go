package proc

import (
	"context"
	"fmt"
	"path"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

// processMetadata applies the Metadata operations (OpCreateMeta, OpUpdateMeta, OpDeleteMeta)
func (pr *Processor) processMetadata(canceler context.Context, operation merger.Operation, operationId string, progress chan int64) error {
	if mr, ok := operation.Target().(model.MetadataReceiver); ok {
		opNode := operation.GetNode()
		if opNode == nil {
			return fmt.Errorf("cannot find operation node for operating on metadata")
		}
		parentUuid := operation.GetNode().GetStringMeta(merger.MetaNodeParentUUIDMeta)
		if parentUuid == "" {
			return fmt.Errorf("cannot find parent Uuid for operating on Metadata")
		}
		parentPath := operation.GetNode().GetStringMeta(merger.MetaNodeParentPathMeta)
		switch operation.Type() {
		case merger.OpCreateMeta:
			return mr.CreateMetadata(canceler, &tree.Node{Uuid: parentUuid, Path: parentPath}, path.Base(opNode.GetPath()), opNode.Etag)
		case merger.OpUpdateMeta:
			return mr.UpdateMetadata(canceler, &tree.Node{Uuid: parentUuid, Path: parentPath}, path.Base(opNode.GetPath()), opNode.Etag)
		case merger.OpDeleteMeta:
			return mr.DeleteMetadata(canceler, &tree.Node{Uuid: parentUuid, Path: parentPath}, path.Base(opNode.GetPath()))
		}
	}
	return nil
}
