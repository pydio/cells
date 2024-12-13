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

package rest

import (
	"context"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/client/commons/treec"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

// WriteAllowed returns an error if the Write permission is not present in an acl
func (a *Handler) WriteAllowed(ctx context.Context, acl *idm.ACL) error {

	if claims, ok := ctx.Value(claim.ContextKey).(claim.Claims); ok {
		if claims.Profile == common.PydioProfileAdmin { // Always allow for admins
			return nil
		}
	}

	if acl.NodeID == "" && acl.RoleID != "" {
		// This is a global ACL just used for role
		// Check resource policies associated to this role
		log.Logger(ctx).Debug("Checking acl write on role", zap.Any("acl", acl))
		return a.CheckRole(ctx, acl.RoleID)

	} else if acl.NodeID != "" && acl.Action != nil && (acl.Action.Name == permissions.AclRead.Name || acl.Action.Name == permissions.AclWrite.Name) {
		// Do not bother about roles here, just verify
		// that this node is belonging to an authorized path: use accessList for that
		return a.CheckNode(ctx, acl.NodeID, acl.Action)

	} else {
		log.Logger(ctx).Warn("Cannot check acl right for this request - probably a workspace wide acl delete query - letting it through", zap.Any("acl", acl))
	}

	return nil
}

// CheckRole loads a role and its Policies to check wether this role can be edited
// in the current context
func (a *Handler) CheckRole(ctx context.Context, roleID string) error {

	cli := idmc.RoleServiceClient(ctx)
	q, _ := anypb.New(&idm.RoleSingleQuery{Uuid: []string{roleID}})
	stream, err := cli.SearchRole(ctx, &idm.SearchRoleRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	var role *idm.Role
	if e := commons.ForEach(stream, err, func(t *idm.SearchRoleResponse) error {
		role = t.GetRole()
		return nil
	}); e != nil {
		return errors.Tag(e, errors.StatusForbidden)
	}
	if role == nil {
		return errors.WithMessagef(errors.StatusForbidden, "role %s does not exists", roleID)
	}
	if !a.MatchPolicies(ctx, role.Uuid, role.Policies, service.ResourcePolicyAction_WRITE) {
		subjects, _ := auth.SubjectsForResourcePolicyQuery(ctx, nil)
		log.Logger(ctx).Debug("Error while checking role from ACL rest : ", zap.Any("role", role), log.DangerouslyZapSmallSlice("subjects", subjects))
		return errors.WithMessage(errors.RoleACLsNotEditable, "while checking role from ACL")
	}
	log.Logger(ctx).Debug("Checking acl write on role PASSED", zap.String("roleId", roleID))
	return nil

}

// CheckNode uses AccessList object to analyze the current ACLs of the target node
func (a *Handler) CheckNode(ctx context.Context, nodeID string, action *idm.ACLAction) error {

	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil {
		return errors.Tag(err, errors.StatusForbidden)
	}

	treeClient := treec.NodeProviderClient(ctx)
	ancestorStream, lErr := treeClient.ListNodes(ctx, &tree.ListNodesRequest{
		Node:      &tree.Node{Uuid: nodeID},
		Ancestors: true,
	})
	if lErr != nil {
		return lErr
	}
	parentNodes := []*tree.Node{{Uuid: nodeID}}
	for {
		parent, e := ancestorStream.Recv()
		if e != nil {
			if errors.IsStreamFinished(e) {
				break
			}
			if errors.Is(e, errors.NodeNotFound) { // todo - recheck this case
				return nil
			}
			return e
		}
		if parent == nil {
			continue
		}
		parentNodes = append(parentNodes, parent.Node)
	}

	// Update Access List with resolved virtual nodes
	virtualManager := abstract.GetVirtualProvider()
	for _, vNode := range virtualManager.ListNodes(ctx) {
		if aclNodeMask, has := accessList.GetNodesBitmasks()[vNode.Uuid]; has {
			if resolvedRoot, err := virtualManager.ResolveInContext(ctx, vNode, false); err == nil {
				log.Logger(ctx).Debug("Updating Access List with resolved node Uuid", zap.Any("virtual", vNode), zap.Any("resolved", resolvedRoot))
				accessList.AddNodeBitmask(resolvedRoot.Uuid, aclNodeMask)
			}
		}
	}

	var check bool
	if action.GetName() == permissions.AclRead.GetName() {
		log.Logger(ctx).Debug("Checking read on parent nodes", accessList.Zap(), log.DangerouslyZapSmallSlice("parentNodes", parentNodes))
		check = accessList.CanRead(ctx, parentNodes...)
	} else if action.GetName() == permissions.AclWrite.GetName() {
		log.Logger(ctx).Debug("Checking write on parent nodes", accessList.Zap(), log.DangerouslyZapSmallSlice("parentNodes", parentNodes))
		check = accessList.CanWrite(ctx, parentNodes...)
	}

	if !check {
		return errors.WithDetails(errors.WithMessage(errors.StatusForbidden, "you are not authorized to open rights on this node"), "action", action)
	}

	return nil
}
