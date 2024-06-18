/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package share

import (
	"context"
	"fmt"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type LinkOptioner interface {
	GetPasswordEnabled() bool
	GetCreatePassword() string
	GetUpdatePassword() string
	GetUpdateCustomHash() string
}

type ContextEditableChecker interface {
	IsContextEditable(ctx context.Context, resourceId string, policies []*service2.ResourcePolicy) bool
}

type EmptyContextChecker struct{}

func (*EmptyContextChecker) IsContextEditable(ctx context.Context, resourceId string, policies []*service2.ResourcePolicy) bool {
	return true
}

// NewClient creates a new share client. Leave checker nil to use default implementation (returning always true)
func NewClient(ctx context.Context, checker ContextEditableChecker) *Client {
	if checker == nil {
		checker = &EmptyContextChecker{}
	}
	c := &Client{
		checker: checker,
	}
	c.RuntimeContext = ctx
	return c
}

type Client struct {
	common.RuntimeHolder
	checker    ContextEditableChecker
	pathRouter nodes.Handler
	uuidRouter nodes.Handler
	uuidAdmin  nodes.Handler
}

// LinkById loads a ShareLink by Uuid
func (sc *Client) LinkById(ctx context.Context, wsUuid string) (*rest.ShareLink, error) {

	workspace, err := sc.GetLinkWorkspace(ctx, wsUuid)
	if err != nil {
		return nil, err
	}
	return sc.WorkspaceToShareLinkObject(ctx, workspace)

}

// LinksForNode loads existing links for a give node
func (sc *Client) LinksForNode(ctx context.Context, node *tree.Node, owner *idm.User) (ll []*rest.ShareLink, e error) {
	wss, er := sc.SharesForNode(ctx, node, owner, idm.WorkspaceScope_LINK)
	if er != nil {
		return nil, er
	}
	for _, ws := range wss {
		if l, er := sc.WorkspaceToShareLinkObject(ctx, ws); e == nil {
			ll = append(ll, l)
		} else {
			return nil, er
		}
	}
	return
}

// UpsertLink creates or updates a ShareLink.
// ownerUser is required to apply correct permissions to the new/updated link
// The plugin options can be user-permissions-based otherwise use client.DefaultOptions()
func (sc *Client) UpsertLink(ctx context.Context, link *rest.ShareLink, linkOptions LinkOptioner, ownerUser *idm.User, parentPolicy string, options PluginOptions) (*rest.ShareLink, error) {

	start := time.Now()
	track := func(msg string) {
		log.Logger(ctx).Debug(msg, zap.Duration("t", time.Since(start)))
	}

	var workspace *idm.Workspace
	var user *idm.User
	var err error
	var create bool
	var refLabel string
	aclClient := idmc.ACLServiceClient(ctx) //idm.NewACLServiceClient(grpc.ResolveConn(sc.RuntimeContext, common.ServiceAcl))
	if len(link.RootNodes) == 1 {
		refLabel = path.Base(link.RootNodes[0].GetPath())
	}
	if link.Uuid == "" {
		create = true
		workspace, _, err = sc.GetOrCreateWorkspace(ctx, ownerUser, "", idm.WorkspaceScope_LINK, link.Label, refLabel, link.Description, false)
		if err != nil {
			return nil, err
		}
		track("GetOrCreateWorkspace")
		for _, node := range link.RootNodes {
			_, _ = aclClient.CreateACL(ctx, &idm.CreateACLRequest{
				ACL: &idm.ACL{
					NodeID:      node.Uuid,
					WorkspaceID: workspace.UUID,
					Action:      &idm.ACLAction{Name: "workspace-path", Value: "uuid:" + node.Uuid},
				},
			})
		}
		track("CreateACL")
		link.Uuid = workspace.UUID
		link.LinkHash = strings.Replace(uuid.New(), "-", "", -1)[0:options.HashMinLength]
	} else {
		if linkOptions.GetUpdateCustomHash() != "" {
			if !options.HashEditable {
				return nil, errors.WithStack(errors.ShareLinkHashNotEditable)
			}
			if len(linkOptions.GetUpdateCustomHash()) < options.HashMinLength {
				return nil, errors.WithMessagef(errors.ShareLinkHashMinLengthRequired, "Please use a link hash with at least %d characters", options.HashMinLength)
			}
		}
		workspace, create, err = sc.GetOrCreateWorkspace(ctx, ownerUser, link.Uuid, idm.WorkspaceScope_LINK, link.Label, refLabel, link.Description, true)
	}
	if err != nil {
		return nil, err
	}
	if !create && !sc.checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies) {
		return nil, errors.WithStack(errors.ShareLinkNotEditable)
	}
	track("IsContextEditable")

	// Load Hidden User
	user, err = sc.GetOrCreateHiddenUser(ctx, ownerUser, link, linkOptions.GetPasswordEnabled(), linkOptions.GetCreatePassword(), false)
	if err != nil {
		return nil, err
	}
	track("GetOrCreateHiddenUser")
	if create {
		link.UserLogin = user.Login
		link.UserUuid = user.Uuid
		link.PasswordRequired = linkOptions.GetPasswordEnabled()
		// Update Workspace Policies to make sure it's readable by the new user
		workspace.Policies = append(workspace.Policies, &service2.ResourcePolicy{
			Resource: workspace.UUID,
			Subject:  fmt.Sprintf("user:%s", user.Login),
			Action:   service2.ResourcePolicyAction_READ,
			Effect:   service2.ResourcePolicy_allow,
		})
		wsClient := idmc.WorkspaceServiceClient(ctx)
		if _, er := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace}); er != nil {
			return nil, er
		}

		track("CreateWorkspace")
	} else {
		// Manage password if status was updated
		storedLink := &rest.ShareLink{Uuid: link.Uuid}
		if er := sc.LoadHashDocumentData(ctx, storedLink, []*idm.ACL{}); er != nil {
			return nil, er
		}
		link.PasswordRequired = storedLink.PasswordRequired
		var passNewEnable = linkOptions.GetPasswordEnabled() && !storedLink.PasswordRequired
		var passNewDisable = !linkOptions.GetPasswordEnabled() && storedLink.PasswordRequired
		var passUpdated = linkOptions.GetPasswordEnabled() && storedLink.PasswordRequired && linkOptions.GetUpdatePassword() != ""
		if passNewEnable || passNewDisable || passUpdated {
			// Password conditions have changed : re-create a new hidden user
			if e := sc.DeleteHiddenUser(ctx, storedLink); e != nil {
				return nil, e
			}
			storedLink.UserLogin = ""
			storedLink.UserUuid = ""
			hiddenPassword := linkOptions.GetCreatePassword()
			if passUpdated {
				hiddenPassword = linkOptions.GetUpdatePassword()
			}
			uUser, e := sc.GetOrCreateHiddenUser(ctx, ownerUser, storedLink, linkOptions.GetPasswordEnabled(), hiddenPassword, false)
			if e != nil {
				return nil, e
			}
			user = uUser
			link.UserLogin = user.Login
			link.UserUuid = user.Uuid
			if passNewEnable {
				link.PasswordRequired = true
			} else if passNewDisable {
				link.PasswordRequired = false
			}
		}
	}

	err = sc.UpdateACLsForHiddenUser(ctx, user.Uuid, workspace.UUID, link.RootNodes, link.Permissions, parentPolicy, !create)
	track("UpdateACLsForHiddenUser")
	if err != nil {
		return nil, err
	}
	if create {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created share link [%s]", link.Label),
			log.GetAuditId(common.AuditLinkCreate),
			zap.String(common.KeyLinkUuid, link.Uuid),
			zap.String(common.KeyWorkspaceUuid, link.Uuid),
		)
		track("Auditer")
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated share link [%s]", link.Label),
			log.GetAuditId(common.AuditLinkUpdate),
			zap.String(common.KeyLinkUuid, link.Uuid),
			zap.String(common.KeyWorkspaceUuid, link.Uuid),
		)
	}

	// Update HashDocument
	if err := sc.StoreHashDocument(ctx, ownerUser, link, linkOptions.GetUpdateCustomHash()); err != nil {
		return nil, err
	}
	track("StoreHashDocument")

	// Reload
	return sc.WorkspaceToShareLinkObject(ctx, workspace)

}

// DeleteLink disable an existing ShareLink and remove associated resources
func (sc *Client) DeleteLink(ctx context.Context, id string) error {
	if ws, e := sc.GetLinkWorkspace(ctx, id); e != nil || ws == nil {
		return e
	} else if !sc.checker.IsContextEditable(ctx, id, ws.Policies) {
		return errors.WithStack(errors.ShareLinkNotEditable)
	}

	// First remove hash data
	storedLink := &rest.ShareLink{Uuid: id}
	if err := sc.LoadHashDocumentData(ctx, storedLink, []*idm.ACL{}); err != nil {
		return err
	}
	// Delete associated Document from Docstore
	if err := sc.DeleteHashDocument(ctx, id); err != nil {
		return err
	}

	// Delete associated Hidden user
	if err := sc.DeleteHiddenUser(ctx, storedLink); err != nil {
		return err
	}

	// Finally remove workspace
	return sc.DeleteLinkWorkspace(ctx, id)

}

// SharesForNode finds all active workspaces (Links or Cells) for a given node+owner combination
func (sc *Client) SharesForNode(ctx context.Context, node *tree.Node, contextOwner *idm.User, scopes ...idm.WorkspaceScope) ([]*idm.Workspace, error) {

	aclClient := idmc.ACLServiceClient(ctx)      //idm.NewACLServiceClient(grpc.ResolveConn(sc.RuntimeContext, common.ServiceAcl))
	wsClient := idmc.WorkspaceServiceClient(ctx) //idm.NewWorkspaceServiceClient(grpc.ResolveConn(sc.RuntimeContext, common.ServiceWorkspace))

	q, _ := anypb.New(&idm.ACLSingleQuery{
		NodeIDs: []string{node.Uuid},
		Actions: []*idm.ACLAction{
			permissions.AclRead,
			permissions.AclWrite,
			permissions.AclPolicy,
		},
	})

	searchClient, e := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service2.Query{SubQueries: []*anypb.Any{q}}})
	if e != nil {
		return nil, e
	}
	nodeAcls := map[string][]*idm.ACL{}
	for {
		resp, er := searchClient.Recv()
		if er != nil {
			break
		}
		a := resp.GetACL()
		if a.WorkspaceID != "" {
			if _, exists := nodeAcls[a.WorkspaceID]; !exists {
				nodeAcls[a.WorkspaceID] = []*idm.ACL{}
			}
			nodeAcls[a.WorkspaceID] = append(nodeAcls[a.WorkspaceID], a)
		}
	}

	var shares []*idm.Workspace
	subjects, _ := auth.SubjectsForResourcePolicyQuery(ctx, &rest.ResourcePolicyQuery{Type: rest.ResourcePolicyQuery_USER, UserId: contextOwner.GetUuid()})
	if len(scopes) == 0 {
		scopes = append(scopes, idm.WorkspaceScope_LINK, idm.WorkspaceScope_ROOM)
	}

	for wsId := range nodeAcls {
		var sq []*anypb.Any
		for _, scope := range scopes {
			scopeQuery, _ := anypb.New(&idm.WorkspaceSingleQuery{
				Uuid:  wsId,
				Scope: scope,
			})
			sq = append(sq, scopeQuery)
		}
		wsc, err := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
			Query: &service2.Query{
				SubQueries:          sq,
				ResourcePolicyQuery: &service2.ResourcePolicyQuery{Subjects: subjects},
				Operation:           service2.OperationType_OR,
			},
		})
		if err == nil {
			for {
				wsResp, er := wsc.Recv()
				if er != nil {
					break
				}
				if wsResp == nil {
					continue
				}
				shares = append(shares, wsResp.Workspace)
			}
		}
	}
	return shares, nil

}

// CellById finds a Cell by its Uuid
func (sc *Client) CellById(ctx context.Context, wsUuid string, owner *idm.User) (*rest.Cell, error) {
	ws, e := sc.GetCellWorkspace(ctx, wsUuid)
	if e != nil {
		return nil, e
	}
	acl, er := permissions.AccessListFromRoles(ctx, owner.Roles, true, true)
	if er != nil {
		return nil, er
	}
	return sc.WorkspaceToCellObject(ctx, ws, acl)
}

// CellsForNode loads existing Cells attached to a given node (and owned by passed user)
func (sc *Client) CellsForNode(ctx context.Context, node *tree.Node, owner *idm.User) (ll []*rest.Cell, e error) {
	wss, er := sc.SharesForNode(ctx, node, owner, idm.WorkspaceScope_ROOM)
	if er != nil {
		return nil, er
	}
	acl, er := permissions.AccessListFromRoles(ctx, owner.Roles, true, true)
	if er != nil {
		return nil, er
	}
	for _, ws := range wss {
		if l, er := sc.WorkspaceToCellObject(ctx, ws, acl); e == nil {
			ll = append(ll, l)
		} else {
			return nil, er
		}
	}
	return
}

// UpsertCell creates or update an existing cell with specific ACLs
func (sc *Client) UpsertCell(ctx context.Context, cell *rest.Cell, ownerUser *idm.User, hasReadonly bool, parentPolicy string) (*rest.Cell, error) {

	workspace, wsCreated, err := sc.GetOrCreateWorkspace(ctx, ownerUser, cell.Uuid, idm.WorkspaceScope_ROOM, cell.Label, "", cell.Description, false)
	if err != nil {
		return nil, err
	}
	if !wsCreated && !sc.checker.IsContextEditable(ctx, workspace.UUID, workspace.Policies) {
		return nil, errors.WithStack(errors.CellNotEditable)
	}

	// Now set ACLs on Workspace
	aclClient := idmc.ACLServiceClient(ctx) //idm.NewACLServiceClient(grpc.ResolveConn(sc.RuntimeContext, common.ServiceAcl))
	var currentAcls []*idm.ACL
	var currentRoots []string
	if !wsCreated {
		var err error
		currentAcls, currentRoots, err = sc.CommonAclsForWorkspace(sc.RuntimeContext, workspace.UUID)
		if err != nil {
			return nil, err
		}
	} else {
		// New workspace, create "workspace-path" ACLs
		for _, node := range cell.RootNodes {
			if node.GetMetaBool(common.MetaFlagCellNode) {
				_, er := aclClient.CreateACL(ctx, &idm.CreateACLRequest{
					ACL: &idm.ACL{
						NodeID:      node.Uuid,
						WorkspaceID: workspace.UUID,
						Action:      permissions.AclRecycleRoot,
					},
				})
				if er != nil {
					return nil, er
				}
			}
			_, er := aclClient.CreateACL(ctx, &idm.CreateACLRequest{
				ACL: &idm.ACL{
					NodeID:      node.Uuid,
					WorkspaceID: workspace.UUID,
					Action:      &idm.ACLAction{Name: permissions.AclWsrootActionName, Value: "uuid:" + node.Uuid},
				},
			})
			if er != nil {
				return nil, er
			}
		}
	}
	log.Logger(ctx).Debug("Current Roots", log.DangerouslyZapSmallSlice("crt", currentRoots))
	targetAcls, e := sc.ComputeTargetAcls(ctx, ownerUser, cell, workspace.UUID, hasReadonly, parentPolicy)
	if e != nil {
		return nil, e
	}
	log.Logger(ctx).Debug("Share ACLS", log.DangerouslyZapSmallSlice("current", currentAcls), log.DangerouslyZapSmallSlice("target", targetAcls))
	add, remove := sc.DiffAcls(ctx, currentAcls, targetAcls)
	log.Logger(ctx).Debug("Diff ACLS", log.DangerouslyZapSmallSlice("add", add), log.DangerouslyZapSmallSlice("remove", remove))

	for _, acl := range remove {
		removeQuery, _ := anypb.New(&idm.ACLSingleQuery{
			NodeIDs:      []string{acl.NodeID},
			RoleIDs:      []string{acl.RoleID},
			WorkspaceIDs: []string{acl.WorkspaceID},
			Actions:      []*idm.ACLAction{acl.Action},
		})
		_, err := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service2.Query{SubQueries: []*anypb.Any{removeQuery}}})
		if err != nil {
			log.Logger(ctx).Error("Share: Error while deleting ACLs", zap.Error(err))
		}
	}
	for _, acl := range add {
		_, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if err != nil {
			log.Logger(ctx).Error("Share: Error while creating ACLs", zap.Error(err))
		}
	}

	if cell.AccessEnd > 0 || cell.AccessEnd == -1 {
		expQuery := &service2.Query{
			Operation: service2.OperationType_OR,
		}
		for _, a := range targetAcls {
			if a.RoleID == ownerUser.Uuid {
				// do **not** set expiration for owner
				continue
			}
			aq, _ := anypb.New(&idm.ACLSingleQuery{
				RoleIDs:      []string{a.RoleID},
				WorkspaceIDs: []string{a.WorkspaceID},
				NodeIDs:      []string{a.NodeID},
				Actions:      []*idm.ACLAction{a.Action},
			})
			expQuery.SubQueries = append(expQuery.SubQueries, aq)
		}
		if len(expQuery.SubQueries) > 0 {
			if cell.AccessEnd == -1 {
				resp, e := aclClient.RestoreACL(ctx, &idm.RestoreACLRequest{
					Query: expQuery,
				})
				if e != nil {
					log.Logger(ctx).Warn("Share: could not restore ACLs Expiration Date")
				} else {
					log.Logger(ctx).Info(fmt.Sprintf("Share: removed expiration date on %d ACLs", resp.Rows), zap.Int64("modifiedRows", resp.Rows))
				}
			} else {
				resp, e := aclClient.ExpireACL(ctx, &idm.ExpireACLRequest{
					Query:     expQuery,
					Timestamp: cell.AccessEnd,
				})
				if e != nil {
					log.Logger(ctx).Warn("Share: could not set ACLs Expiration Date")
				} else {
					log.Logger(ctx).Info(fmt.Sprintf("Share: set expiration date on %d ACLs", resp.Rows), zap.Int64("modifiedRows", resp.Rows))
				}
			}
		}
		if cell.AccessEnd == -1 {
			att := workspace.LoadAttributes()
			att.ShareExpiration = 0
			workspace.SetAttributes(att)
		} else {
			att := workspace.LoadAttributes()
			att.ShareExpiration = cell.AccessEnd
			workspace.SetAttributes(att)
		}
	}

	log.Logger(ctx).Debug("Share Policies", log.DangerouslyZapSmallSlice("before", workspace.Policies))
	sc.UpdatePoliciesFromAcls(ctx, workspace, currentAcls, targetAcls)

	// Now update workspace
	log.Logger(ctx).Debug("Updating workspace", zap.Any("workspace", workspace))
	if _, err := idmc.WorkspaceServiceClient(ctx).CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: workspace}); err != nil {
		return nil, err
	}

	// Put an Audit log if this cell has been newly created
	if wsCreated {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created cell [%s]", cell.Label),
			log.GetAuditId(common.AuditCellCreate),
			zap.String(common.KeyCellUuid, cell.Uuid),
			zap.String(common.KeyWorkspaceUuid, cell.Uuid),
		)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated cell [%s]", cell.Label),
			log.GetAuditId(common.AuditCellUpdate),
			zap.String(common.KeyCellUuid, cell.Uuid),
			zap.String(common.KeyWorkspaceUuid, cell.Uuid),
		)
	}

	acl, er := permissions.AccessListFromRoles(ctx, ownerUser.Roles, true, true)
	if er != nil {
		return nil, er
	}
	return sc.WorkspaceToCellObject(ctx, workspace, acl)

}

// DeleteCell deletes a Cell by its ID
func (sc *Client) DeleteCell(ctx context.Context, id string, ownerLogin string) error {

	ws, e := sc.GetCellWorkspace(ctx, id)
	if e != nil || ws == nil {
		return errors.Tag(e, errors.CellNotFound)
	} else if !sc.checker.IsContextEditable(ctx, id, ws.Policies) {
		return errors.WithStack(errors.CellNotEditable)
	}

	currWsLabel := ws.Label

	log.Logger(ctx).Debug("Delete share room", zap.Any("workspaceId", id))
	// This will load the workspace and its root, and eventually remove the Room root totally
	if err := sc.DeleteWorkspace(ctx, ownerLogin, idm.WorkspaceScope_ROOM, id); err != nil {
		return err
	}

	// Put an Audit log if this cell has been removed without error
	log.Auditer(ctx).Info(
		fmt.Sprintf("Removed cell [%s]", currWsLabel),
		log.GetAuditId(common.AuditCellDelete),
		zap.String(common.KeyCellUuid, id),
		zap.String(common.KeyWorkspaceUuid, id),
	)

	return nil
}
