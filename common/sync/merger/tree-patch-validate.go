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
	"sync"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
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
		branches := t.BranchesWithOperations(target)
		if len(branches) == 0 {
			return nil
		}
		// If we are validating with a cache, it's probably a remote server, and it has probably a small delay
		// => wait before first try
		<-time.After(1 * time.Second)
		t.Status(model.NewProcessingStatus("Validating modifications have been correctly reported...").SetProgress(1))
		return model.RetryWithCtx(ctx, func(retry int) error {
			return t.validateWithPreLoad(ctx, branches, syncSource)
		}, 6*time.Second, 4*time.Minute)

	} else {

		t.Status(model.NewProcessingStatus("Validating modifications have been correctly reported...").SetProgress(1))
		return t.validateWalking(ctx, target.GetEndpointInfo().URI, target)

	}

}

func (t *TreePatch) validateWithPreLoad(ctx context.Context, branches []string, target model.CachedBranchProvider) error {

	// Load remote tree in memory
	memDB, e := target.GetCachedBranches(ctx, branches...)
	if e != nil {
		return e
	}
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
		if valid > 0 {
			log.Logger(ctx).Info("All operations were validated", zap.Int("count", valid))
		}
		return nil
	} else {
		log.Logger(ctx).Info("There are still some operations not validated", zap.Int("count", len(errs)), zap.String("first error", errs[0].Error()))
		return errs[0]
	}

}

func (t *TreePatch) validateOperation(ctx context.Context, o Operation, target model.Endpoint) error {
	switch o.Type() {
	case OpCreateFile, OpCreateFolder, OpUpdateFile:
		if n, e := target.LoadNode(ctx, o.GetRefPath()); e != nil {
			return errors.New("cannot find node " + o.GetRefPath())
		} else if (o.Type() == OpUpdateFile || o.Type() == OpCreateFile) && n.GetEtag() != o.GetNode().GetEtag() {
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
