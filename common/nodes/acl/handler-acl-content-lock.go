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

package acl

import (
	"context"
	"io"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

func WithContentLockFilter() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if !options.AdminView {
			options.Wrappers = append(options.Wrappers, &ContentLockFilter{})
		}
	}
}

// ContentLockFilter checks for user-defined content locks in the context AccessList.
type ContentLockFilter struct {
	abstract.Handler
}

func (a *ContentLockFilter) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(h, options)
	return a
}

// PutObject check locks before allowing Put operation.
func (a *ContentLockFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	if branchInfo, er := nodes.GetBranchInfo(ctx, "in"); er == nil && branchInfo.IsInternal() {
		return a.Next.PutObject(ctx, node, reader, requestData)
	}
	if err := permissions.CheckContentLock(ctx, node); err != nil {
		return models.ObjectInfo{}, err
	}
	return a.Next.PutObject(ctx, node, reader, requestData)
}

func (a *ContentLockFilter) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	if branchInfo, er := nodes.GetBranchInfo(ctx, "in"); er == nil && branchInfo.IsInternal() {
		return a.Next.MultipartCreate(ctx, target, requestData)
	}
	if err := permissions.CheckContentLock(ctx, target); err != nil {
		return "", err
	}
	return a.Next.MultipartCreate(ctx, target, requestData)
}

// CopyObject should check: quota on CopyObject operation? Can we copy an object on top of an existing node?
func (a *ContentLockFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	return a.Next.CopyObject(ctx, from, to, requestData)
}

func (a *ContentLockFilter) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	var lockErr error
	switch operation.GetType() {
	case tree.NodeChangeEvent_CREATE, tree.NodeChangeEvent_UPDATE_CONTENT:
		lockErr = permissions.CheckContentLock(targetCtx, operation.GetTarget())
	case tree.NodeChangeEvent_DELETE, tree.NodeChangeEvent_UPDATE_PATH:
		lockErr = permissions.CheckContentLock(srcCtx, operation.GetSource())
	}
	if lockErr != nil {
		return lockErr
	}
	return a.Next.WrappedCanApply(srcCtx, targetCtx, operation)
}
