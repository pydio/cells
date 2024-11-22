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

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/idm/user"
)

func HandleClean(ctx context.Context, msg *idm.ChangeEvent) error {

	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return err
	}

	if msg.Type == idm.ChangeEventType_DELETE && msg.Role != nil {
		return dao.CleanRole(ctx, msg.Role.Uuid)
	} else if msg.Type == idm.ChangeEventType_LOGIN && msg.User != nil {
		return dao.TouchUser(ctx, msg.User.Uuid)
	}

	return nil
}
