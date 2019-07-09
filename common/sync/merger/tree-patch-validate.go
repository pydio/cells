package merger

import (
	"context"
	"path"
	"sync"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/model"
)

// Validate tries to match the status of the target to verify that all operations are correctly applied.
func (t *TreePatch) Validate(ctx context.Context) error {
	wg := &sync.WaitGroup{}
	wg.Add(2)
	var e1, e2 error
	go func() {
		e1 = t.validateEndpoint(ctx, t.Target())
		wg.Done()
	}()
	go func() {
		e2 = t.validateEndpoint(ctx, t.Source())
		wg.Done()
	}()
	wg.Wait()
	if e1 != nil || e2 != nil {
		if e1 != nil {
			log.Logger(ctx).Error("Could not validate changes on target", zap.Error(e1))
		}
		if e2 != nil {
			log.Logger(ctx).Error("Could not validate changes on source", zap.Error(e2))
		}
		e := errors.New("errors detected while validating patch")
		t.Status(model.NewProcessingStatus("Errors detected while validating patch").SetError(e).SetProgress(1))
		return e
	} else {
		t.Status(model.NewProcessingStatus("Modification correctly reported").SetProgress(1))
		return nil
	}
}

func (t *TreePatch) validateEndpoint(ctx context.Context, target model.Endpoint) error {

	if syncSource, ok := target.(model.CachedBranchProvider); ok {

		// Find highest modified path
		var branches []string
		t.WalkToFirstOperations(OpUnknown, func(operation Operation) {
			branches = append(branches, path.Dir(operation.GetRefPath()))
		}, target)
		if len(branches) == 0 {
			return nil
		}
		// If we are validating with a cache, it's probably a remote server, and it has probably a small delay
		// => wait before first try
		<-time.After(1 * time.Second)
		t.Status(model.NewProcessingStatus("Validating modifications have been correctly reported...").SetProgress(1))
		return model.Retry(func() error {
			return t.validateWithPreLoad(ctx, branches, syncSource)
		}, 6*time.Second, 4*time.Minute)

	} else {

		t.Status(model.NewProcessingStatus("Validating modifications have been correctly reported...").SetProgress(1))
		return t.validateWalking(ctx, target.GetEndpointInfo().URI, target)

	}

}

func (t *TreePatch) validateWithPreLoad(ctx context.Context, branches []string, target model.CachedBranchProvider) error {

	// Load remote tree in memory
	memDB := target.GetCachedBranches(ctx, branches...)
	return t.validateWalking(ctx, target.GetEndpointInfo().URI, memDB)

}

func (t *TreePatch) validateWalking(ctx context.Context, targetUri string, target model.Endpoint) error {

	var errs []error
	var valid int
	t.WalkOperations([]OperationType{}, func(operation Operation) {
		if !operation.IsProcessed() || operation.Target().GetEndpointInfo().URI != targetUri {
			return
		}
		if e := t.validateOperation(ctx, operation, target); e != nil {
			log.Logger(ctx).Debug(
				"Operation not yet validated",
				zap.String("type", operation.Type().String()),
				zap.String("path", operation.GetRefPath()),
				zap.String("error", e.Error()))
			errs = append(errs, e)
		} else {
			valid++
			log.Logger(ctx).Debug(
				"Operation validated",
				zap.String("type", operation.Type().String()),
				zap.String("path", operation.GetRefPath()))
		}
	})
	if len(errs) == 0 {
		log.Logger(ctx).Info("All operations were validated", zap.Int("count", valid))
		return nil
	} else {
		log.Logger(ctx).Info("There are still some operations not validated", zap.Int("count", len(errs)))
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
