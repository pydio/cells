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
	"path"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	serviceproto "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/meta"
)

func NewUserMetaHandler() *UserMetaHandler {
	return &UserMetaHandler{
		UserMetaClient: meta.NewUserMetaClient(),
	}
}

type UserMetaHandler struct {
	meta.UserMetaClient
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (s *UserMetaHandler) SwaggerTags() []string {
	return []string{"UserMetaService"}
}

// Filter returns a function to filter the swagger path
func (s *UserMetaHandler) Filter() func(string) string {
	return nil
}

// UpdateUserMeta will check for namespace policies before updating / deleting
func (s *UserMetaHandler) UpdateUserMeta(req *restful.Request, rsp *restful.Response) error {

	var input idm.UpdateUserMetaRequest
	if err := req.ReadEntity(&input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	response, err := s.PerformUserMetaUpdate(ctx, &input)
	if err != nil {
		return err
	}
	return rsp.WriteEntity(response)

}

func (s *UserMetaHandler) PerformUserMetaUpdate(ctx context.Context, input *idm.UpdateUserMetaRequest) (*idm.UpdateUserMetaResponse, error) {
	// First check the nodes permissions
	router := compose.UuidClient()
	for _, m := range input.MetaDatas {
		resp, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: m.NodeUuid}})
		if er != nil {
			return nil, er
		}
		if m.Namespace != meta.ReservedNamespaceBookmark {
			if _, er := router.CanApply(ctx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_CONTENT, Target: resp.Node}); er != nil {
				return nil, errors.Tag(er, errors.StatusForbidden)
			}
		}
		m.ResolvedNode = resp.GetNode()
		if m.ResolvedNode.MetaStore == nil {
			m.ResolvedNode.MetaStore = make(map[string]string)
		}
	}
	return s.UpdateMetaResolved(ctx, input)
}

// SearchUserMeta performs a search on user metadata
func (s *UserMetaHandler) SearchUserMeta(req *restful.Request, rsp *restful.Response) error {

	var input idm.SearchUserMetaRequest
	if err := req.ReadEntity(&input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	if output, e := s.PerformSearchMetaRequest(ctx, &input); e != nil {
		return e
	} else {
		return rsp.WriteEntity(output)
	}

}

// UserBookmarks searches meta with bookmark namespace and feeds a list of nodes with the results
func (s *UserMetaHandler) UserBookmarks(req *restful.Request, rsp *restful.Response) error {

	searchRequest := &idm.SearchUserMetaRequest{
		Namespace: meta.ReservedNamespaceBookmark,
	}
	ctx := req.Request.Context()
	router := compose.UuidClient()
	output, e := s.PerformSearchMetaRequest(ctx, searchRequest)
	if e != nil {
		return e
	}
	bulk := &rest.BulkMetaResponse{}
	for _, metadata := range output.Metadatas {
		node := &tree.Node{
			Uuid: metadata.NodeUuid,
		}
		if resp, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node}); e == nil {
			n := resp.Node
			if len(n.AppearsIn) == 0 {
				continue
			}
			n.Path = path.Join(n.AppearsIn[0].WsSlug, n.AppearsIn[0].Path)
			bulk.Nodes = append(bulk.Nodes, n.WithoutReservedMetas())
		} else {
			log.Logger(ctx).Debug("Ignoring Bookmark: ", zap.Error(e))
		}
	}
	return rsp.WriteEntity(bulk)

}

func (s *UserMetaHandler) UpdateUserMetaNamespace(req *restful.Request, rsp *restful.Response) error {

	var input idm.UpdateUserMetaNamespaceRequest
	if err := req.ReadEntity(&input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	// Validate input
	for _, ns := range input.Namespaces {
		if !strings.HasPrefix(ns.Namespace, common.MetaNamespaceUserspacePrefix) {
			return errors.WithMessage(errors.InvalidParameters, "user defined meta must start with "+common.MetaNamespaceUserspacePrefix+" prefix")
		}
		if _, e := ns.UnmarshallDefinition(); e != nil {
			return errors.WithMessagef(errors.UnmarshalError, "invalid json definition for namespace: %s, %v", ns.Namespace, e)
		}
	}

	response, err := s.ServiceClient(ctx).UpdateUserMetaNamespace(ctx, &input)
	if err != nil {
		return err
	} else {
		return rsp.WriteEntity(response)
	}

}

func (s *UserMetaHandler) ListUserMetaNamespace(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()

	output := &rest.UserMetaNamespaceCollection{}
	if ns, err := s.Namespaces(ctx); err == nil {
		for _, n := range ns {
			if n.Namespace == meta.ReservedNamespaceBookmark {
				continue
			}
			output.Namespaces = append(output.Namespaces, n)
		}
		return rsp.WriteEntity(output)
	} else {
		return err
	}

}

func (s *UserMetaHandler) ListUserMetaTags(req *restful.Request, rsp *restful.Response) error {
	ns := req.PathParameter("Namespace")
	ctx := req.Request.Context()
	log.Logger(ctx).Debug("Listing tags for namespace " + ns)
	nss, er := s.Namespaces(ctx)
	if er != nil {
		return er
	}
	if _, ok := nss[ns]; !ok { // ns not found or filtered by policies
		return errors.WithMessagef(errors.StatusNotFound, "namespace %s does not exist", ns)
	}
	tags, _ := s.TagValuesHandler().ListTags(ctx, ns)
	return rsp.WriteEntity(&rest.ListUserMetaTagsResponse{
		Tags: tags,
	})
}

func (s *UserMetaHandler) PutUserMetaTag(req *restful.Request, rsp *restful.Response) error {
	var r rest.PutUserMetaTagRequest
	if e := req.ReadEntity(&r); e != nil {
		return e
	}
	if r.Namespace == "" {
		r.Namespace = req.PathParameter("Namespace")
	}

	ctx := req.Request.Context()
	nss, er := s.Namespaces(ctx)
	if er != nil {
		return er
	}
	if nsObject, ok := nss[r.Namespace]; !ok { // ns not found or filtered by policies
		return errors.WithMessagef(errors.StatusNotFound, "namespace %s does not exist", r.Namespace)
	} else if !nsObject.PoliciesContextEditable {
		return errors.WithMessagef(errors.StatusForbidden, "updating namespace %s is not allowed", r.Namespace)
	}

	if e := s.TagValuesHandler().StoreNewTags(ctx, r.Namespace, []string{r.Tag}); e != nil {
		return e
	} else {
		return rsp.WriteEntity(&rest.PutUserMetaTagResponse{Success: true})
	}
}

func (s *UserMetaHandler) DeleteUserMetaTags(req *restful.Request, rsp *restful.Response) error {
	ns := req.PathParameter("Namespace")
	tag := req.PathParameter("Tags")
	ctx := req.Request.Context()
	log.Logger(ctx).Debug("Delete tags for namespace "+ns, zap.String("tag", tag))
	if tag == "*" {
		if e := s.TagValuesHandler().DeleteAllTags(ctx, ns); e != nil {
			return e
		}
	} else {
		return errors.WithMessage(errors.StatusNotImplemented, "please use * to clear all tags")
	}
	return rsp.WriteEntity(&rest.DeleteUserMetaTagsResponse{Success: true})
}

func (s *UserMetaHandler) PerformSearchMetaRequest(ctx context.Context, request *idm.SearchUserMetaRequest) (*rest.UserMetaCollection, error) {

	subjects, e := auth.SubjectsForResourcePolicyQuery(ctx, nil)
	if e != nil {
		return nil, e
	}
	// Append Subjects
	request.ResourceQuery = &serviceproto.ResourcePolicyQuery{
		Subjects: subjects,
	}

	output := &rest.UserMetaCollection{}
	stream, er := s.ServiceClient(ctx).SearchUserMeta(ctx, request)
	if er = commons.ForEach(stream, er, func(resp *idm.SearchUserMetaResponse) error {
		resp.UserMeta.PoliciesContextEditable = s.IsContextEditable(ctx, resp.UserMeta.GetUuid(), resp.UserMeta.GetPolicies())
		output.Metadatas = append(output.Metadatas, resp.UserMeta)
		return nil
	}); er != nil {
		return nil, er
	}

	return output, nil
}

func (s *UserMetaHandler) ListAllNamespaces(ctx context.Context, client idm.UserMetaServiceClient) (map[string]*idm.UserMetaNamespace, error) {
	return s.Namespaces(ctx)
}

func (s *UserMetaHandler) PoliciesForMeta(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*serviceproto.ResourcePolicy, e error) {

	return
}
