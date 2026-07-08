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
	"slices"
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

var ns_with_ev = []string{"tag_cloud", "choice", "auto_complete"}

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
	}
	response, err := s.ServiceClient(ctx).UpdateUserMetaNamespace(ctx, &input)
	if err != nil {
		for _, ns := range input.Namespaces {
			// Use helper to check if we need to cleanup
			definition, _ := ns.UnmarshallDefinition()
			if definition != nil && definition.GetType() != "" {
				entityID := definition.GetEntityId()
				if entityID == "" {
					continue
				}
				if _, err := s.ServiceClient(ctx).DeleteEntity(ctx, &idm.DeleteEntityRequest{EntityId: entityID}); err != nil {
					return err
				}
			}
		}
		return err
	} else if input.Operation == idm.UpdateUserMetaNamespaceRequest_DELETE {
		for _, ns := range input.Namespaces {
			// Use helper to check if we need to cleanup
			definition, _ := ns.UnmarshallDefinition()
			if definition != nil && definition.GetType() != "" {
				entityID := definition.GetEntityId()
				if entityID == "" {
					continue
				}
				if _, err := s.ServiceClient(ctx).DeleteEntity(ctx, &idm.DeleteEntityRequest{EntityId: entityID}); err != nil {
					return err
				}
			}
		}
	}
	return rsp.WriteEntity(response)
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

// DeleteEntity deletes a meta entity by its ID, after checking WRITE policy
func (s *UserMetaHandler) DeleteEntity(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()
	entityId := req.PathParameter("EntityId")
	if entityId == "" {
		var request idm.DeleteEntityRequest
		if err := req.ReadEntity(&request); err != nil {
			return errors.WithMessagef(errors.StatusBadRequest, "failed to parse request: %v", err)
		}
		entityId = request.EntityId
	}

	response, err := s.PerformDeleteEntity(ctx, &idm.DeleteEntityRequest{EntityId: entityId})
	if err != nil {
		return err
	}

	return rsp.WriteEntity(response)
}

// PerformDeleteEntity loads the entity, checks WRITE policy, then deletes
func (s *UserMetaHandler) PerformDeleteEntity(ctx context.Context, request *idm.DeleteEntityRequest) (*idm.DeleteEntityResponse, error) {
	// Load entity to get its policies
	entity, err := s.ServiceClient(ctx).GetEntity(ctx, &idm.GetEntityRequest{EntityUuid: request.EntityId})
	if err != nil {
		return nil, err
	}
	if entity != nil && entity.Entity != nil {
		if !s.MatchPolicies(ctx, entity.Entity.Uuid, entity.Entity.Policies, serviceproto.ResourcePolicyAction_WRITE) {
			return nil, errors.WithMessagef(errors.StatusForbidden, "You are not allowed to delete this entity", err)
		}
	}
	response, err := s.ServiceClient(ctx).DeleteEntity(ctx, request)
	if err != nil {
		log.Logger(ctx).Error("failed to delete entity", zap.String("entityId", request.EntityId), zap.Error(err))
		return nil, err
	}
	return response, nil
}

func (s *UserMetaHandler) GetFieldSchema(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()
	fieldType := req.PathParameter("FieldType")
	schema, err := s.ServiceClient(ctx).GetFieldSchema(ctx, &idm.GetFieldSchemaRequest{FieldType: fieldType})

	if err != nil {
		return err
	}
	return rsp.WriteEntity(schema)
}

func (s *UserMetaHandler) GetNamespaceSchema(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()
	typeParam := req.QueryParameter("FieldType")
	nameParam := req.QueryParameter("Namespace")
	formatParam := req.QueryParameter("Format")
	schema, err := s.ServiceClient(ctx).GetNamespaceSchema(ctx, &idm.GetNamespaceSchemaRequest{FieldType: typeParam, Namespace: nameParam, Format: formatParam})

	if err != nil {
		return err
	}
	return rsp.WriteEntity(schema)
}

func (s *UserMetaHandler) ListUserMetaTags(req *restful.Request, rsp *restful.Response) error {
	ns := req.PathParameter("Namespace")
	ctx := req.Request.Context()
	log.Logger(ctx).Debug("Listing tags for namespace " + ns)
	nss, er := s.Namespaces(ctx)
	if er != nil {
		return er
	}
	nsObject, ok := nss[ns]
	if !ok { // ns not found or filtered by policies
		return errors.WithMessagef(errors.StatusNotFound, "namespace %s does not exist", ns)
	}

	// Use the helper to get definition
	if nss[ns].FieldType != "" && slices.Contains(ns_with_ev, nss[ns].FieldType) {
		definition, err := nsObject.UnmarshallDefinition()
		if err != nil {
			return err
		}

		// Check type through interface
		if slices.Contains(ns_with_ev, definition.GetType()) {
			entityID := definition.GetEntityId()
			if entityID == "" {
				return err
			}
			entityValues, err := s.GetEntityValues(ctx, entityID)
			if err != nil {
				return err
			}
			tags := []string{}
			for _, ev := range entityValues {
				tags = append(tags, ev.Label)
			}
			return rsp.WriteEntity(&rest.ListUserMetaTagsResponse{
				Tags: tags,
			})
		}
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

// TODO remove
func (s *UserMetaHandler) PoliciesForMeta(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*serviceproto.ResourcePolicy, e error) {
	return
}

func (h *UserMetaHandler) parseEntityValues(definition idm.MetaNamespaceDefinition) []*idm.EntityValue {
	var evs []*idm.EntityValue
	entityId := definition.GetEntityId()
	if entityId == "" {
		return evs
	}

	if definition.GetType() == "choice" {
		items := definition.GetItemsWithColor()
		if len(items) > 0 {
			for _, item := range items {
				evs = append(evs, &idm.EntityValue{
					EntityUuid:  entityId,
					Label:       item.Value,
					DisplayJSON: item.Color,
				})
			}
		}
	} else {
		entities := definition.GetEntities()
		if len(entities) > 0 {
			for _, ent := range entities {
				evs = append(evs, &idm.EntityValue{
					EntityUuid: entityId,
					Label:      ent,
				})
			}
		}
	}
	return evs
}

// ListEntities lists all entities the current context has READ access to
func (s *UserMetaHandler) ListEntities(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()

	entities, err := s.Entities(ctx)
	if err != nil {
		return err
	}

	result := make([]*idm.MetaEntity, 0, len(entities))
	for _, e := range entities {
		result = append(result, e)
	}

	return rsp.WriteEntity(&idm.ListEntitiesResponse{Entity: result})
}

// PutEntity creates a new meta entity with admin-only policies
func (s *UserMetaHandler) PutEntity(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()

	var input idm.CreateEntityRequest
	if err := req.ReadEntity(&input); err != nil {
		return errors.WithMessagef(errors.StatusBadRequest, "failed to parse request: %v", err)
	}

	// Attach default admin-only policies if none provided
	if input.Entity != nil && len(input.Entity.Policies) == 0 {
		input.Entity.Policies = []*serviceproto.ResourcePolicy{
			{Action: serviceproto.ResourcePolicyAction_READ, Subject: "profile:admin", Effect: serviceproto.ResourcePolicy_allow},
			{Action: serviceproto.ResourcePolicyAction_WRITE, Subject: "profile:admin", Effect: serviceproto.ResourcePolicy_allow},
		}
	}

	response, err := s.PerformPutEntity(ctx, &input)
	if err != nil {
		return err
	}

	return rsp.WriteEntity(response)
}

// PerformPutEntity performs the actual entity creation
func (s *UserMetaHandler) PerformPutEntity(ctx context.Context, request *idm.CreateEntityRequest) (*idm.CreateEntityResponse, error) {
	response, err := s.ServiceClient(ctx).CreateEntity(ctx, request)
	if err != nil {
		log.Logger(ctx).Error("failed to create entity", zap.Error(err))
		return nil, err
	}
	return response, nil
}

func (s *UserMetaHandler) CreateEntityValues(req *restful.Request, rsp *restful.Response) error {
	var input idm.CreateEntityValueRequest
	if err := req.ReadEntity(&input); err != nil {
		return errors.WithMessagef(errors.StatusBadRequest, "failed to parse request: %v", err)
	}

	// Attach default policies: READ & WRITE for all users
	for _, ev := range input.EntityValue {
		if ev != nil && len(ev.Policies) == 0 {
			ev.Policies = []*serviceproto.ResourcePolicy{
				{Action: serviceproto.ResourcePolicyAction_READ, Subject: "*", Effect: serviceproto.ResourcePolicy_allow},
				{Action: serviceproto.ResourcePolicyAction_WRITE, Subject: "*", Effect: serviceproto.ResourcePolicy_allow},
			}
		}
	}

	ctx := req.Request.Context()

	response, err := s.PerformCreateEntityValues(ctx, &input)
	if err != nil {
		return err
	}

	if len(input.EntityValue) > 0 {
		// Update the namespace definition with the new entity values
		for _, ev := range input.EntityValue {
			if ev == nil {
				continue
			}
			if ev.MetaUuid != "" {
				//link logic

			}
		}
	}

	return rsp.WriteEntity(response)
}

// PerformCreateEntityValues performs the actual entity values creation
func (s *UserMetaHandler) PerformCreateEntityValues(ctx context.Context, request *idm.CreateEntityValueRequest) (*idm.CreateEntityValueResponse, error) {
	response, err := s.ServiceClient(ctx).CreateEntityValues(ctx, request)
	if err != nil {
		log.Logger(ctx).Error("failed to create entity values", zap.Error(err))
		return nil, err
	}
	return response, nil
}
