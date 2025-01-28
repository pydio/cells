/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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

package meta

import (
	"bytes"
	"context"
	"fmt"
	"strconv"
	"strings"
	"text/template"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	serviceproto "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/service/resources"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

// This is used to manually set up default metadata values on any incoming resource
type defaultMetaDefinition struct {
	Namespace    string `json:"namespace"`
	Value        any    `json:"value"`
	NodeType     string `json:"nodeType"`
	Override     bool   `json:"override"`
	TemplateType string `json:"templateType"`

	ResolvedNS    *idm.UserMetaNamespace `json:"-"`
	ResolvedValue any                    `json:"-"`
}

type ExtractionSource string

var (
	ExtractAmzHeaders   ExtractionSource = "amz_headers"
	ExtractNodeMetadata ExtractionSource = "node_metadata"
)

type UserMetaClient interface {
	UpdateMetaResolved(ctx context.Context, input *idm.UpdateUserMetaRequest) (*idm.UpdateUserMetaResponse, error)
	UpdateLock(ctx context.Context, meta *idm.UserMeta, operation idm.UpdateUserMetaRequest_UserMetaOp) error
	Namespaces(ctx context.Context) (map[string]*idm.UserMetaNamespace, error)
	ExtractAndPut(ctx context.Context, resolved *tree.Node, ctxWorkspace *idm.Workspace, meta map[string]string, source ExtractionSource) (*idm.UpdateUserMetaResponse, error)
	ServiceClient(ctx context.Context) idm.UserMetaServiceClient
	TagValuesHandler() TagsValuesClient

	IsContextEditable(ctx context.Context, resourceId string, policies []*serviceproto.ResourcePolicy) bool
	MatchPolicies(ctx context.Context, resourceId string, policies []*serviceproto.ResourcePolicy, action serviceproto.ResourcePolicyAction, subjects ...string) bool
}

type umClient struct {
	resources.ResourceProviderHandler
	valuesClient TagsValuesClient
	cacheConfig  cache.Config
}

// NewUserMetaClient creates an initialized umClient
func NewUserMetaClient(useCache ...cache.Config) UserMetaClient {
	cl := &umClient{}
	cl.ServiceName = common.ServiceUserMeta
	cl.ResourceName = "userMeta"
	cl.PoliciesLoader = cl.PoliciesForMeta
	cl.valuesClient = NewTagsValuesClient()
	if len(useCache) > 0 {
		cl.cacheConfig = useCache[0]
	}
	return cl
}

// UpdateMetaResolved performs actual updates, including Policies checks but no
// checks on the actual nodes (to be performed by callers)
func (u *umClient) UpdateMetaResolved(ctx context.Context, input *idm.UpdateUserMetaRequest) (*idm.UpdateUserMetaResponse, error) {
	nsList, e := u.Namespaces(ctx)
	if e != nil {
		return nil, e
	}
	var loadUuids []string

	// First check if the namespaces are globally accessible
	for _, meta := range input.MetaDatas {
		var ns *idm.UserMetaNamespace
		var exists bool
		if meta.Namespace == permissions.AclContentLock.Name {
			if e = u.UpdateLock(ctx, meta, input.Operation); e != nil {
				return nil, e
			}
			return &idm.UpdateUserMetaResponse{MetaDatas: []*idm.UserMeta{meta}}, nil
		}
		if ns, exists = nsList[meta.Namespace]; !exists {
			return nil, errors.WithMessagef(errors.StatusNotFound, "Namespace %s is not defined!", meta.Namespace)
		}

		if !u.MatchPolicies(ctx, meta.Namespace, ns.Policies, serviceproto.ResourcePolicyAction_WRITE) {
			return nil, errors.WithMessagef(errors.NamespaceNotAllowed, "Updating namespace %s is not allowed!", meta.Namespace)
		}
		if meta.Uuid != "" {
			loadUuids = append(loadUuids, meta.Uuid)
		}
		if ns.JsonDefinition != "" {
			// Special case for tags: automatically update stored list
			if nsDef, jE := ns.UnmarshallDefinition(); jE == nil && nsDef.GetType() == "tags" {
				var currentValue string
				if e := json.Unmarshal([]byte(meta.JsonValue), &currentValue); e != nil {
					return nil, errors.Tag(e, errors.UnmarshalError)
				}
				log.Logger(ctx).Debug("jsonDef for namespace "+ns.Namespace, zap.Any("d", nsDef), zap.Any("v", currentValue))
				if e := u.valuesClient.StoreNewTags(ctx, ns.Namespace, strings.Split(currentValue, ",")); e != nil {
					return nil, errors.WithMessagef(errors.StatusInternalServerError, "could not store meta tag for namespace %s: %v", ns.Namespace, e)
				}
			} else if jE != nil {
				return nil, errors.WithMessagef(errors.UnmarshalError, "cannot decode json definition for namespace %s (%s): %v", ns.Namespace, ns.JsonDefinition, jE)
			}
		}
		// Now update policies for input Meta
		if meta.Namespace == ReservedNamespaceBookmark {
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
	svc := u.ServiceClient(ctx)
	if len(loadUuids) > 0 {
		stream, e := svc.SearchUserMeta(ctx, &idm.SearchUserMetaRequest{MetaUuids: loadUuids})
		if e = commons.ForEach(stream, e, func(t *idm.SearchUserMetaResponse) error {
			if !u.MatchPolicies(ctx, t.GetUserMeta().GetUuid(), t.GetUserMeta().GetPolicies(), serviceproto.ResourcePolicyAction_WRITE) {
				return errors.WithMessagef(errors.NamespaceNotAllowed, "policies do not match for ns %s", t.GetUserMeta().GetNamespace())
			}
			return nil
		}); e != nil {
			return nil, e
		}
	}
	return svc.UpdateUserMeta(ctx, input)
}

// UpdateLock handles special case for "content_lock" meta => store in ACL instead of user metadatas
func (u *umClient) UpdateLock(ctx context.Context, meta *idm.UserMeta, operation idm.UpdateUserMetaRequest_UserMetaOp) error {
	log.Logger(ctx).Debug("Should update content lock in ACLs", zap.Any("meta", meta), zap.Any("operation", operation))
	nodeUuid := meta.NodeUuid
	aclClient := idmc.ACLServiceClient(ctx)
	q, _ := anypb.New(&idm.ACLSingleQuery{
		NodeIDs: []string{nodeUuid},
		Actions: []*idm.ACLAction{{Name: permissions.AclContentLock.Name}},
	})
	userName, _ := permissions.FindUserNameInContext(ctx)
	if userName == "" {
		return errors.WithStack(errors.StatusLocked)
	}
	stream, err := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &serviceproto.Query{SubQueries: []*anypb.Any{q}}})
	if resp, ok, er := commons.MustStreamOne(stream, err); er != nil {
		return er
	} else if ok && resp.ACL.Action.Value != userName {
		return errors.WithStack(errors.StatusLocked)
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

// Namespaces lists all namespaces, including reserved ones (bookmark)
func (u *umClient) Namespaces(ctx context.Context) (map[string]*idm.UserMetaNamespace, error) {
	var result map[string]*idm.UserMetaNamespace
	var ca cache.Cache
	if u.cacheConfig.Prefix != "" {
		ca = cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, u.cacheConfig)
		if ca.Get("namespaces", &result) {
			return result, nil
		}
	}
	result = make(map[string]*idm.UserMetaNamespace)
	stream, e := u.ServiceClient(ctx).ListUserMetaNamespace(ctx, &idm.ListUserMetaNamespaceRequest{})
	er := commons.ForEach(stream, e, func(resp *idm.ListUserMetaNamespaceResponse) error {
		ns := resp.GetUserMetaNamespace()
		if !u.MatchPolicies(ctx, ns.Namespace, ns.Policies, serviceproto.ResourcePolicyAction_READ) {
			return nil
		}
		ns.PoliciesContextEditable = u.IsContextEditable(ctx, ns.Namespace, ns.Policies)
		result[resp.UserMetaNamespace.Namespace] = resp.UserMetaNamespace
		return nil
	})
	if ca != nil {
		_ = ca.Set("namespaces", result)
	}
	return result, er

}

// ExtractAndPut is used on newly created resources to set metadata directly during the creation flow
func (u *umClient) ExtractAndPut(ctx context.Context, resolved *tree.Node, ctxWorkspace *idm.Workspace, meta map[string]string, source ExtractionSource) (*idm.UpdateUserMetaResponse, error) {
	var um []*idm.UserMeta
	var er error
	id, err := u.incomingDefaults(ctx, resolved.Type, ctxWorkspace)
	if err != nil {
		return nil, err
	}
	if source == ExtractAmzHeaders {
		if um, er = u.fromAmzHeaders(ctx, resolved, meta, id); er != nil {
			return nil, er
		}
	} else if source == ExtractNodeMetadata {
		if um, er = u.fromNodeMeta(ctx, resolved, meta, id); er != nil {
			return nil, er
		}
	} else {
		return nil, fmt.Errorf("unknown extraction source: %s", source)
	}
	if len(id) > 0 {
		for _, i := range id {
			log.Logger(ctx).Info("Applying default meta value", zap.String("ns", i.Namespace), zap.Any("value", i.ResolvedValue))
			resolved.MustSetMeta(i.ResolvedNS.GetNamespace(), i.ResolvedValue)
			jsonValue, _ := json.Marshal(i.ResolvedValue)
			um = append(um, &idm.UserMeta{
				NodeUuid:     resolved.GetUuid(),
				Namespace:    i.ResolvedNS.GetNamespace(),
				Policies:     i.ResolvedNS.GetPolicies(),
				JsonValue:    string(jsonValue),
				ResolvedNode: resolved,
			})
		}
	}

	if len(um) == 0 {
		return nil, nil
	}
	return u.UpdateMetaResolved(ctx, &idm.UpdateUserMetaRequest{
		Operation: idm.UpdateUserMetaRequest_PUT,
		MetaDatas: um,
	})
}

// ServiceClient lazily creates a client to the usermeta service
func (u *umClient) ServiceClient(ctx context.Context) idm.UserMetaServiceClient {
	return idm.NewUserMetaServiceClient(grpc.ResolveConn(ctx, common.ServiceUserMetaGRPC))
}

// TagValuesHandler returns a client for listing/updating tags values
func (u *umClient) TagValuesHandler() TagsValuesClient {
	return u.valuesClient
}

// PoliciesForMeta is an empty handler for PolicyChecker
func (u *umClient) PoliciesForMeta(_ context.Context, _ string, _ interface{}) (policies []*serviceproto.ResourcePolicy, e error) {
	return
}

// fromNodeMeta matches allowed namespaces from incoming node Metadata
func (u *umClient) fromNodeMeta(ctx context.Context, resolved *tree.Node, meta map[string]string, def map[string]*defaultMetaDefinition) (out []*idm.UserMeta, err error) {
	var nss map[string]*idm.UserMetaNamespace
	for k, v := range meta {
		if strings.HasPrefix(k, common.MetaNamespaceUserspacePrefix) {
			if nss == nil {
				if nss, err = u.Namespaces(ctx); err != nil {
					return nil, err
				}
			}
			var foundNS *idm.UserMetaNamespace
			for _, ns := range nss {
				if ns.Namespace == k {
					foundNS = ns
					break
				}
			}
			if foundNS != nil {
				if d, ok := def[foundNS.Namespace]; ok {
					if !d.Override {
						return nil, errors.WithMessagef(errors.StatusForbidden, "You are not allowed to override this metadata namespace %s", foundNS.Namespace)
					} else {
						delete(def, foundNS.Namespace) // remove from defaults
					}
				}
				out = append(out, &idm.UserMeta{
					NodeUuid:     resolved.GetUuid(),
					Namespace:    foundNS.GetNamespace(),
					Policies:     foundNS.GetPolicies(),
					JsonValue:    v,
					ResolvedNode: resolved,
				})
			}
		}
	}
	return out, nil
}

// fromAmzHeaders matches allowed namespaces from incoming request headers, sent as X-Amz-Meta-{Namespace} headers
func (u *umClient) fromAmzHeaders(ctx context.Context, resolved *tree.Node, meta map[string]string, def map[string]*defaultMetaDefinition) (out []*idm.UserMeta, err error) {
	var nss map[string]*idm.UserMetaNamespace
	for k, v := range meta {
		if strings.HasPrefix(k, "X-Amz-Meta-") {
			if nss == nil {
				if nss, err = u.Namespaces(ctx); err != nil {
					return nil, err
				}
			}
			var namespace *idm.UserMetaNamespace
			for _, ns := range nss {
				if strings.EqualFold(ns.Namespace, strings.TrimPrefix(k, "X-Amz-Meta-")) {
					namespace = ns
					break
				}
			}
			if namespace == nil {
				continue // ignore
			}
			if d, ok := def[namespace.GetNamespace()]; ok {
				if !d.Override {
					return nil, errors.WithMessagef(errors.StatusForbidden, "You are not allowed to override this metadata namespace %s", namespace.GetNamespace())
				} else {
					delete(def, namespace.GetNamespace()) // remove from defaults
				}
			}
			// Check value
			var i interface{}
			if err = json.Unmarshal([]byte(v), &i); err != nil {
				err = errors.WithMessage(err, "User metadata values must be JSON-encoded")
				return
			}
			out = append(out, &idm.UserMeta{
				NodeUuid:     resolved.Uuid,
				Namespace:    namespace.GetNamespace(),
				JsonValue:    v,
				Policies:     namespace.GetPolicies(),
				ResolvedNode: resolved,
			})
		}
	}
	return
}

// incomingDefaults parses configured defaults for the current scope
func (u *umClient) incomingDefaults(ctx context.Context, inputType tree.NodeType, ws *idm.Workspace) (d map[string]*defaultMetaDefinition, err error) {
	d = make(map[string]*defaultMetaDefinition)
	pluginName := "meta.user"
	varName := "USERMETA_DEFAULTS"
	var jsonDefs string
	// Global config first
	if v := config.Get(ctx, "frontend", "plugin", pluginName).String(); v != "" {
		jsonDefs = v
	}
	// Contextual roles then
	if ws != nil {
		acl, e := permissions.AccessListFromContextClaims(ctx)
		if e != nil {
			err = e
			return
		}
		if e = permissions.AccessListLoadFrontValues(ctx, acl); e != nil {
			err = e
			return
		}
		aclParams := acl.FlattenedFrontValues().Val("parameters", pluginName)
		log.Logger(ctx).Debug("Checking default metadata " + aclParams.String())
		scopes := permissions.FrontValuesScopesFromWorkspaces([]*idm.Workspace{ws})
		for _, s := range scopes {
			jsonDefs = aclParams.Val(varName, s).Default(jsonDefs).String()
		}
	}
	if jsonDefs != "" {
		var dd []*defaultMetaDefinition
		if er := json.Unmarshal([]byte(jsonDefs), &dd); er != nil {
			log.Logger(ctx).Warn("Cannot correctly parse defaults metadata definition, this will be ignored!", zap.Error(er))
			return
		}
		if len(dd) == 0 {
			return
		}
		nn, e := u.Namespaces(ctx)
		if e != nil {
			err = e
			return
		}
		for _, def := range dd {
			if def.NodeType != "" && def.NodeType != inputType.String() {
				// This does not apply to current type
				continue
			}
			for _, ns := range nn {
				if ns.Namespace == def.Namespace {
					def.ResolvedNS = ns
					break
				}
			}
			if def.ResolvedNS == nil {
				log.Logger(ctx).Warn(fmt.Sprintf("Defaults metadata point to an invalid namespace %s. Did you define it?", def.Namespace))
				continue
			}
			// Template case - evaluate value
			if def.TemplateType != "" {
				tpl, erT := template.New("ns." + def.Namespace).Parse(def.Value.(string))
				if erT != nil {
					log.Logger(ctx).Warn(fmt.Sprintf("Could not parse Go Template for namespace default %s", def.Namespace), zap.Error(erT))
					continue
				}
				tplData := make(map[string]string)
				permissions.PolicyContextFromClaims(tplData, ctx)
				permissions.PolicyContextFromMetadata(tplData, ctx)
				buf := bytes.NewBuffer(nil)
				if er := tpl.Execute(buf, tplData); er != nil {
					log.Logger(ctx).Warn(fmt.Sprintf("Could not execute Go Template for namespace default %s", def.Namespace), zap.Error(er))
					continue
				}
				out := buf.String()
				var outErr error
				var value any
				switch def.TemplateType {
				case "bool":
					value, outErr = strconv.ParseBool(out)
				case "int":
					value, outErr = strconv.Atoi(out)
				case "json":
					outErr = json.Unmarshal([]byte(out), &value)
				default:
					value = out
				}
				if outErr != nil {
					log.Logger(ctx).Warn(fmt.Sprintf("Could not convert Go Template output for namespace default %s to type %s", def.Namespace, def.TemplateType), zap.Error(outErr))
					continue
				}
				def.ResolvedValue = value
			} else {
				def.ResolvedValue = def.Value
			}
			d[def.Namespace] = def
		}
	}
	return
}
