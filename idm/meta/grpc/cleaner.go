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
	"fmt"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/idm/meta"
	"github.com/pydio/cells/v4/idm/meta/namespace"
)

// Cleaner cleans bookmarks on user deletion
type Cleaner struct {
	dao func(ctx context.Context) meta.DAO
}

func NewCleaner(dao func(ctx context.Context) meta.DAO) *Cleaner {
	c := &Cleaner{}
	c.dao = dao
	return c
}

func (c *Cleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {

	if msg.Type != idm.ChangeEventType_DELETE || msg.User == nil || msg.User.IsGroup {
		return nil
	}
	go func() {
		// Remove user bookmarks
		metas, e := c.dao(ctx).Search(nil, nil, namespace.ReservedNamespaceBookmark, msg.User.Uuid, nil)
		if e != nil || len(metas) == 0 {
			return
		}
		ctx = servicecontext.WithServiceName(ctx, Name)
		log.Logger(ctx).Info(fmt.Sprintf("Cleaning %d bookmarks for user %s", len(metas), msg.User.Login))
		for _, m := range metas {
			c.dao(ctx).Del(m)
		}
	}()

	return nil
}
