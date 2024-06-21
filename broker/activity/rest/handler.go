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

	restful "github.com/emicklei/go-restful/v3"

	activity2 "github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/broker/activity/render"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
)

// ActivityHandler responds to activity REST requests
type ActivityHandler struct {
	RuntimeCtx context.Context
	router     *compose.Reverse
}

func NewActivityHandler(ctx context.Context) *ActivityHandler {
	return &ActivityHandler{
		RuntimeCtx: ctx,
		router:     compose.ReverseClient(ctx),
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
	return activity.NewActivityServiceClient(grpc.ResolveConn(a.RuntimeCtx, common.ServiceActivity))
}

// Stream returns a collection of activities
func (a *ActivityHandler) Stream(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()

	var inputReq activity.StreamActivitiesRequest
	if err := req.ReadEntity(&inputReq); err != nil {
		return err
	}
	if inputReq.BoxName == "" {
		inputReq.BoxName = "outbox"
	}
	if inputReq.Language == "" {
		inputReq.Language = middleware.DetectedLanguages(ctx)[0]
	}
	client := a.getClient()

	if inputReq.UnreadCountOnly {
		if inputReq.Context != activity.StreamContext_USER_ID || len(inputReq.ContextData) == 0 {
			return errors.WithMessage(errors.InvalidParameters, "wrong arguments, please use only User context to get unread activities")
		}
		resp, err := client.UnreadActivitiesNumber(ctx, &activity.UnreadActivitiesRequest{
			UserId: inputReq.ContextData,
		})
		if err != nil {
			return err
		}
		return rsp.WriteEntity(activity2.CountCollection(resp.Number))
	}

	var collection []*activity.Object
	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil || len(accessList.GetWorkspaces()) == 0 {
		// Return Empty collection
		return rsp.WriteEntity(activity2.Collection(collection))
	}

	streamer, err := client.StreamActivities(ctx, &inputReq)
	serverLinks := render.NewServerLinks()
	serverLinks.URLS[render.ServerUrlTypeDocs], _ = url.Parse("doc://")
	serverLinks.URLS[render.ServerUrlTypeUsers], _ = url.Parse("user://")
	serverLinks.URLS[render.ServerUrlTypeWorkspaces], _ = url.Parse("workspaces://")

	if inputReq.AsDigest {
		// Get all collection, will be filtered by Digest() function
		if e := commons.ForEach(streamer, err, func(resp *activity.StreamActivitiesResponse) error {
			resp.Activity.Summary = render.Markdown(resp.Activity, activity.SummaryPointOfView_GENERIC, inputReq.Language, serverLinks)
			collection = append(collection, resp.Activity)
			return nil
		}); e != nil {
			return e
		}

		if digest, err := activity2.Digest(ctx, collection); err != nil {
			return err
		} else {
			return rsp.WriteEntity(digest)
		}

	} else {

		// Filter activities as they come
		if e := commons.ForEach(streamer, err, func(resp *activity.StreamActivitiesResponse) error {
			if a.filterActivity(ctx, accessList, resp.Activity) {
				resp.Activity.Summary = render.Markdown(resp.Activity, inputReq.PointOfView, inputReq.Language, serverLinks)
				collection = append(collection, resp.Activity)
			}
			return nil
		}); e != nil {
			return e
		}
		return rsp.WriteEntity(activity2.Collection(collection))
	}
}

// Subscribe hooks a given object to another one activity streams
func (a *ActivityHandler) Subscribe(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var subscription activity.Subscription
	if err := req.ReadEntity(&subscription); err != nil {
		return err
	}
	if name, _ := permissions.FindUserNameInContext(ctx); name == "" || subscription.UserId != name {
		return errors.WithMessage(errors.StatusForbidden, "you are not allowed to set subscription on this user")
	}
	resp, e := a.getClient().Subscribe(ctx, &activity.SubscribeRequest{
		Subscription: &subscription,
	})
	if e != nil {
		return e
	}
	return rsp.WriteEntity(resp.Subscription)

}

// SearchSubscriptions loads existing subscription for a given object
func (a *ActivityHandler) SearchSubscriptions(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var inputSearch activity.SearchSubscriptionsRequest
	if err := req.ReadEntity(&inputSearch); err != nil {
		return err
	}
	name, _ := permissions.FindUserNameInContext(ctx)
	if name == "" {
		return errors.WithMessage(errors.StatusForbidden, "you are not allowed to search for subscriptions")
	}
	inputSearch.UserIds = []string{name}

	streamer, e := a.getClient().SearchSubscriptions(ctx, &inputSearch)
	collection := &rest.SubscriptionsCollection{
		Subscriptions: []*activity.Subscription{},
	}
	if e = commons.ForEach(streamer, e, func(resp *activity.SearchSubscriptionsResponse) error {
		collection.Subscriptions = append(collection.Subscriptions, resp.Subscription)
		return nil
	}); e != nil {
		return e
	}
	return rsp.WriteEntity(collection)

}

// filterActivity is used internally to show only authorized events depending on the context
func (a *ActivityHandler) filterActivity(ctx context.Context, accessList *permissions.AccessList, ac *activity.Object) bool {

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
		for _, workspace := range accessList.GetWorkspaces() {
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
