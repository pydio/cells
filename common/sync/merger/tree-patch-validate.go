package merger

import (
	"context"
	"path"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/model"
)

func (t *TreePatch) Validate(ctx context.Context) error {
	if e := t.validateEndpoint(ctx, t.Target()); e != nil {
		return e
	}
	if e := t.validateEndpoint(ctx, t.Source()); e != nil {
		return e
	}
	return nil
}

func (t *TreePatch) validateEndpoint(ctx context.Context, target model.Endpoint) error {

	if syncSource, ok := target.(model.CachedBranchProvider); ok {

		// Find highest modified path
		var first Operation
		t.WalkToFirstOperations(OpUnknown, func(operation Operation) {
			first = operation
		}, target)
		if first == nil {
			return nil
		}

		return model.Retry(func() error {
			log.Logger(ctx).Info("Validating patch...")
			return t.validateWithPreLoad(ctx, first, syncSource)
		}, 8*time.Second, 4*time.Minute)

	} else {

		return t.validateWalking(ctx, target.GetEndpointInfo().URI, target)

	}

}

func (t *TreePatch) validateWithPreLoad(ctx context.Context, firstOp Operation, target model.CachedBranchProvider) error {

	loadPath := path.Dir(firstOp.GetRefPath())
	// Load remote tree in memory
	memDB := target.GetCachedBranch(ctx, loadPath)
	return t.validateWalking(ctx, target.GetEndpointInfo().URI, memDB)

}

func (t *TreePatch) validateWalking(ctx context.Context, targetUri string, target model.Endpoint) error {

	var errs []error
	t.WalkOperations([]OperationType{}, func(operation Operation) {
		if !operation.IsProcessed() || operation.Target().GetEndpointInfo().URI != targetUri {
			return
		}
		if e := t.validateOperation(ctx, operation, target); e != nil {
			log.Logger(ctx).Warn(
				"Operation not yet validated",
				zap.String("type", operation.Type().String()),
				zap.String("path", operation.GetRefPath()),
				zap.String("error", e.Error()))
			errs = append(errs, e)
		} else {
			log.Logger(ctx).Info(
				"Operation validated",
				zap.String("type", operation.Type().String()),
				zap.String("path", operation.GetRefPath()))
		}
	})
	if len(errs) == 0 {
		return nil
	} else {
		return errs[0]
	}

}

func (t *TreePatch) validateOperation(ctx context.Context, o Operation, target model.Endpoint) error {
	switch o.Type() {
	case OpCreateFile, OpCreateFolder, OpUpdateFile:
		if n, e := target.LoadNode(ctx, o.GetRefPath()); e != nil {
			return errors.New("cannot find node " + o.GetRefPath())
		} else if (o.Type() == OpUpdateFile || o.Type() == OpCreateFile) && n.Etag != o.GetNode().Etag {
			return errors.New("eTag are not similar")
		}
	case OpDelete:
		if n, e := target.LoadNode(ctx, o.GetRefPath()); e == nil && n != nil {
			return errors.New("can still find node " + o.GetRefPath())
		}
	case OpMoveFile, OpMoveFolder:
		if n, e := target.LoadNode(ctx, o.GetMoveOriginPath()); e == nil && n != nil {
			return errors.New("can still find source " + o.GetMoveOriginPath())
		}
		if n, e := target.LoadNode(ctx, o.GetRefPath()); e != nil || n == nil {
			return errors.New("cannot find target " + o.GetRefPath())
		}
	default:
		return nil
	}
	return nil
}
