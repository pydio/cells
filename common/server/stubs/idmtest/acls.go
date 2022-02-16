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
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/idm"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/idm/acl"
	srv "github.com/pydio/cells/v4/idm/acl/grpc"
)

func NewACLService(acls ...*idm.ACL) (grpc.ClientConnInterface, error) {

	mockDAO, e := dao.InitDAO(sqlite.Driver, sqlite.SharedMemDSN, "idm_acl", acl.NewDAO, configx.New())
	if e != nil {
		return nil, e
	}

	h := srv.NewHandler(nil, mockDAO.(acl.DAO))
	serv := &idm.ACLServiceStub{
		ACLServiceServer: h,
	}
	ctx := servicecontext.WithDAO(context.Background(), mockDAO)
	for _, u := range acls {
		_, er := serv.ACLServiceServer.CreateACL(ctx, &idm.CreateACLRequest{ACL: u})
		if er != nil {
			return nil, er
		}
	}
	return serv, nil
}
