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

package rest

import (
	"context"
	"net/url"

	"github.com/pydio/cells/v4/common/client/grpc"
	servicecontext "github.com/pydio/cells/v4/common/service/context"

	"github.com/pydio/cells/v4/common/nodes/compose"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	activity2 "github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/broker/activity/render"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/i18n"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

// ActivityHandler responds to activity REST requests
type ActivityHandler struct {
	RuntimeCtx context.Context
	router     *compose.Reverse
}

func NewActivityHandler(ctx context.Context) *ActivityHandler {
	return &ActivityHandler{
		RuntimeCtx: ctx,
		router: compose.ReverseClient(
			nodes.WithContext(ctx),
			nodes.WithRegistryWatch(servicecontext.GetRegistry(ctx)),
		),
	}
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *ActivityHandler) SwaggerTags() []string {
	return []string{"ActivityService"}
}

// Filter returns a function to filter the swagger path
func (a *ActivityHandler) Filter() func(string) string {
	return nil
}

// Internal function to retrieve activity GRPC client
func (a *ActivityHandler) getClient() activity.ActivityServiceClient {
	return activity.NewActivityServiceClient(grpc.GetClientConnFromCtx(a.RuntimeCtx, common.ServiceActivity))
}

// Stream returns a collection of activities
func (a *ActivityHandler) Stream(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()

	var inputReq activity.StreamActivitiesRequest
	err := req.ReadEntity(&inputReq)
	if err != nil {
		log.Logger(ctx).Error("cannot fetch activity.StreamActivitiesRequest", zap.Error(err))
		service.RestError500(req, rsp, err)
		return
	}
	if inputReq.BoxName == "" {
		inputReq.BoxName = "outbox"
	}
	if inputReq.Language == "" {
		inputReq.Language = i18n.UserLanguagesFromRestRequest(req, config.Get())[0]
	}
	client := a.getClient()

	if inputReq.UnreadCountOnly {
		if inputReq.Context != activity.StreamContext_USER_ID || len(inputReq.ContextData) == 0 {
			service.RestError500(req, rsp, errors.New("wrong arguments, please use only User context to get unread activities"))
			return
		}
		resp, err := client.UnreadActivitiesNumber(ctx, &activity.UnreadActivitiesRequest{
			UserId: inputReq.ContextData,
		})
		if err != nil {
			service.RestErrorDetect(req, rsp, err)
			return
		}
		rsp.WriteEntity(activity2.CountCollection(resp.Number))
		return
	}

	var collection []*activity.Object
	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if len(accessList.Workspaces) == 0 || err != nil {
		// Return Empty collection
		rsp.WriteEntity(activity2.Collection(collection))
		return
	}

	streamer, err := client.StreamActivities(ctx, &inputReq)
	if err != nil {
		log.Logger(ctx).Error("cannot get activity stream", zap.Error(err))
		service.RestErrorDetect(req, rsp, err)
		return
	}
	serverLinks := render.NewServerLinks()
	serverLinks.URLS[render.ServerUrlTypeDocs], _ = url.Parse("doc://")
	serverLinks.URLS[render.ServerUrlTypeUsers], _ = url.Parse("user://")
	serverLinks.URLS[render.ServerUrlTypeWorkspaces], _ = url.Parse("workspaces://")

	if inputReq.AsDigest {
		// Get all collection, will be filtered by Digest() function
		for {
			resp, e := streamer.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			resp.Activity.Summary = render.Markdown(resp.Activity, activity.SummaryPointOfView_GENERIC, inputReq.Language, serverLinks)
			collection = append(collection, resp.Activity)
		}
		digest, err := activity2.Digest(ctx, collection)
		if err != nil {
			log.Logger(ctx).Error("cannot build Digest", zap.Error(err))
			service.RestError500(req, rsp, err)
			return
		}
		rsp.WriteEntity(digest)

	} else {

		// Filter activities as they come
		for {
			resp, e := streamer.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			if a.FilterActivity(ctx, accessList, resp.Activity) {
				resp.Activity.Summary = render.Markdown(resp.Activity, inputReq.PointOfView, inputReq.Language, serverLinks)
				collection = append(collection, resp.Activity)
			}

		}

		collectionObject := activity2.Collection(collection)
		rsp.WriteEntity(collectionObject)
	}
}

// Subscribe hooks a given object to another one activity streams
func (a *ActivityHandler) Subscribe(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()

	var subscription activity.Subscription
	err := req.ReadEntity(&subscription)
	if err != nil {
		log.Logger(ctx).Error("cannot fetch activity.Subscription", zap.Error(err))
		service.RestError500(req, rsp, err)
		return
	}

	resp, e := a.getClient().Subscribe(ctx, &activity.SubscribeRequest{
		Subscription: &subscription,
	})
	if e != nil {
		log.Logger(ctx).Error("cannot subscribe to activity stream", subscription.Zap(), zap.Error(e))
		service.RestErrorDetect(req, rsp, err)
		return
	}

	rsp.WriteEntity(resp.Subscription)
}

// SearchSubscriptions loads existing subscription for a given object
func (a *ActivityHandler) SearchSubscriptions(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var inputSearch activity.SearchSubscriptionsRequest
	err := req.ReadEntity(&inputSearch)
	if err != nil {
		log.Logger(ctx).Error("cannot fetch activity.SearchSubscriptionsRequest from REST request", zap.Error(err))
		service.RestError500(req, rsp, err)
		return
	}

	streamer, e := a.getClient().SearchSubscriptions(ctx, &inputSearch)
	if e != nil {
		log.Logger(ctx).Error("cannot get subscription stream", zap.Error(e))
		service.RestErrorDetect(req, rsp, err)
		return
	}
	collection := &rest.SubscriptionsCollection{
		Subscriptions: []*activity.Subscription{},
	}
	for {
		resp, rE := streamer.Recv()
		if rE != nil {
			break
		}
		if resp == nil {
			continue
		}
		collection.Subscriptions = append(collection.Subscriptions, resp.Subscription)
	}

	rsp.WriteEntity(collection)
}

// FilterActivity is used internally to show only authorized events depending on the context
func (a *ActivityHandler) FilterActivity(ctx context.Context, accessList *permissions.AccessList, ac *activity.Object) bool {

	if ac.Object == nil {
		return true
	}

	obj := ac.Object
	if (obj.Type == activity.ObjectType_Folder || obj.Type == activity.ObjectType_Document) && obj.Name != "" {
		node := &tree.Node{Path: obj.Name, Uuid: obj.Id}
		count := 0
		reqAcl := accessList
		if ac.Type == activity.ObjectType_Delete {
			reqAcl = nil
		}
		for _, workspace := range accessList.Workspaces {
			if filtered, ok := a.router.WorkspaceCanSeeNode(ctx, reqAcl, workspace, node); ok {
				if obj.PartOf == nil {
					obj.PartOf = &activity.Object{
						Type:  activity.ObjectType_Collection,
						Items: []*activity.Object{},
					}
				}
				obj.PartOf.Items = append(obj.PartOf.Items, &activity.Object{
					Type: activity.ObjectType_Workspace,
					Id:   workspace.UUID,
					Name: workspace.Label,
					Rel:  filtered.Path,
				})
				count++
			}
		}

		if count == 0 {
			//log.Logger(ctx).Error("Filtered out", zap.Any("ac", ac))
			return false
		}

		// Set path as first path
		obj.Name = obj.PartOf.Items[0].Rel
		ac.Object = obj
		return true
	}

	return true
}
