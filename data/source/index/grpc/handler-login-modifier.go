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

package grpc

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/proto/service"
)

func (s *TreeServer) ModifyLogin(ctx context.Context, req *service.ModifyLoginRequest) (resp *service.ModifyLoginResponse, err error) {
	if req.Options == nil {
		return nil, fmt.Errorf("please provide name and uuid options")
	}
	resp = &service.ModifyLoginResponse{}
	opts := req.Options
	resp.Messages = append(resp.Messages, fmt.Sprintf("Received req %s=>%s with uuid %s (path %s)", req.OldLogin, req.NewLogin, opts["uuid"], opts["path"]))

	if !req.GetDryRun() {
		dao, err := s.getDAO(ctx, "")
		if err != nil {
			return nil, err
		}

		i, er := dao.UpdateNameInPlace(req.OldLogin, req.NewLogin, opts["uuid"], -1)
		if er != nil {
			return nil, er
		} else {
			resp.Messages = append(resp.Messages, fmt.Sprintf("Performed in-place name update in index! %d rows were affected (should be one!)", i))
		}
	}

	return
}
