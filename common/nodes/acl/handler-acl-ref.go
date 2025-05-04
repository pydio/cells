/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

func WithRefFilter() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if !options.AdminView {
			options.Wrappers = append(options.Wrappers, &RefFilterHandler{})
		}
	}
}

// RefFilterHandler checks for read/write permissions depending on the call using the context AccessList.
type RefFilterHandler struct {
	abstract.Handler
}

func (a *RefFilterHandler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(h, options)
	return a
}

func (a *RefFilterHandler) skipContext(ctx context.Context, identifier ...string) bool {
	if nodes.HasSkipAclCheck(ctx) {
		return true
	}
	id := "in"
	if len(identifier) > 0 {
		id = identifier[0]
	}
	bI, er := nodes.GetBranchInfo(ctx, id)
	return er == nil && (bI.Binary)
}

// ReadNode checks if node is readable and forward to next middleware.
func (a *RefFilterHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	resp, err := a.Next.ReadNode(ctx, in, opts...)
	if err != nil || a.skipContext(ctx) {
		return resp, err
	}

	// CHECK ADDITIONAL ACL-REF
	if refNode := resp.GetNode().GetStringMeta(common.MetaNamespaceAclRefNodeUuid); refNode != "" {

		parentNode := &tree.Node{Uuid: refNode}

		accessList, ok := FromContext(ctx)
		if !ok {
			return nil, errors.WithStack(errors.BranchInfoACLMissing)
		}
		abstract.VirtualResolveAll(ctx, accessList)

		parents, err := nodes.BuildAncestorsList(ctx, nodes.GetSourcesPool(ctx).GetTreeClient(), parentNode)
		if err != nil {
			return nil, err
		}
		if !accessList.CanRead(ctx, parents...) {
			log.Logger(ctx).Debugf("RefNode permission check FAILED on ref node %s", refNode)
			return nil, errors.WithStack(errors.PathNotReadable)
		} else {
			log.Logger(ctx).Debugf("RefNode permission check PASSED on ref node %s", refNode)
		}
	}

	return resp, err
}
