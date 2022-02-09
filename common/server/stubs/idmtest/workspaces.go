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

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/proto/idm"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/idm/workspace"
	srv "github.com/pydio/cells/v4/idm/workspace/grpc"
)

func NewWorkspacesService(ww ...*idm.Workspace) (grpc.ClientConnInterface, error) {
	sqlDao, er := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "idm_workspace")
	if er != nil {
		return nil, fmt.Errorf("unable to open sqlite3 DB file %v", er)
	}

	mockDAO := workspace.NewDAO(sqlDao)
	var options = configx.New()
	if err := mockDAO.Init(options); err != nil {
		return nil, fmt.Errorf("could not start test: unable to initialise WS DAO, error: %v", err)
	}

	serv := &idm.WorkspaceServiceStub{
		WorkspaceServiceServer: srv.NewHandler(nil, mockDAO.(workspace.DAO)),
	}
	ctx := servicecontext.WithDAO(context.Background(), mockDAO)
	for _, u := range ww {
		_, er := serv.WorkspaceServiceServer.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: u})
		if er != nil {
			return nil, er
		}
	}
	return serv, nil
}
