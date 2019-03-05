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
	"path/filepath"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"

	"github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	activity2 "github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
)

type MicroEventsSubscriber struct {
	client tree.NodeProviderClient
}

func publishActivityEvent(ctx context.Context, ownerType activity2.OwnerType, ownerId string, boxName activity.BoxName, activity *activity2.Object) {
	client.Publish(ctx, client.NewPublication(common.TOPIC_ACTIVITY_EVENT, &activity2.PostActivityEvent{
		OwnerType: ownerType,
		OwnerId:   ownerId,
		BoxName:   string(boxName),
		Activity:  activity,
	}))
}

// Handle processes the received events and sends them to the subscriber
func (e *MicroEventsSubscriber) Handle(ctx context.Context, msg *tree.NodeChangeEvent) error {

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	author := common.PYDIO_SYSTEM_USERNAME
	meta, ok := metadata.FromContext(ctx)
	if ok {
		user, exists := meta[common.PYDIO_CONTEXT_USER_KEY]
		user1, exists1 := meta[strings.ToLower(common.PYDIO_CONTEXT_USER_KEY)]
		if exists {
			author = user
		} else if exists1 {
			author = user1
		}
	}
	if author == common.PYDIO_SYSTEM_USERNAME {
		// Ignore events triggered by initial sync
		return nil
	}
	log.Logger(ctx).Debug("Fan out event to activities", zap.String(common.KEY_USER, author), msg.Zap(), zap.Any(common.KEY_CONTEXT, ctx))

	// Create Activities and post them to associated inboxes
	ac, Node := activity.DocumentActivity(author, msg)
	if Node != nil && Node.Uuid != "" {

		// Ignore hidden files
		if tree.IgnoreNodeForOutput(ctx, Node) {
			return nil
		}

		//
		// Post to the initial node Outbox
		//
		log.Logger(ctx).Debug("Posting Activity to node outbox")
		dao.PostActivity(activity2.OwnerType_NODE, Node.Uuid, activity.BoxOutbox, ac)
		publishActivityEvent(ctx, activity2.OwnerType_NODE, Node.Uuid, activity.BoxOutbox, ac)

		//
		// Post to the author Outbox
		//
		log.Logger(ctx).Debug("Posting Activity to author outbox")
		dao.PostActivity(activity2.OwnerType_USER, author, activity.BoxOutbox, ac)
		publishActivityEvent(ctx, activity2.OwnerType_USER, author, activity.BoxOutbox, ac)

		//
		// Post to parents Outbox'es as well
		//
		parentUuids := []string{}

		if msg.Type == tree.NodeChangeEvent_DELETE && Node.Path != "" {

			// Current Node
			parentUuids = append(parentUuids, Node.Uuid)
			// Manually load parents from Path
			parentPath := Node.Path
			for {
				parentPath = filepath.Dir(parentPath)
				if parentPath == "" || parentPath == "/" || parentPath == "." {
					break
				}
				if resp, err := e.client.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parentPath}}); err == nil && resp.Node != nil {
					uuid := resp.Node.Uuid
					parentUuids = append(parentUuids, uuid)
					log.Logger(ctx).Debug("Posting activity to parent node", zap.String(common.KEY_NODE_PATH, parentPath))
					dao.PostActivity(activity2.OwnerType_NODE, uuid, activity.BoxOutbox, ac)
					publishActivityEvent(ctx, activity2.OwnerType_NODE, uuid, activity.BoxOutbox, ac)
				}
			}

		} else {
			// Load Ancestors list - result includes initial node
			streamer, err := e.client.ListNodes(ctx, &tree.ListNodesRequest{
				Node:      Node,
				Ancestors: true,
			})
			if err != nil {
				return err
			}
			defer streamer.Close()
			for {
				listResp, err := streamer.Recv()
				if listResp == nil || err != nil {
					break
				}
				uuid := listResp.Node.Uuid
				path := listResp.Node.Path

				parentUuids = append(parentUuids, uuid)
				log.Logger(ctx).Debug("Posting activity to parent node", zap.String(common.KEY_NODE_PATH, path))
				dao.PostActivity(activity2.OwnerType_NODE, uuid, activity.BoxOutbox, ac)
				publishActivityEvent(ctx, activity2.OwnerType_NODE, uuid, activity.BoxOutbox, ac)
			}
		}

		//
		// Find followers and post activity to their Inbox
		//
		subscriptions, err := dao.ListSubscriptions(activity2.OwnerType_NODE, parentUuids)
		log.Logger(ctx).Debug("Listing followers on node and its parents", zap.Any("subs", subscriptions))
		if err != nil {
			return err
		}
		for _, subscription := range subscriptions {

			// TODO : COMPARE SUBSCRIBED EVENTS TO CURRENT EVENT ?
			if len(subscription.Events) == 0 {
				continue
			}
			// Ignore if author is user
			if subscription.UserId == author {
				continue
			}
			dao.PostActivity(activity2.OwnerType_USER, subscription.UserId, activity.BoxInbox, ac)
			publishActivityEvent(ctx, activity2.OwnerType_USER, subscription.UserId, activity.BoxInbox, ac)

		}

	}

	return nil
}
