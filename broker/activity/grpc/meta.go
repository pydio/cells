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
	"strings"

	"go.uber.org/zap"
	"golang.org/x/net/context"

	activity "github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	activity2 "github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

type MetaProvider struct {
	tree.UnimplementedNodeProviderStreamerServer
	RuntimeCtx context.Context
	dao        activity.DAO
}

func (m *MetaProvider) Name() string {
	return Name
}

func (m *MetaProvider) ReadNodeStream(streamer tree.NodeProviderStreamer_ReadNodeStreamServer) error {

	ctx := streamer.Context()
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

	//defer streamer.Close()

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
			if subs, err := m.dao.ListSubscriptions(activity2.OwnerType_NODE, []string{node.Uuid}); err == nil {
				for _, sub := range subs {
					if sub.UserId == userId && len(sub.Events) > 0 {
						events := strings.Join(sub.Events, ",")
						log.Logger(ctx).Debug("ReadNodeStream - Adding meta", zap.String("user_subscriptions", events))
						node.MustSetMeta(common.MetaFlagUserSubscriptions, events)
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
