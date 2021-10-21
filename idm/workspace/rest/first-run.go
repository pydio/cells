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
	"fmt"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	service2 "github.com/pydio/cells/common/service"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

var (
	initialPolicies = []*service.ResourcePolicy{
		{Subject: "profile:standard", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
		{Subject: "profile:" + common.PydioProfileAdmin, Action: service.ResourcePolicyAction_WRITE, Effect: service.ResourcePolicy_allow},
	}
)

// FirstRun detects datasources created during install and create workspaces on them
func FirstRun(ctx context.Context) error {

	<-time.After(8 * time.Second)

	var hasPersonal bool
	var commonDS string
	// List datasources from configs
	sources := config.SourceNamesForDataServices(common.ServiceDataIndex)
	for _, s := range sources {
		if s == "personal" {
			hasPersonal = true
		} else if s == "cellsdata" || s == "versions" || s == "thumbnails" {
			continue
		} else {
			commonDS = s
		}
	}
	if !hasPersonal && commonDS == "" {
		log.Logger(ctx).Info("No sources found at first run, skip automatic workspaces creation")
		return nil
	}

	wsClient := idm.NewWorkspaceServiceClient(common.ServiceGrpcNamespace_+common.ServiceWorkspace, defaults.NewClient())

	if hasPersonal {
		log.Logger(ctx).Info("Creating a Personal workspace")
		ws := &idm.Workspace{
			UUID:        uuid.NewUUID().String(),
			Label:       "Personal Files",
			Description: "User personal data",
			Slug:        "personal-files",
		}
		createWs(ctx, wsClient, ws, "my-files", "my-files")
	}

	if commonDS != "" {
		log.Logger(ctx).Info("Creating a Common Files workspace on " + commonDS)
		ws := &idm.Workspace{
			UUID:        uuid.NewUUID().String(),
			Label:       "Common Files",
			Description: "Data shared by all users",
			Slug:        "common-files",
		}
		createWs(ctx, wsClient, ws, "DATASOURCE:"+commonDS, commonDS)

	}

	return nil
}

func createWs(ctx context.Context, wsClient idm.WorkspaceServiceClient, ws *idm.Workspace, rootUuid string, rootPath string) error {

	ws.Scope = idm.WorkspaceScope_ADMIN
	ws.Policies = initialPolicies

	// First check if it does not already exists, for one reason or another
	q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Slug: ws.Slug,
	})
	rC, e := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{
		SubQueries: []*any.Any{q},
		Limit:      1,
	}})
	if e == nil {
		defer rC.Close()
		for {
			resp, er := rC.Recv()
			if er != nil {
				break
			}
			if resp != nil && resp.Workspace != nil {
				// Workspace was found, exit now, avoid creating duplicates
				log.Logger(ctx).Info(fmt.Sprintf("Ignoring creation of %s workspace as it already exists", ws.Label))
				return nil
			}
		}
	}

	if _, e := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: ws}); e != nil {
		return e
	}
	acls := []*idm.ACL{
		{NodeID: rootUuid, Action: permissions.AclRead, RoleID: "ROOT_GROUP", WorkspaceID: ws.UUID},
		{NodeID: rootUuid, Action: permissions.AclWrite, RoleID: "ROOT_GROUP", WorkspaceID: ws.UUID},
		{NodeID: rootUuid, Action: &idm.ACLAction{Name: permissions.AclWsrootActionName, Value: rootPath}, WorkspaceID: ws.UUID},
		{NodeID: rootUuid, Action: permissions.AclRecycleRoot, WorkspaceID: ws.UUID},
	}
	service2.Retry(ctx, func() error {
		log.Logger(ctx).Info("Settings ACLS for workspace")
		aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
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
