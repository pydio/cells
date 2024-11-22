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

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/idm"
	pbservice "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/meta"
)

// Cleaner cleans bookmarks on user deletion
type Cleaner struct{}

func HandleClean(ctx context.Context, msg *idm.ChangeEvent, srvName string) error {

	if msg.Type != idm.ChangeEventType_DELETE || msg.User == nil || msg.User.IsGroup {
		return nil
	}

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return err
	}

	go func() {
		searchUserMetaAny, err := anypb.New(&idm.SearchUserMetaRequest{
			Namespace: meta.ReservedNamespaceBookmark,
		})
		if err != nil {
			return
		}

		query := &pbservice.Query{
			SubQueries: []*anypb.Any{
				searchUserMetaAny,
			},
		}

		// Remove user bookmarks
		metas, e := dao.Search(ctx, query)
		if e != nil || len(metas) == 0 {
			return
		}
		ctx = runtime.WithServiceName(ctx, srvName)
		log.Logger(ctx).Info(fmt.Sprintf("Cleaning %d bookmarks for user %s", len(metas), msg.User.Login))
		for _, m := range metas {
			dao.Del(ctx, m)
		}
	}()

	return nil
}
