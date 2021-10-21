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
	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	service2 "github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/service/resources"
)

// Handler for the rest package
type Handler struct {
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
		service2.RestError500(req, rsp, err)
		return
	}
	log.Logger(req.Request.Context()).Debug("Received ACL.Put API request", zap.Any("inputACL", inputACL))
	if er := a.WriteAllowed(ctx, &inputACL); er != nil {
		service2.RestError403(req, rsp, er)
		return
	}

	aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	response, er := aclClient.CreateACL(req.Request.Context(), &idm.CreateACLRequest{
		ACL: &inputACL,
	})
	if er != nil {
		service2.RestError500(req, rsp, er)
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
		service2.RestError500(req, rsp, err)
		return
	}
	log.Logger(req.Request.Context()).Debug("Received ACL.Delete API request", zap.Any("inputACL", inputACL))
	if er := a.WriteAllowed(ctx, &inputACL); er != nil {
		service2.RestError403(req, rsp, er)
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
	acQ, _ := ptypes.MarshalAny(q)
	query := &service.Query{
		SubQueries: []*any.Any{acQ},
	}

	aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	response, err := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{
		Query: query,
	})

	if err != nil {
		service2.RestError500(req, rsp, err)
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
		service2.RestError500(req, rsp, err)
		return
	}

	log.Logger(req.Request.Context()).Debug("Received ACL.Search API request", zap.Any("SearchRequest", restRequest))

	// Transform to standard query
	query := &service.Query{
		Limit:     restRequest.Limit,
		Offset:    restRequest.Offset,
		GroupBy:   restRequest.GroupBy,
		Operation: restRequest.Operation,
	}
	for _, q := range restRequest.Queries {
		anyfied, _ := ptypes.MarshalAny(q)
		query.SubQueries = append(query.SubQueries, anyfied)
	}

	aclClient := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	streamer, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: query,
	})
	if err != nil {
		service2.RestError500(req, rsp, err)
		return
	}
	defer streamer.Close()
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
