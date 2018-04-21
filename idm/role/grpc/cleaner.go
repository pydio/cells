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

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/service/resources"
)

func NewCleaner(handler *Handler, dao dao.DAO) *Cleaner {
	c := &Cleaner{}
	c.Dao = dao
	c.handler = handler
	c.Options = resources.PoliciesCleanerOptions{SubscribeUsers: true}
	return c
}

type Cleaner struct {
	resources.PoliciesCleaner
	handler *Handler
}

func (c *Cleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {

	if msg.Type != idm.ChangeEventType_DELETE || msg.User == nil {
		return nil
	}
	q, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{
		Uuid: []string{msg.User.Uuid},
	})
	if err := c.handler.DeleteRole(ctx, &idm.DeleteRoleRequest{
		Query: &service.Query{SubQueries: []*any.Any{q}},
	}, &idm.DeleteRoleResponse{}); err != nil {
		log.Logger(ctx).Error("Error while deleting role associated to user", zap.Error(err))
		return err
	}

	// Call parent to clean policies as well
	return c.PoliciesCleaner.Handle(ctx, msg)

}
