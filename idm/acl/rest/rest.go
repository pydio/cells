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

package rest

import (
	"context"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	service "github.com/pydio/cells/v4/common/proto/service"
	service2 "github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

func NewHandler(ctx context.Context) service2.WebHandler {
	return &Handler{ctx: ctx}
}

// Handler for the rest package
type Handler struct {
	ctx context.Context

	resources.ResourceProviderHandler
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"ACLService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return nil
}

// PutAcl puts an acl in storage.
func (a *Handler) PutAcl(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var inputACL idm.ACL
	err := req.ReadEntity(&inputACL)
	if err != nil {
		log.Logger(ctx).Error("While fetching idm.ACL", zap.Error(err))
		middleware.RestError500(req, rsp, err)
		return
	}
	log.Logger(ctx).Debug("Received ACL.Put API request", zap.Any("inputACL", inputACL))
	if er := a.WriteAllowed(ctx, &inputACL); er != nil {
		middleware.RestError403(req, rsp, er)
		return
	}

	response, er := idmc.ACLServiceClient(ctx).CreateACL(ctx, &idm.CreateACLRequest{
		ACL: &inputACL,
	})
	if er != nil {
		middleware.RestError500(req, rsp, er)
	} else {
		a := response.ACL
		rsp.WriteEntity(a)
	}

}

// DeleteAcl deletes an acl from storage
func (a *Handler) DeleteAcl(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var inputACL idm.ACL
	err := req.ReadEntity(&inputACL)
	if err != nil {
		log.Logger(ctx).Error("While fetching idm.ACL", zap.Error(err))
		middleware.RestError500(req, rsp, err)
		return
	}
	log.Logger(req.Request.Context()).Debug("Received ACL.Delete API request", zap.Any("inputACL", inputACL))
	if er := a.WriteAllowed(ctx, &inputACL); er != nil {
		middleware.RestError403(req, rsp, er)
		return
	}

	q := &idm.ACLSingleQuery{}
	if inputACL.Action != nil {
		q.Actions = []*idm.ACLAction{inputACL.Action}
	}
	if inputACL.RoleID != "" {
		q.RoleIDs = []string{inputACL.RoleID}
	}
	if inputACL.NodeID != "" {
		q.NodeIDs = []string{inputACL.NodeID}
	}
	if inputACL.WorkspaceID != "" {
		q.WorkspaceIDs = []string{inputACL.WorkspaceID}
	}
	acQ, _ := anypb.New(q)
	query := &service.Query{
		SubQueries: []*anypb.Any{acQ},
	}

	response, err := idmc.ACLServiceClient(ctx).DeleteACL(ctx, &idm.DeleteACLRequest{
		Query: query,
	})

	if err != nil {
		middleware.RestError500(req, rsp, err)
	} else {
		restResp := &rest.DeleteResponse{
			Success: true,
			NumRows: response.RowsDeleted,
		}
		rsp.WriteEntity(restResp)
	}

}

// SearchAcls uses a stream to search in the acls
func (a *Handler) SearchAcls(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()

	var restRequest rest.SearchACLRequest
	err := req.ReadEntity(&restRequest)
	if err != nil {
		log.Logger(ctx).Error("While fetching rest.SearchACLRequest", zap.Error(err))
		middleware.RestError500(req, rsp, err)
		return
	}

	log.Logger(ctx).Debug("Received ACL.Search API request", zap.Any("SearchRequest", restRequest))

	// Transform to standard query
	query := &service.Query{
		Limit:     restRequest.Limit,
		Offset:    restRequest.Offset,
		GroupBy:   restRequest.GroupBy,
		Operation: restRequest.Operation,
	}
	for _, q := range restRequest.Queries {
		anyfied, _ := anypb.New(q)
		query.SubQueries = append(query.SubQueries, anyfied)
	}

	streamer, err := idmc.ACLServiceClient(ctx).SearchACL(ctx, &idm.SearchACLRequest{
		Query: query,
	})
	if err != nil {
		middleware.RestError500(req, rsp, err)
		return
	}
	defer streamer.CloseSend()
	collection := &rest.ACLCollection{}
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		collection.ACLs = append(collection.ACLs, resp.ACL)
	}
	rsp.WriteEntity(collection)

}
