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

	"github.com/pydio/cells/v4/common/client/grpc"

	"go.uber.org/zap"
	"golang.org/x/net/context"

	"github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	proto "github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
)

type Handler struct {
	proto.UnimplementedActivityServiceServer
	RuntimeCtx context.Context
	dao        activity.DAO
}

func (h *Handler) Name() string {
	return Name
}

func (h *Handler) PostActivity(stream proto.ActivityService_PostActivityServer) error {
	ctx := stream.Context()
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
			return fmt.Errorf("unrecognized box name")
		}
		if e := h.dao.PostActivity(ctx, request.OwnerType, request.OwnerId, boxName, request.Activity, true); e != nil {
			return e
		}
	}
}

func (h *Handler) StreamActivities(request *proto.StreamActivitiesRequest, stream proto.ActivityService_StreamActivitiesServer) error {

	ctx := stream.Context()
	log.Logger(ctx).Debug("Should get activities", zap.Any("r", request))
	treeStreamer := tree.NewNodeProviderStreamerClient(grpc.GetClientConnFromCtx(h.RuntimeCtx, common.ServiceTree))
	sClient, e := treeStreamer.ReadNodeStream(ctx)
	if e != nil {
		return e
	}
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
		h.dao.ActivitiesFor(nil, proto.OwnerType_NODE, request.ContextData, boxName, "", request.Offset, request.Limit, result, done)
		wg.Wait()
	} else if request.Context == proto.StreamContext_USER_ID {
		var refBoxOffset activity.BoxName
		if request.AsDigest {
			refBoxOffset = activity.BoxLastSent
		}
		h.dao.ActivitiesFor(nil, proto.OwnerType_USER, request.ContextData, boxName, refBoxOffset, request.Offset, request.Limit, result, done)
		wg.Wait()
	}

	return nil
}

func (h *Handler) Subscribe(ctx context.Context, request *proto.SubscribeRequest) (*proto.SubscribeResponse, error) {

	if e := h.dao.UpdateSubscription(nil, request.Subscription); e != nil {
		return nil, e
	}
	return &proto.SubscribeResponse{
		Subscription: request.Subscription,
	}, nil

}

func (h *Handler) SearchSubscriptions(request *proto.SearchSubscriptionsRequest, stream proto.ActivityService_SearchSubscriptionsServer) error {

	var userId string
	var objectType = proto.OwnerType_NODE
	if len(request.ObjectIds) == 0 {
		return fmt.Errorf("please provide one or more object id")
	}
	if len(request.UserIds) > 0 {
		userId = request.UserIds[0]
	}
	users, err := h.dao.ListSubscriptions(nil, objectType, request.ObjectIds)
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

func (h *Handler) UnreadActivitiesNumber(ctx context.Context, request *proto.UnreadActivitiesRequest) (*proto.UnreadActivitiesResponse, error) {

	number := h.dao.CountUnreadForUser(nil, request.UserId)
	return &proto.UnreadActivitiesResponse{
		Number: int32(number),
	}, nil

}

func (h *Handler) SetUserLastActivity(ctx context.Context, request *proto.UserLastActivityRequest) (*proto.UserLastActivityResponse, error) {

	var boxName activity.BoxName
	if request.BoxName == "lastread" {
		boxName = activity.BoxLastRead
	} else if request.BoxName == "lastsent" {
		boxName = activity.BoxLastSent
	} else {
		return nil, fmt.Errorf("invalid box name")
	}

	if err := h.dao.StoreLastUserInbox(nil, request.UserId, boxName, request.ActivityId); err == nil {
		return &proto.UserLastActivityResponse{Success: true}, nil
	} else {
		return nil, err
	}

}

func (h *Handler) PurgeActivities(ctx context.Context, request *proto.PurgeActivitiesRequest) (*proto.PurgeActivitiesResponse, error) {

	if request.BoxName != string(activity.BoxInbox) && request.BoxName != string(activity.BoxOutbox) {
		return nil, errors.BadRequest("invalid.parameter", "Please provide one of inbox|outbox box name")
	}
	count := int32(0)
	logger := func(s string) {
		count++
		log.TasksLogger(ctx).Info(s)
	}

	var updated time.Time
	if request.UpdatedBeforeTimestamp > 0 {
		updated = time.Unix(int64(request.UpdatedBeforeTimestamp), 0)
	}

	e := h.dao.Purge(nil, logger, request.OwnerType, request.OwnerID, activity.BoxName(request.BoxName), int(request.MinCount), int(request.MaxCount), updated, request.CompactDB, request.ClearBackups)
	return &proto.PurgeActivitiesResponse{
		Success:      true,
		DeletedCount: count,
	}, e

}
