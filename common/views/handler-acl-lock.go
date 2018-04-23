/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package views

import (
	"context"
	"io"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
	"go.uber.org/zap"
)

type AclLockFilter struct {
	AbstractHandler
}

// checkLock finds if there is a global lock registered in ACLs.
func (a *AclLockFilter) checkLock(ctx context.Context, node *tree.Node) error {
	if node.Uuid == "" {
		return nil
	}
	var userName string
	if claims, ok := ctx.Value(claim.ContextKey).(claim.Claims); ok {
		userName = claims.Name
	}

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	// Look for "quota" ACLs on this node
	singleQ := &idm.ACLSingleQuery{NodeIDs: []string{node.Uuid}, Actions: []*idm.ACLAction{{Name: utils.ACL_CONTENT_LOCK.Name}}}
	log.Logger(ctx).Debug("SEARCHING FOR LOCKS IN ACLS", zap.Any("q", singleQ))
	q, _ := ptypes.MarshalAny(singleQ)
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
	if err != nil {
		return err
	}
	defer stream.Close()
	for {
		rsp, e := stream.Recv()
		if e != nil {
			break
		}
		if rsp == nil {
			continue
		}
		acl := rsp.ACL
		log.Logger(ctx).Debug("FOUND LOCK", acl.Zap())
		if userName == "" || acl.Action.Value != userName {
			return errors.Forbidden(VIEWS_LIBRARY_NAME, "This file is locked by another user")
		}
		break
	}
	return nil
}

// PutObject check locks before allowing Put operation.
func (a *AclLockFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {
	if err := a.checkLock(ctx, node); err != nil {
		return 0, err
	}
	return a.next.PutObject(ctx, node, reader, requestData)
}

func (a *AclLockFilter) MultipartCreate(ctx context.Context, target *tree.Node, requestData *MultipartRequestData) (string, error) {
	if err := a.checkLock(ctx, target); err != nil {
		return "", err
	}
	return a.next.MultipartCreate(ctx, target, requestData)
}

// CopyObject should check: quota on CopyObject operation? Can we copy an object on top of an existing node?
func (a *AclLockFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {

	return a.next.CopyObject(ctx, from, to, requestData)
}
