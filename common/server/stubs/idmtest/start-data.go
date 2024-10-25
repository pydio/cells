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

package idmtest

import (
	"context"
	"fmt"
	"os"
	"path"
	"runtime"
	"sync"

	grpc2 "google.golang.org/grpc"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type TestData struct {
	Users      []*idm.User
	Workspaces []*idm.Workspace
	Roles      []*idm.Role
	ACLs       []*idm.ACL
}

func (t *TestData) WsSlugToUuid(slug string) string {
	for _, ws := range t.Workspaces {
		if ws.Slug == slug {
			return ws.UUID
		}
	}
	return ""
}

var (
	startData *TestData
	parse     sync.Once
)

func GetStartData() (*TestData, error) {
	var parseErr error
	_, filename, _, _ := runtime.Caller(0)
	parse.Do(func() {
		var bb []byte
		startData = &TestData{}
		sd := &rest.UsersCollection{}
		ws := &rest.WorkspaceCollection{}
		roles := &rest.RolesCollection{}
		acls := &rest.ACLCollection{}

		if bb, parseErr = os.ReadFile(path.Join(path.Dir(filename), "testdata", "start-users.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, sd); parseErr != nil {
			return
		}
		startData.Users = sd.Users

		if bb, parseErr = os.ReadFile(path.Join(path.Dir(filename), "testdata", "start-ws.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, ws); parseErr != nil {
			return
		}
		startData.Workspaces = ws.Workspaces

		if bb, parseErr = os.ReadFile(path.Join(path.Dir(filename), "testdata", "start-roles.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, roles); parseErr != nil {
			return
		}
		startData.Roles = roles.GetRoles()

		if bb, parseErr = os.ReadFile(path.Join(path.Dir(filename), "testdata", "start-acls.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, acls); parseErr != nil {
			return
		}
		startData.ACLs = acls.GetACLs()

	})
	return startData, parseErr
}

func RegisterIdmMocksWithData(ctx context.Context, testData *TestData) error {

	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		return fmt.Errorf("cannot find registry in context")
	}
	ii, _ := reg.List(registry.WithType(pb.ItemType_SERVICE))
	for _, item := range ii {
		svc := item.(service.Service)
		var cc grpc2.ClientConnInterface
		var err error
		switch item.Name() {
		case common.ServiceUserGRPC:
			cc, err = NewUsersService(ctx, svc, testData.Users...)
		case common.ServiceRoleGRPC:
			cc, err = NewRolesService(ctx, svc, testData.Roles...)
		case common.ServiceAclGRPC:
			cc, err = NewACLService(ctx, svc, testData.ACLs...)
		case common.ServiceWorkspaceGRPC:
			cc, err = NewWorkspacesService(ctx, svc, testData.Workspaces...)
		default:
			continue
		}
		if err != nil {
			return err
		}
		grpc.RegisterMock(item.Name(), cc)
	}
	return nil
}
