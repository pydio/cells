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
	"encoding/json"
	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	service2 "github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/idm/role"
)

var (
	rootPolicies = []*service.ResourcePolicy{
		{
			Action:  service.ResourcePolicyAction_READ,
			Subject: "*",
			Effect:  service.ResourcePolicy_allow,
		},
		{
			Action:  service.ResourcePolicyAction_WRITE,
			Subject: "profile:" + common.PYDIO_PROFILE_ADMIN,
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
			Subject: "profile:" + common.PYDIO_PROFILE_STANDARD,
			Effect:  service.ResourcePolicy_allow,
		},
	}
)

func InitRoles(ctx context.Context) error {

	<-time.After(3 * time.Second)

	log.Logger(ctx).Info("Creating Root Group Role")
	dao := servicecontext.GetDAO(ctx).(role.DAO)
	_, update, e := dao.Add(&idm.Role{
		Uuid:      "ROOT_GROUP",
		Label:     "Root Group",
		GroupRole: true,
	})

	if e == nil && !update {
		e = dao.AddPolicies(false, "ROOT_GROUP", rootPolicies)
		// Add right to Home Dashboard for ROOT_GROUP
		lang := config.Default().Get("defaults", "language").String("en")
		langJ, _ := json.Marshal(lang)
		service2.Retry(func() error {

			acls := []*idm.ACL{
				{RoleID: "ROOT_GROUP", Action: utils.ACL_READ, WorkspaceID: "homepage", NodeID: "homepage-ROOT"},
				{RoleID: "ROOT_GROUP", Action: utils.ACL_WRITE, WorkspaceID: "homepage", NodeID: "homepage-ROOT"},
				{RoleID: "ROOT_GROUP", Action: &idm.ACLAction{Name: "parameter:core.conf:lang", Value: string(langJ)}, WorkspaceID: "PYDIO_REPO_SCOPE_ALL"},
			}
			log.Logger(ctx).Info("Settings ACLS for Home dashboard on Root Group")
			aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
			for _, acl := range acls {
				_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
				if e != nil {
					return e
				}
			}

			return nil
		}, 8*time.Second, 50*time.Second)
	}

	if _, _, e = dao.Add(&idm.Role{
		Uuid:        "EXTERNAL_USERS",
		Label:       "External Users",
		AutoApplies: []string{"shared"},
	}); e == nil {
		e = dao.AddPolicies(false, "EXTERNAL_USERS", externalPolicies)
		actions := make(map[string][]string)
		actions["action.user"] = []string{"open_address_book"}
		InsertActionsAcls(ctx, "EXTERNAL_USERS", "PYDIO_REPO_SCOPE_ALL", actions)
	}

	return e

}

func InsertActionsAcls(ctx context.Context, roleId string, repoScope string, actions map[string][]string) error {

	return service2.Retry(func() error {
		var acls []*idm.ACL
		for plugId, as := range actions {
			for _, act := range as {
				acls = append(acls, &idm.ACL{
					RoleID:      roleId,
					WorkspaceID: repoScope,
					Action:      &idm.ACLAction{Name: "action:" + plugId + ":" + act, Value: "false"},
				})
			}
		}
		log.Logger(ctx).Info("Settings ACLS for " + roleId)
		aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
		for _, acl := range acls {
			_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
			if e != nil {
				return e
			}
		}
		return nil
	}, 8*time.Second, 50*time.Second)

}
