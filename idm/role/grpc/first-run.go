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

package grpc

import (
	"context"
	"fmt"
	"strings"
	"time"

	"go.uber.org/zap"
	grpc2 "google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/pydio/cells/v4/idm/role"
)

type insertRole struct {
	Role *idm.Role
	Acls []*idm.ACL
}

var (
	rootPolicies = []*service.ResourcePolicy{
		{
			Action:  service.ResourcePolicyAction_READ,
			Subject: "*",
			Effect:  service.ResourcePolicy_allow,
		},
		{
			Action:  service.ResourcePolicyAction_WRITE,
			Subject: "profile:" + common.PydioProfileAdmin,
			Effect:  service.ResourcePolicy_allow,
		},
	}
	externalPolicies = []*service.ResourcePolicy{
		{
			Action:  service.ResourcePolicyAction_READ,
			Subject: "*",
			Effect:  service.ResourcePolicy_allow,
		},
		{
			Action:  service.ResourcePolicyAction_WRITE,
			Subject: "profile:" + common.PydioProfileStandard,
			Effect:  service.ResourcePolicy_allow,
		},
	}
)

func InitRoles(ctx context.Context) error {
	lang := config.Get("frontend", "plugin", "core.pydio", "DEFAULT_LANGUAGE").Default("en-us").String()
	langJ, _ := json.Marshal(lang)
	scopeAll := permissions.FrontWsScopeAll
	scopeShared := permissions.FrontWsScopeShared

	insertRoles := []*insertRole{
		{
			Role: &idm.Role{
				Uuid:      "ROOT_GROUP",
				Label:     "Root Group",
				GroupRole: true,
				Policies:  rootPolicies,
			},
			Acls: []*idm.ACL{
				{RoleID: "ROOT_GROUP", Action: permissions.AclRead, WorkspaceID: common.IdmWsInternalHomepageID, NodeID: "homepage-ROOT"},
				{RoleID: "ROOT_GROUP", Action: permissions.AclWrite, WorkspaceID: common.IdmWsInternalHomepageID, NodeID: "homepage-ROOT"},
				{RoleID: "ROOT_GROUP", Action: permissions.AclRead, WorkspaceID: common.IdmWsInternalDirectoryID, NodeID: "directory-ROOT"},
				{RoleID: "ROOT_GROUP", Action: permissions.AclWrite, WorkspaceID: common.IdmWsInternalDirectoryID, NodeID: "directory-ROOT"},
				{RoleID: "ROOT_GROUP", Action: &idm.ACLAction{Name: "parameter:core.conf:lang", Value: string(langJ)}, WorkspaceID: scopeAll},
			},
		},
		{
			Role: &idm.Role{
				Uuid:        "ADMINS",
				Label:       "Administrators",
				AutoApplies: []string{common.PydioProfileAdmin},
				Policies:    rootPolicies,
			},
			Acls: []*idm.ACL{
				{RoleID: "ADMINS", Action: permissions.AclRead, WorkspaceID: common.IdmWsInternalSettingsID, NodeID: "settings-ROOT"},
				{RoleID: "ADMINS", Action: permissions.AclWrite, WorkspaceID: common.IdmWsInternalSettingsID, NodeID: "settings-ROOT"},
			},
		},
		{
			Role: &idm.Role{
				Uuid:        "EXTERNAL_USERS",
				Label:       "External Users",
				AutoApplies: []string{common.PydioProfileShared},
				Policies:    externalPolicies,
			},
			Acls: []*idm.ACL{
				{RoleID: "EXTERNAL_USERS", Action: permissions.AclDeny, WorkspaceID: common.IdmWsInternalHomepageID, NodeID: "homepage-ROOT"},
				{RoleID: "EXTERNAL_USERS", Action: permissions.AclDeny, WorkspaceID: common.IdmWsInternalDirectoryID, NodeID: "directory-ROOT"},
				{RoleID: "EXTERNAL_USERS", Action: &idm.ACLAction{Name: "action:action.share:share", Value: "false"}, WorkspaceID: scopeAll},
				{RoleID: "EXTERNAL_USERS", Action: &idm.ACLAction{Name: "action:action.share:share-edit-shared", Value: "false"}, WorkspaceID: scopeAll},
				{RoleID: "EXTERNAL_USERS", Action: &idm.ACLAction{Name: "action:action.share:open_user_shares", Value: "false"}, WorkspaceID: scopeAll},
				{RoleID: "EXTERNAL_USERS", Action: &idm.ACLAction{Name: "action:action.user:open_address_book", Value: "false"}, WorkspaceID: scopeAll},
				{RoleID: "EXTERNAL_USERS", Action: &idm.ACLAction{Name: "parameter:core.auth:USER_CREATE_CELLS", Value: "false"}, WorkspaceID: scopeAll},
				{RoleID: "EXTERNAL_USERS", Action: &idm.ACLAction{Name: "parameter:core.auth:USER_CREATE_USERS", Value: "false"}, WorkspaceID: scopeAll},
			},
		},
		{
			Role: &idm.Role{
				Uuid:     "MINISITE",
				Label:    "Minisite Permissions",
				Policies: rootPolicies,
			},
			Acls: []*idm.ACL{
				{RoleID: "MINISITE", Action: &idm.ACLAction{Name: "action:action.share:share", Value: "false"}, WorkspaceID: scopeShared},
				{RoleID: "MINISITE", Action: &idm.ACLAction{Name: "action:action.share:share-edit-shared", Value: "false"}, WorkspaceID: scopeShared},
				{RoleID: "MINISITE", Action: &idm.ACLAction{Name: "action:core.activitystreams:toggle_watch", Value: "false"}, WorkspaceID: scopeShared},
				{RoleID: "MINISITE", Action: &idm.ACLAction{Name: "action:gui.ajax:bookmark_on", Value: "false"}, WorkspaceID: scopeShared},
			},
		},
		{
			Role: &idm.Role{
				Uuid:     "MINISITE_NODOWNLOAD",
				Label:    "Minisite (Download Disabled)",
				Policies: rootPolicies,
			},
			Acls: []*idm.ACL{
				{RoleID: "MINISITE_NODOWNLOAD", Action: &idm.ACLAction{Name: "action:access.gateway:download", Value: "false"}, WorkspaceID: scopeShared},
				{RoleID: "MINISITE_NODOWNLOAD", Action: &idm.ACLAction{Name: "action:access.gateway:download_folder", Value: "false"}, WorkspaceID: scopeShared},
			},
		},
	}

	var e error
	for _, insert := range insertRoles {
		dao := servicecontext.GetDAO(ctx).(role.DAO)
		var update bool
		_, update, e = dao.Add(insert.Role)
		if e != nil {
			break
		}
		if update {
			continue
		}
		log.Logger(ctx).Info(fmt.Sprintf("Created default role %s", insert.Role.Label))
		if e = dao.AddPolicies(false, insert.Role.Uuid, insert.Role.Policies); e == nil {
			log.Logger(ctx).Info(fmt.Sprintf(" - Policies added for role %s", insert.Role.Label))
		} else {
			break
		}

		rolesACLs := insert.Acls
		roleName := insert.Role.Label

		//go func(rolesACLs []*idm.ACL, roleName string) {
		aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
		for _, acl := range rolesACLs {
			if _, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}); err != nil {
				log.Logger(ctx).Error("Failed inserting ACLs for role "+roleName, zap.Error(err))
				break
				//return
			}
		}

		log.Logger(ctx).Info("Inserted ACLs for role " + roleName)
		//}(insert.Acls, insert.Role.Label)
	}

	return e
}

func UpgradeTo12(ctx context.Context) error {

	scopeShared := permissions.FrontWsScopeShared

	insertRoles := []*insertRole{
		{
			Role: &idm.Role{
				Uuid:     "MINISITE",
				Label:    "Minisite Permissions",
				Policies: rootPolicies,
			},
			Acls: []*idm.ACL{
				{RoleID: "MINISITE", Action: &idm.ACLAction{Name: "action:action.share:share", Value: "false"}, WorkspaceID: scopeShared},
				{RoleID: "MINISITE", Action: &idm.ACLAction{Name: "action:action.share:share-edit-shared", Value: "false"}, WorkspaceID: scopeShared},
			},
		},
		{
			Role: &idm.Role{
				Uuid:     "MINISITE_NODOWNLOAD",
				Label:    "Minisite (Download Disabled)",
				Policies: rootPolicies,
			},
			Acls: []*idm.ACL{
				{RoleID: "MINISITE_NODOWNLOAD", Action: &idm.ACLAction{Name: "action:access.gateway:download", Value: "false"}, WorkspaceID: scopeShared},
				{RoleID: "MINISITE_NODOWNLOAD", Action: &idm.ACLAction{Name: "action:access.gateway:download_folder", Value: "false"}, WorkspaceID: scopeShared},
			},
		},
	}

	var e error
	for _, insert := range insertRoles {
		dao := servicecontext.GetDAO(ctx).(role.DAO)
		var update bool
		_, update, e = dao.Add(insert.Role)
		if e != nil {
			break
		}
		if update {
			continue
		}
		log.Logger(ctx).Info(fmt.Sprintf("Created role %s", insert.Role.Label))
		if e = dao.AddPolicies(false, insert.Role.Uuid, insert.Role.Policies); e == nil {
			log.Logger(ctx).Info(fmt.Sprintf(" - Policies added for role %s", insert.Role.Label))
		} else {
			break
		}

		e = std.Retry(ctx, func() error {
			aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
			for _, acl := range insert.Acls {
				_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
				if e != nil {
					return e
				}
			}
			log.Logger(ctx).Info(fmt.Sprintf(" - ACLS set for role %s", insert.Role.Label))
			return nil
		}, 8*time.Second, 50*time.Second)
	}

	return e
}

func UpgradeTo4199(ctx context.Context) error {
	newACLs := []*idm.ACL{
		{RoleID: "ROOT_GROUP", Action: permissions.AclRead, WorkspaceID: common.IdmWsInternalDirectoryID, NodeID: "directory-ROOT"},
		{RoleID: "ROOT_GROUP", Action: permissions.AclWrite, WorkspaceID: common.IdmWsInternalDirectoryID, NodeID: "directory-ROOT"},
	}
	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	for _, acl := range newACLs {
		_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}, grpc2.WaitForReady(true))
		if e != nil {
			return e
		}
	}
	log.Logger(ctx).Info("Added new ACLs for root group to access 'directory' workspace")
	return nil
}

func UpgradeTo421(ctx context.Context) error {
	newACLs := []*idm.ACL{
		{RoleID: "EXTERNAL_USERS", Action: &idm.ACLAction{Name: "parameter:core.auth:USER_CREATE_USERS", Value: "false"}, WorkspaceID: permissions.FrontWsScopeAll},
	}
	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	for _, acl := range newACLs {
		_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}, grpc2.WaitForReady(true))
		if e != nil {
			if strings.Contains(strings.ToLower(e.Error()), "duplicate") {
				log.Logger(ctx).Info("Ignoring new ACL for external users role, it's already there")
				return nil
			}
			return e
		}
	}
	log.Logger(ctx).Info("Added new ACLs for external users")
	return nil
}
