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

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/idm/role"
)

func NewCleaner(handler idm.RoleServiceServer) *Cleaner {
	c := &Cleaner{}
	c.handler = handler
	c.Options = resources.PoliciesCleanerOptions{SubscribeUsers: true}
	return c
}

type Cleaner struct {
	resources.PoliciesCleaner
	handler idm.RoleServiceServer
}

func (c *Cleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {

	if msg.Type != idm.ChangeEventType_DELETE || msg.User == nil {
		return nil
	}
	dao, err := manager.Resolve[role.DAO](ctx)
	if err != nil {
		return err
	}

	q, _ := anypb.New(&idm.RoleSingleQuery{
		Uuid: []string{msg.User.Uuid},
	})
	if _, err := c.handler.DeleteRole(ctx, &idm.DeleteRoleRequest{
		Query: &service.Query{SubQueries: []*anypb.Any{q}},
	}); err != nil {
		log.Logger(ctx).Error("Error while deleting role associated to user", zap.Error(err))
		return err
	}

	// Call parent to clean policies as well
	return c.PoliciesCleaner.Handle(ctx, dao, msg)

}
