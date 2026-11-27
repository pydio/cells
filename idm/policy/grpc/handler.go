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
	"context"
	"fmt"
	"strings"
	"sync"
	"text/template"
	"time"

	"github.com/ory/ladon"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/idm/policy"
	"github.com/pydio/cells/v5/idm/policy/converter"
)

type Handler struct {
	idm.UnimplementedPolicyEngineServiceServer
	policyMu     sync.Mutex
	definitions  map[idm.PolicyResourceGroup]cachedPolicyDefinitions
	cacheEnabled bool
}

const policyDefinitionsTTL = 5 * time.Minute

type cachedPolicyDefinitions struct {
	policies []*idm.Policy
	expires  time.Time
}

func (h *Handler) invalidatePolicyDefinitions() {
	h.policyMu.Lock()
	defer h.policyMu.Unlock()
	h.definitions = nil
}

func (h *Handler) policyDefinitions(ctx context.Context, group idm.PolicyResourceGroup) ([]*idm.Policy, error) {
	// Never retain the growing ACL population or request-specific conditions.
	if !h.cacheEnabled || (group != idm.PolicyResourceGroup_rest && group != idm.PolicyResourceGroup_oidc) {
		return h.loadPolicyDefinitions(ctx, group)
	}
	// Serialize refresh and invalidation so a stale load cannot refill the cache.
	h.policyMu.Lock()
	defer h.policyMu.Unlock()
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if cached, ok := h.definitions[group]; ok && time.Now().Before(cached.expires) {
		return cached.policies, nil
	}
	policies, err := h.loadPolicyDefinitions(ctx, group)
	if err != nil {
		delete(h.definitions, group)
		return nil, err
	}
	if h.definitions == nil {
		h.definitions = make(map[idm.PolicyResourceGroup]cachedPolicyDefinitions)
	}
	h.definitions[group] = cachedPolicyDefinitions{policies: policies, expires: time.Now().Add(policyDefinitionsTTL)}
	return policies, nil
}

func NewHandler(ctx context.Context) idm.PolicyEngineServiceServer {
	h := &Handler{}
	if err := broker.SubscribeCancellable(ctx, common.TopicIdmPolicies, func(context.Context, broker.Message) error {
		h.invalidatePolicyDefinitions()
		return nil
	}, broker.WithCounterName("policy-definitions")); err != nil {
		log.Logger(ctx).Error("Cannot subscribe to policy changes; definition caching disabled", zap.Error(err))
	} else {
		h.cacheEnabled = true
	}
	return h
}

func (h *Handler) IsAllowed(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {
	if request == nil {
		return nil, errors.New("request cannot be nil")
	}
	group := idm.PolicyResourceGroup_acl
	if strings.HasPrefix(request.Resource, "rest:") {
		group = idm.PolicyResourceGroup_rest
	} else if request.Resource == "oidc" {
		group = idm.PolicyResourceGroup_oidc
	}
	definitions, err := h.policyDefinitions(ctx, group)
	if err != nil {
		return nil, err
	}
	var policies ladon.Policies
	evaluator := &ladon.Ladon{AuditLogger: ladon.DefaultAuditLogger, Metric: ladon.DefaultMetric}
	prepared := false
	return runChecks(ctx, request, func(ctx context.Context, r *ladon.Request) error {
		if !prepared {
			policies, err = preparePolicies(ctx, definitions, request, r.Context)
			prepared = true
			if err != nil {
				return err
			}
		}
		// Evaluate static and resolved dynamic policies together: any deny wins.
		return evaluator.DoPoliciesAllow(ctx, r, policies)
	})
}

func (h *Handler) loadPolicyDefinitions(ctx context.Context, group idm.PolicyResourceGroup) ([]*idm.Policy, error) {
	groups, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Filter: "resource_group:" + group.String()})
	if err != nil {
		return nil, err
	}
	var policies []*idm.Policy
	for _, group := range groups.PolicyGroups {
		policies = append(policies, group.Policies...)
	}
	return policies, nil
}

// runChecks evaluates subjects synchronously; a matching deny overrides any allow.
func runChecks(ctx context.Context, request *idm.PolicyEngineRequest, checker func(context.Context, *ladon.Request) error) (*idm.PolicyEngineResponse, error) {
	response := &idm.PolicyEngineResponse{}
	requestContext := make(ladon.Context, len(request.Context))
	for key, value := range request.Context {
		requestContext[key] = value
	}
	r := &ladon.Request{Resource: request.Resource, Action: request.Action, Context: requestContext}
	for _, subject := range request.Subjects {
		if err := ctx.Err(); err != nil {
			return &idm.PolicyEngineResponse{}, err
		}
		r.Subject = subject
		err := checker(ctx, r)
		if canceled := ctx.Err(); canceled != nil {
			return &idm.PolicyEngineResponse{}, canceled
		}
		switch {
		case err == nil:
			response.Allowed = true
		case errors.Is(err, ladon.ErrRequestForcefullyDenied):
			return &idm.PolicyEngineResponse{ExplicitDeny: true}, nil
		case errors.Is(err, ladon.ErrRequestDenied):
			// Another subject may still match.
		default:
			if strings.Contains(err.Error(), "connection refused") {
				log.Logger(ctx).Error("Connection to DB error", zap.Error(err))
				err = errors.New("DAO error received")
			}
			return &idm.PolicyEngineResponse{}, err
		}
	}
	if err := ctx.Err(); err != nil {
		return &idm.PolicyEngineResponse{}, err
	}
	response.DefaultDeny = !response.Allowed
	return response, nil
}

// StreamPolicyGroups performs same listing as ListPolicyGroups but answer with a stream
func (h *Handler) StreamPolicyGroups(request *idm.ListPolicyGroupsRequest, stream idm.PolicyEngineService_StreamPolicyGroupsServer) error {

	ctx := stream.Context()

	resp, err := h.ListPolicyGroups(ctx, request)
	if err != nil {
		return err
	}
	for _, group := range resp.GetPolicyGroups() {
		_ = stream.Send(group)
	}

	return nil
}

func (h *Handler) ListPolicyGroups(ctx context.Context, request *idm.ListPolicyGroupsRequest) (*idm.ListPolicyGroupsResponse, error) {

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	response := &idm.ListPolicyGroupsResponse{}

	// Legacy code - making sure we convert
	if filter := request.GetFilter(); request.GetQuery() == nil && filter != "" {
		var queries []*anypb.Any

		if strings.HasPrefix(filter, "resource_group:") {
			q, _ := anypb.New(&idm.PolicyGroupSingleQuery{
				ResourceGroup: strings.TrimPrefix(filter, "resource_group:"),
			})

			queries = append(queries, q)
		} else if strings.HasPrefix(filter, "uuid:") {
			q, _ := anypb.New(&idm.PolicyGroupSingleQuery{
				Uuid: strings.TrimPrefix(filter, "uuid:"),
			})

			queries = append(queries, q)
		} else if strings.HasPrefix(filter, "like:") {
			q1, _ := anypb.New(&idm.PolicyGroupSingleQuery{
				Name: "%" + strings.TrimPrefix(filter, "like:") + "%",
			})
			q2, _ := anypb.New(&idm.PolicyGroupSingleQuery{
				Description: "%" + strings.TrimPrefix(filter, "like:") + "%",
			})

			queries = append(queries, q1, q2)
		} else {
			return nil, fmt.Errorf("unknown filter: %s", filter)
		}

		request.Query = &service.Query{
			SubQueries: queries,
			Operation:  service.OperationType_OR,
		}
	}

	groups, err := dao.ListPolicyGroups(ctx, request.GetQuery())
	if err != nil {
		return nil, err
	}
	response.PolicyGroups = groups
	response.Total = int32(len(groups))

	return response, nil
}

func (h *Handler) StorePolicyGroup(ctx context.Context, request *idm.StorePolicyGroupRequest) (*idm.StorePolicyGroupResponse, error) {

	if request == nil || request.PolicyGroup == nil {
		return nil, errors.New("invalid argument")
	}

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	response := &idm.StorePolicyGroupResponse{}

	stored, err := dao.StorePolicyGroup(ctx, request.PolicyGroup)
	if err != nil {
		return nil, err
	}

	h.invalidatePolicyDefinitions()
	response.PolicyGroup = stored
	log.Auditer(ctx).Info(
		fmt.Sprintf("Stored policy group [%s]", stored.Name),
		log.GetAuditId(common.AuditPolicyGroupStore),
		stored.ZapUuid(),
	)
	_ = broker.Publish(ctx, common.TopicIdmPolicies, &idm.ChangeEvent{Type: idm.ChangeEventType_UPDATE})

	return response, nil
}

func (h *Handler) DeletePolicyGroup(ctx context.Context, request *idm.DeletePolicyGroupRequest) (*idm.DeletePolicyGroupResponse, error) {

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	response := &idm.DeletePolicyGroupResponse{}

	err := dao.DeletePolicyGroup(ctx, request.PolicyGroup)
	if err != nil {
		return nil, err
	}

	h.invalidatePolicyDefinitions()
	response.Success = true
	log.Auditer(ctx).Info(
		fmt.Sprintf("Deleted policy group [%s]", request.PolicyGroup.Name),
		log.GetAuditId(common.AuditPolicyGroupDelete),
		request.PolicyGroup.ZapUuid(),
	)
	_ = broker.Publish(ctx, common.TopicIdmPolicies, &idm.ChangeEvent{Type: idm.ChangeEventType_UPDATE})

	return response, nil
}

// Definitions remain untouched in the cache. Static and resolved dynamic policies
// are returned in one request-local set, without a retained engine or index.
func preparePolicies(ctx context.Context, definitions []*idm.Policy, request *idm.PolicyEngineRequest, values ladon.Context) (ladon.Policies, error) {
	var policies ladon.Policies
	seen := make(map[string]bool, len(definitions))
	templates := make(map[string]*template.Template)
	for _, definition := range definitions {
		if err := ctx.Err(); err != nil {
			return nil, err
		}
		if definition == nil {
			return nil, fmt.Errorf("nil policy definition")
		}
		if seen[definition.ID] {
			continue
		}
		seen[definition.ID] = true
		// Conversion sorts selectors, so keep cached definitions immutable.
		selectors := proto.Clone(definition).(*idm.Policy)
		selectors.Conditions = nil
		candidate := converter.ProtoToLadonPolicy(selectors)
		matched, err := matchesPolicyRequest(candidate, request)
		if err != nil {
			return nil, err
		}
		if !matched {
			continue
		}
		compiled := candidate.(*ladon.DefaultPolicy)
		compiled.Conditions = make(ladon.Conditions, len(definition.Conditions))
		for key, condition := range definition.Conditions {
			create, ok := ladon.ConditionFactories[condition.GetType()]
			if !ok {
				return nil, fmt.Errorf("policy %s: unknown condition type %q", definition.ID, condition.GetType())
			}
			options := condition.GetJsonOptions()
			if strings.Contains(options, "{{") {
				tmpl := templates[options]
				if tmpl == nil {
					tmpl, err = template.New("policy-condition").Option("missingkey=error").Parse(options)
					if err != nil {
						return nil, fmt.Errorf("policy %s: parse condition %s: %w", definition.ID, key, err)
					}
					templates[options] = tmpl
				}
				var rendered strings.Builder
				if err := tmpl.Execute(&rendered, values); err != nil {
					return nil, fmt.Errorf("policy %s: execute condition %s: %w", definition.ID, key, err)
				}
				options = rendered.String()
			}
			value := create()
			if options != "" {
				if err := json.Unmarshal([]byte(options), value); err != nil {
					return nil, fmt.Errorf("policy %s: decode condition %s: %w", definition.ID, key, err)
				}
			}
			compiled.Conditions[key] = value
		}
		policies = append(policies, compiled)
	}
	return policies, nil
}

func matchesPolicyRequest(policy ladon.Policy, request *idm.PolicyEngineRequest) (bool, error) {
	if ok, err := ladon.DefaultMatcher.Matches(policy, policy.GetActions(), request.Action); err != nil || !ok {
		return ok, err
	}
	for _, subject := range request.Subjects {
		ok, err := ladon.DefaultMatcher.Matches(policy, policy.GetSubjects(), subject)
		if err != nil {
			return false, err
		}
		if ok {
			return ladon.DefaultMatcher.Matches(policy, policy.GetResources(), request.Resource)
		}
	}
	return false, nil
}
