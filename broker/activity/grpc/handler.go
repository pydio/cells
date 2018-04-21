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
	"fmt"
	"sync"

	activity "github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/common/log"
	proto "github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/service/context"
	"go.uber.org/zap"
	"golang.org/x/net/context"
)

type Handler struct {
	db activity.DAO
}

func (h *Handler) PostActivity(ctx context.Context, stream proto.ActivityService_PostActivityStream) error {
	return nil
}

func (h *Handler) StreamActivities(ctx context.Context, request *proto.StreamActivitiesRequest, stream proto.ActivityService_StreamActivitiesStream) error {

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	log.Logger(ctx).Debug("Should get activities", zap.Any("r", request))

	result := make(chan *proto.Object)
	done := make(chan bool)

	wg := sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case ac := <-result:
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

	dao := servicecontext.GetDAO(ctx).(activity.DAO)

	var userId string
	var objectType = proto.OwnerType_NODE
	if len(request.ObjectIds) == 0 {
		return fmt.Errorf("Please provide one or more objectId")
	}
	if len(request.UserIds) > 0 {
		userId = request.UserIds[0]
	}
	users, err := dao.ListSubscriptions(objectType, request.ObjectIds)
	if err != nil {
		return err
	}
	defer stream.Close()
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
