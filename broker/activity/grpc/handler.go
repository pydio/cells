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
	"fmt"
	"io"
	"strings"
	"sync"
	"time"

	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"
	"golang.org/x/net/context"

	"github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	proto "github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/context"
)

type Handler struct{}

func (h *Handler) PostActivity(ctx context.Context, stream proto.ActivityService_PostActivityStream) error {
	dao := servicecontext.GetDAO(ctx).(activity.DAO)
	defer stream.Close()
	for {
		request, e := stream.Recv()
		if e == io.EOF {
			return nil
		}
		if e != nil && e != io.EOF {
			return e
		}
		var boxName activity.BoxName
		switch request.BoxName {
		case "inbox":
			boxName = activity.BoxInbox
		case "outbox":
			boxName = activity.BoxOutbox
		default:
			return fmt.Errorf("unrecongnized box name")
		}
		if e := dao.PostActivity(request.OwnerType, request.OwnerId, boxName, request.Activity, ctx); e != nil {
			return e
		}
	}
}

func (h *Handler) StreamActivities(ctx context.Context, request *proto.StreamActivitiesRequest, stream proto.ActivityService_StreamActivitiesStream) error {

	dao := servicecontext.GetDAO(ctx).(activity.DAO)
	defer stream.Close()

	log.Logger(ctx).Debug("Should get activities", zap.Any("r", request))
	treeStreamer := tree.NewNodeProviderStreamerClient(registry.GetClient(common.ServiceTree))
	sClient, e := treeStreamer.ReadNodeStream(ctx)
	if e != nil {
		return e
	}
	defer sClient.Close()
	replace := make(map[string]string)
	valid := make(map[string]bool)

	result := make(chan *proto.Object)
	done := make(chan bool)

	wg := sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case ac := <-result:
				if ac.Type != proto.ObjectType_Delete && ac.Object != nil && (ac.Object.Type == proto.ObjectType_Document || ac.Object.Type == proto.ObjectType_Folder) && ac.Object.Id != "" {
					oName := ac.Object.Name
					if _, o := valid[oName]; o {
						//fmt.Println("nothing to do ")
					} else if r, o := replace[oName]; o {
						//fmt.Println("replace from cache")
						ac.Object.Name = r
					} else if e := sClient.Send(&tree.ReadNodeRequest{Node: &tree.Node{Uuid: ac.Object.Id}}); e == nil {
						rsp, er := sClient.Recv()
						if er == nil {
							nP := strings.TrimRight(rsp.GetNode().GetPath(), "/")
							if oName != nP {
								//fmt.Println("replacing", oName, "with", nP)
								ac.Object.Name = nP
								replace[oName] = rsp.GetNode().GetPath()
							} else {
								//fmt.Println("set valid")
								valid[oName] = true
							}
						}
					}
				}
				stream.Send(&proto.StreamActivitiesResponse{
					Activity: ac,
				})
			case <-done:
				return
			}
		}
	}()

	boxName := activity.BoxOutbox
	if request.BoxName == "inbox" {
		boxName = activity.BoxInbox
	}

	if request.Context == proto.StreamContext_NODE_ID {
		dao.ActivitiesFor(proto.OwnerType_NODE, request.ContextData, boxName, "", request.Offset, request.Limit, result, done)
		wg.Wait()
	} else if request.Context == proto.StreamContext_USER_ID {
		var refBoxOffset activity.BoxName
		if request.AsDigest {
			refBoxOffset = activity.BoxLastSent
		}
		dao.ActivitiesFor(proto.OwnerType_USER, request.ContextData, boxName, refBoxOffset, request.Offset, request.Limit, result, done)
		wg.Wait()
	}

	return nil
}

func (h *Handler) Subscribe(ctx context.Context, request *proto.SubscribeRequest, resp *proto.SubscribeResponse) (err error) {

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	subscription := request.Subscription

	resp.Subscription = subscription
	return dao.UpdateSubscription(subscription)

}

func (h *Handler) SearchSubscriptions(ctx context.Context, request *proto.SearchSubscriptionsRequest, stream proto.ActivityService_SearchSubscriptionsStream) error {

	defer stream.Close()

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	var userId string
	var objectType = proto.OwnerType_NODE
	if len(request.ObjectIds) == 0 {
		return fmt.Errorf("please provide one or more object id")
	}
	if len(request.UserIds) > 0 {
		userId = request.UserIds[0]
	}
	users, err := dao.ListSubscriptions(objectType, request.ObjectIds)
	if err != nil {
		return err
	}
	for _, sub := range users {
		if len(sub.Events) == 0 {
			continue
		}
		if userId != "" && sub.UserId != userId {
			continue
		}
		stream.Send(&proto.SearchSubscriptionsResponse{
			Subscription: sub,
		})
	}
	return nil
}

func (h *Handler) UnreadActivitiesNumber(ctx context.Context, request *proto.UnreadActivitiesRequest, response *proto.UnreadActivitiesResponse) error {

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	number := dao.CountUnreadForUser(request.UserId)
	response.Number = int32(number)

	return nil
}

func (h *Handler) SetUserLastActivity(ctx context.Context, request *proto.UserLastActivityRequest, response *proto.UserLastActivityResponse) error {

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	var boxName activity.BoxName
	if request.BoxName == "lastread" {
		boxName = activity.BoxLastRead
	} else if request.BoxName == "lastsent" {
		boxName = activity.BoxLastSent
	} else {
		return fmt.Errorf("Invalid box name")
	}

	if err := dao.StoreLastUserInbox(request.UserId, boxName, nil, request.ActivityId); err == nil {
		response.Success = true
		return nil
	} else {
		return err
	}

}

func (h *Handler) PurgeActivities(ctx context.Context, request *proto.PurgeActivitiesRequest, response *proto.PurgeActivitiesResponse) error {

	if request.BoxName != string(activity.BoxInbox) && request.BoxName != string(activity.BoxOutbox) {
		return errors.BadRequest("invalid.parameter", "Please provide one of inbox|outbox box name")
	}
	count := int32(0)
	logger := func(s string) {
		count++
		log.TasksLogger(ctx).Info(s)
	}
	dao := servicecontext.GetDAO(ctx).(activity.DAO)
	var updated time.Time
	if request.UpdatedBeforeTimestamp > 0 {
		updated = time.Unix(int64(request.UpdatedBeforeTimestamp), 0)
	}
	dao.Purge(logger, request.OwnerType, request.OwnerID, activity.BoxName(request.BoxName), int(request.MinCount), int(request.MaxCount), updated, request.CompactDB, request.ClearBackups)
	response.Success = true
	response.DeletedCount = count
	return nil

}
