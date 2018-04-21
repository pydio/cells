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
	"time"

	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	service2 "github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/idm/workspace"
)

var (
	initialPolicies = []*service.ResourcePolicy{
		{Subject: "profile:standard", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
		{Subject: "profile:" + common.PYDIO_PROFILE_ADMIN, Action: service.ResourcePolicyAction_WRITE, Effect: service.ResourcePolicy_allow},
	}
)

// Detect datasources created during install and create workspaces on them
func FirstRun(ctx context.Context) error {

	<-time.After(5 * time.Second)

	var hasPersonal bool
	// List datasources from configs
	syncConf := config.Default().Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC, "sources")
	sources := syncConf.StringSlice([]string{})
	for _, s := range sources {
		if s == "personal" {
			hasPersonal = true
			break
		}
	}
	if !hasPersonal {
		log.Logger(ctx).Info("No sources found at first run, skip automatic workspaces creation")
		return nil
	}

	dao := servicecontext.GetDAO(ctx).(workspace.DAO)

	log.Logger(ctx).Info("Creating a Personal workspace")
	ws := &idm.Workspace{
		UUID:        uuid.NewUUID().String(),
		Label:       "Personal Files",
		Description: "Personal storage",
		Scope:       idm.WorkspaceScope_ADMIN,
		Slug:        "personal-files",
	}
	if _, e := dao.Add(ws); e != nil {
		return e
	}
	if e := dao.AddPolicies(false, ws.UUID, initialPolicies); e != nil {
		return e
	}
	acls := []*idm.ACL{
		{NodeID: "my-files", Action: utils.ACL_READ, RoleID: "ROOT_GROUP", WorkspaceID: ws.UUID},
		{NodeID: "my-files", Action: utils.ACL_WRITE, RoleID: "ROOT_GROUP", WorkspaceID: ws.UUID},
		{NodeID: "my-files", Action: &idm.ACLAction{Name: "workspace-path", Value: "my-files"}, WorkspaceID: ws.UUID},
	}
	service2.Retry(func() error {
		log.Logger(ctx).Info("Settings ACLS for Personal Files workspace")
		aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
		for _, acl := range acls {
			_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
			if e != nil {
				return e
			}
		}
		return nil
	}, 9*time.Second, 30*time.Second)

	acls = []*idm.ACL{
		{NodeID: "my-files", Action: utils.ACL_DENY, RoleID: "EXTERNAL_USERS", WorkspaceID: ws.UUID},
	}
	service2.Retry(func() error {
		log.Logger(ctx).Info("Denying access to Personal Files workspace for external users")
		aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
		for _, acl := range acls {
			_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
			if e != nil {
				return e
			}
		}
		return nil
	}, 9*time.Second, 30*time.Second)

	return nil
}
