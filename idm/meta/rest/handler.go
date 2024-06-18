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
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/client/commons"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	serviceproto "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/idm/meta"
)

const (
	ReservedNSBookmark = meta.ReservedNamespaceBookmark
)

func NewUserMetaHandler(ctx context.Context) *UserMetaHandler {
	handler := new(UserMetaHandler)
	handler.ctx = ctx
	handler.ServiceName = common.ServiceUserMeta
	handler.ResourceName = "userMeta"
	handler.PoliciesLoader = handler.PoliciesForMeta
	handler.tvc = &meta.TagsValuesClient{}
	return handler
}

func userMetaClient(ctx context.Context) idm.UserMetaServiceClient {
	return idmc.UserMetaServiceClient(ctx)
}

type UserMetaHandler struct {
	ctx context.Context
	tvc *meta.TagsValuesClient
	resources.ResourceProviderHandler
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (s *UserMetaHandler) SwaggerTags() []string {
	return []string{"UserMetaService"}
}

// Filter returns a function to filter the swagger path
func (s *UserMetaHandler) Filter() func(string) string {
	return nil
}

// Handle special case for "content_lock" meta => store in ACL instead of user metadatas
func (s *UserMetaHandler) updateLock(ctx context.Context, meta *idm.UserMeta, operation idm.UpdateUserMetaRequest_UserMetaOp) error {
	log.Logger(ctx).Debug("Should update content lock in ACLs", zap.Any("meta", meta), zap.Any("operation", operation))
	nodeUuid := meta.NodeUuid
	aclClient := idmc.ACLServiceClient(ctx)
	q, _ := anypb.New(&idm.ACLSingleQuery{
		NodeIDs: []string{nodeUuid},
		Actions: []*idm.ACLAction{{Name: permissions.AclContentLock.Name}},
	})
	userName, _ := permissions.FindUserNameInContext(ctx)
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &serviceproto.Query{SubQueries: []*anypb.Any{q}}})
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	for {
		rsp, e := stream.Recv()
		if e != nil {
			break
		}
		if rsp == nil {
			continue
		}
		acl := rsp.ACL
		if userName == "" || acl.Action.Value != userName {
			return errors.WithStack(errors.StatusLocked)
		}
		break
	}
	meta.JsonValue = userName // Override any original value
	if operation == idm.UpdateUserMetaRequest_PUT {
		if _, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
			NodeID: nodeUuid,
			Action: &idm.ACLAction{Name: "content_lock", Value: meta.JsonValue},
		}}); e != nil {
			return e
		}
	} else {
		req := &idm.DeleteACLRequest{Query: &serviceproto.Query{SubQueries: []*anypb.Any{q}}}
		if _, e := aclClient.DeleteACL(ctx, req); e != nil {
			return e
		}
	}
	return nil
}

// UpdateUserMeta will check for namespace policies before updating / deleting
func (s *UserMetaHandler) UpdateUserMeta(req *restful.Request, rsp *restful.Response) error {

	var input idm.UpdateUserMetaRequest
	if err := req.ReadEntity(&input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	nsList, e := s.ListAllNamespaces(ctx, userMetaClient(req.Request.Context()))
	if e != nil {
		return e
	}
	var loadUuids []string
	router := compose.UuidClient(s.ctx)

	// First check if the namespaces are globally accessible
	for _, meta := range input.MetaDatas {
		var ns *idm.UserMetaNamespace
		var exists bool
		resp, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: meta.NodeUuid}})
		if er != nil {
			return er
		}
		if meta.Namespace != ReservedNSBookmark {
			if _, er := router.CanApply(ctx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_CONTENT, Target: resp.Node}); er != nil {
				return errors.Tag(er, errors.StatusForbidden)
			}
		}
		meta.ResolvedNode = resp.Node.Clone()
		if meta.ResolvedNode.MetaStore == nil {
			meta.ResolvedNode.MetaStore = map[string]string{}
		}
		if meta.Namespace == permissions.AclContentLock.Name {
			if e = s.updateLock(ctx, meta, input.Operation); e != nil {
				return e
			}
			return rsp.WriteEntity(&idm.UpdateUserMetaResponse{MetaDatas: []*idm.UserMeta{meta}})
		}
		if ns, exists = nsList[meta.Namespace]; !exists {
			return errors.WithMessagef(errors.StatusNotFound, "Namespace %s is not defined!", meta.Namespace)
		}

		if !s.MatchPolicies(ctx, meta.Namespace, ns.Policies, serviceproto.ResourcePolicyAction_WRITE) {
			return errors.WithMessagef(errors.NamespaceNotAllowed, "Updating namespace %s is not allowed!", meta.Namespace)
		}
		if meta.Uuid != "" {
			loadUuids = append(loadUuids, meta.Uuid)
		}
		if ns.JsonDefinition != "" {
			// Special case for tags: automatically update stored list
			if nsDef, jE := ns.UnmarshallDefinition(); jE == nil && nsDef.GetType() == "tags" {
				var currentValue string
				if e := json.Unmarshal([]byte(meta.JsonValue), &currentValue); e != nil {
					return errors.Tag(e, errors.UnmarshalError)
				}
				log.Logger(ctx).Debug("jsonDef for namespace "+ns.Namespace, zap.Any("d", nsDef), zap.Any("v", currentValue))
				if e := s.tvc.StoreNewTags(ctx, ns.Namespace, strings.Split(currentValue, ",")); e != nil {
					return errors.WithMessagef(errors.StatusInternalServerError, "could not store meta tag for namespace %s: %v", ns.Namespace, e)
				}
			} else if jE != nil {
				return errors.WithMessagef(errors.UnmarshalError, "cannot decode json definition for namespace %s (%s): %v", ns.Namespace, ns.JsonDefinition, jE)
			}
		}
		// Now update policies for input Meta
		if meta.Namespace == ReservedNSBookmark {
			userName, c := permissions.FindUserNameInContext(ctx)
			meta.Policies = []*serviceproto.ResourcePolicy{
				{Action: serviceproto.ResourcePolicyAction_OWNER, Subject: c.Subject, Effect: serviceproto.ResourcePolicy_allow},
				{Action: serviceproto.ResourcePolicyAction_READ, Subject: "user:" + userName, Effect: serviceproto.ResourcePolicy_allow},
				{Action: serviceproto.ResourcePolicyAction_WRITE, Subject: "user:" + userName, Effect: serviceproto.ResourcePolicy_allow},
				{Action: serviceproto.ResourcePolicyAction_WRITE, Subject: "profile:admin", Effect: serviceproto.ResourcePolicy_allow},
			}
		} else {
			meta.Policies = ns.Policies
		}
	}
	// Some existing meta will be updated / deleted : load their policies and check their rights!
	umc := userMetaClient(ctx)
	if len(loadUuids) > 0 {
		stream, e := umc.SearchUserMeta(ctx, &idm.SearchUserMetaRequest{MetaUuids: loadUuids})
		if e = commons.ForEach(stream, e, func(t *idm.SearchUserMetaResponse) error {
			if !s.MatchPolicies(ctx, t.GetUserMeta().GetUuid(), t.GetUserMeta().GetPolicies(), serviceproto.ResourcePolicyAction_WRITE) {
				return errors.WithMessagef(errors.NamespaceNotAllowed, "policies do not match for ns %s", t.GetUserMeta().GetNamespace())
			}
			return nil
		}); e != nil {
			return e
		}
	}
	if response, err := umc.UpdateUserMeta(ctx, &input); err != nil {
		return err
	} else {
		return rsp.WriteEntity(response)
	}

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
		Namespace: ReservedNSBookmark,
	}
	router := compose.UuidClient(s.ctx)
	ctx := req.Request.Context()
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
		if !strings.HasPrefix(ns.Namespace, "usermeta-") {
			return errors.WithMessage(errors.InvalidParameters, "user defined meta must start with usermeta- prefix")
		}
		if _, e := ns.UnmarshallDefinition(); e != nil {
			return errors.WithMessagef(errors.UnmarshalError, "invalid json definition for namespace: %s, %v", ns.Namespace, e)
		}
	}

	response, err := userMetaClient(ctx).UpdateUserMetaNamespace(ctx, &input)
	if err != nil {
		return err
	} else {
		return rsp.WriteEntity(response)
	}

}

func (s *UserMetaHandler) ListUserMetaNamespace(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()

	output := &rest.UserMetaNamespaceCollection{}
	if ns, err := s.ListAllNamespaces(ctx, userMetaClient(ctx)); err == nil {
		for _, n := range ns {
			if n.Namespace == ReservedNSBookmark {
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
	nss, er := s.ListAllNamespaces(ctx, userMetaClient(ctx))
	if er != nil {
		return er
	}
	if _, ok := nss[ns]; !ok { // ns not found or filtered by policies
		return errors.WithMessagef(errors.StatusNotFound, "namespace %s does not exist", ns)
	}
	tags, _ := s.tvc.ListTags(ctx, ns)
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
	nss, er := s.ListAllNamespaces(ctx, userMetaClient(ctx))
	if er != nil {
		return er
	}
	if nsObject, ok := nss[r.Namespace]; !ok { // ns not found or filtered by policies
		return errors.WithMessagef(errors.StatusNotFound, "namespace %s does not exist", r.Namespace)
	} else if !nsObject.PoliciesContextEditable {
		return errors.WithMessagef(errors.StatusForbidden, "updating namespace %s is not allowed", r.Namespace)
	}

	if e := s.tvc.StoreNewTags(ctx, r.Namespace, []string{r.Tag}); e != nil {
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
		if e := s.tvc.DeleteAllTags(ctx, ns); e != nil {
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
	stream, er := userMetaClient(ctx).SearchUserMeta(ctx, request)
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

	stream, e := client.ListUserMetaNamespace(ctx, &idm.ListUserMetaNamespaceRequest{})
	result := make(map[string]*idm.UserMetaNamespace)
	er := commons.ForEach(stream, e, func(resp *idm.ListUserMetaNamespaceResponse) error {
		ns := resp.GetUserMetaNamespace()
		if !s.MatchPolicies(ctx, ns.Namespace, ns.Policies, serviceproto.ResourcePolicyAction_READ) {
			return nil
		}
		ns.PoliciesContextEditable = s.IsContextEditable(ctx, ns.Namespace, ns.Policies)
		result[resp.UserMetaNamespace.Namespace] = resp.UserMetaNamespace
		return nil
	})
	return result, er

}

func (s *UserMetaHandler) PoliciesForMeta(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*serviceproto.ResourcePolicy, e error) {

	return
}
