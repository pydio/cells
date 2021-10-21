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
	"strings"

	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"

	activity "github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	activity2 "github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
)

type MetaProvider struct {
}

func (m *MetaProvider) ReadNodeStream(ctx context.Context, streamer tree.NodeProviderStreamer_ReadNodeStreamStream) error {

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	// Extract current user Id from X-Pydio-User key
	var userId string
	if meta, ok := metadata.FromContext(ctx); ok {
		if value, ok2 := meta[common.PydioContextUserKey]; ok2 {
			userId = value
		}
		// TODO - WTF WITH LOWER CASE ?
		if value, ok2 := meta[strings.ToLower(common.PydioContextUserKey)]; ok2 {
			userId = value
		}
	}

	defer streamer.Close()

	for {
		request, err := streamer.Recv()
		if request == nil {
			break
		}
		if err != nil {
			return err
		}
		node := request.Node
		if userId != "" { // No user found, just skip
			if subs, err := dao.ListSubscriptions(activity2.OwnerType_NODE, []string{node.Uuid}); err == nil {
				for _, sub := range subs {
					if sub.UserId == userId && len(sub.Events) > 0 {
						events := strings.Join(sub.Events, ",")
						log.Logger(ctx).Debug("ReadNodeStream - Adding meta", zap.String("user_subscriptions", events))
						node.SetMeta("user_subscriptions", events)
					}
				}
			} else {
				log.Logger(ctx).Error("cannot list subscriptions for "+userId, node.Zap(), zap.Error(err))
			}
		}

		streamer.Send(&tree.ReadNodeResponse{Node: node})
	}

	return nil

}
