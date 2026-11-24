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
	"sync/atomic"

	"github.com/ory/ladon"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/idm/policy"
	policycache "github.com/pydio/cells/v5/idm/policy/cache"
	"github.com/pydio/cells/v5/idm/policy/converter"
)

// Handler keeps no full-catalogue engine. The cache is shared process-wide.
type Handler struct {
	idm.UnimplementedPolicyEngineServiceServer
}

func NewHandler(ctx context.Context) idm.PolicyEngineServiceServer {
	h := &Handler{}
	h.watchPolicyChanges(ctx)
	return h
}

func policyCacheScope(ctx context.Context, dao policy.DAO) string {
	scope := runtime.MultiContextManager().Current(ctx)
	// Different storage namespaces (including disposable test schemas) must not
	// share entries even when their runtime tenant names are identical.
	if scoped, ok := dao.(interface{ PolicyCacheNamespace() string }); ok {
		scope += "/" + scoped.PolicyCacheNamespace()
	}
	return scope
}

func (h *Handler) watchPolicyChanges(ctx context.Context) {
	if err := broker.SubscribeCancellable(propagator.ForkedBackgroundWithMeta(ctx), common.TopicIdmPolicies,
		func(evCtx context.Context, msg broker.Message) error {
			event := &idm.ChangeEvent{}
			if _, err := msg.Unmarshal(evCtx, event); err != nil {
				return err
			}
			scope, group, ok := policycache.DecodeChange(event.Attributes)
			if ok {
				policycache.Default().Invalidate(scope, group)
				policycache.Default().Invalidate(scope, policycache.PreviousChange(event.Attributes))
			}
			return nil
		}, broker.WithCounterName("policy-cache-invalidation")); err != nil {
		log.Logger(ctx).Error("policy: failed to subscribe to cache invalidation", zap.Error(err))
	}
}

func (h *Handler) notifyPolicyChange(ctx context.Context, dao policy.DAO, group *idm.PolicyGroup, previous ...*idm.PolicyGroup) {
	scope := policyCacheScope(ctx, dao)
	policycache.Default().Invalidate(scope, group)
	if len(previous) > 0 {
		policycache.Default().Invalidate(scope, previous[0])
	}
	attributes := policycache.EventAttributes(scope, group, previous...)
	attributes["policy.cache.tenant"] = runtime.MultiContextManager().Current(ctx)
	if err := broker.Publish(ctx, common.TopicIdmPolicies, &idm.ChangeEvent{Type: idm.ChangeEventType_UPDATE, Attributes: attributes}); err != nil {
		log.Logger(ctx).Error("policy: failed to publish targeted invalidation", zap.Error(err))
	}
}

func previousPolicyGroup(ctx context.Context, dao policy.DAO, id string) (*idm.PolicyGroup, error) {
	if id == "" {
		return nil, nil
	}
	q, err := anypb.New(&idm.PolicyGroupSingleQuery{Uuid: id})
	if err != nil {
		return nil, err
	}
	groups, err := dao.ListPolicyGroups(ctx, &service.Query{SubQueries: []*anypb.Any{q}})
	if err != nil {
		return nil, err
	}
	if len(groups) == 0 {
		return nil, nil
	}
	return groups[0], nil
}

type cachedPolicyManager struct {
	ladon.Manager
	source policycache.Source
	scope  string
}

func (m *cachedPolicyManager) FindRequestCandidates(ctx context.Context, r *ladon.Request) (ladon.Policies, error) {
	policies, err := policycache.Default().Candidates(ctx, m.scope, m.source, r)
	if err != nil {
		return nil, err
	}
	result := make(ladon.Policies, 0, len(policies))
	for _, p := range policies {
		result = append(result, converter.ProtoToLadonPolicy(p))
	}
	return result, nil
}
func (h *Handler) IsAllowed(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {
	if request == nil {
		return nil, errors.New("invalid argument")
	}
	dao, err := manager.Resolve[policy.DAO](ctx)
	if err != nil {
		return nil, err
	}
	var m ladon.Manager = dao
	if src, ok := dao.(policycache.Source); ok {
		m = &cachedPolicyManager{Manager: dao, source: src, scope: policyCacheScope(ctx, dao)}
	}
	engine := &ladon.Ladon{Manager: m, Metric: ladon.DefaultMetric}
	return runChecks(ctx, request, engine.IsAllowed)
}

// runChecks fans out one goroutine per subject and aggregates the results.
// Cache-backed candidate lookup coalesces duplicate loads across requests.
func runChecks(ctx context.Context, request *idm.PolicyEngineRequest, checkFn func(context.Context, *ladon.Request) error) (*idm.PolicyEngineResponse, error) {
	reqContext := make(map[string]interface{}, len(request.Context))
	for k, v := range request.Context {
		reqContext[k] = v
	}

	var (
		allowed       atomic.Bool
		explicitDeny  atomic.Bool
		checkErrorPtr atomic.Pointer[error]
	)

	ctx, can := context.WithCancel(ctx)
	defer can()

	wg := &sync.WaitGroup{}
	wg.Add(len(request.Subjects))
	for _, subject := range request.Subjects {
		go func(sub string) {
			defer wg.Done()
			r := &ladon.Request{
				Subject:  sub,
				Resource: request.Resource,
				Action:   request.Action,
				Context:  reqContext,
			}
			err := checkFn(ctx, r)
			switch {
			case err == nil:
				allowed.Store(true)
			case errors.Is(err, ladon.ErrRequestForcefullyDenied):
				explicitDeny.Store(true)
				can()
			case errors.Is(err, ladon.ErrRequestDenied), errors.Is(err, context.Canceled):
				// deny-by-default; not an error
			default:
				if strings.Contains(err.Error(), "connection refused") {
					err = errors.New("DAO error received")
				}
				checkErrorPtr.CompareAndSwap(nil, &err)
				can()
			}
		}(subject)
	}
	wg.Wait()

	response := &idm.PolicyEngineResponse{}
	if ptr := checkErrorPtr.Load(); ptr != nil {
		return response, *ptr
	}
	switch {
	case explicitDeny.Load():
		response.ExplicitDeny = true
	case allowed.Load():
		response.Allowed = true
	default:
		response.DefaultDeny = true
	}
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

	// TODO Convert legacy string filter to a structured query.
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

	log.Logger(ctx).Info("Listed policy groups", zap.Int("total", len(groups)))
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
	previous, err := previousPolicyGroup(ctx, dao, request.PolicyGroup.GetUuid())
	if err != nil {
		return nil, err
	}

	stored, err := dao.StorePolicyGroup(ctx, request.PolicyGroup)
	if err != nil {
		h.notifyPolicyChange(ctx, dao, request.PolicyGroup, previous)
		return nil, err
	}

	response.PolicyGroup = stored
	log.Auditer(ctx).Info(
		fmt.Sprintf("Stored policy group [%s]", stored.Name),
		log.GetAuditId(common.AuditPolicyGroupStore),
		stored.ZapUuid(),
	)

	// Invalidate only entries affected by this policy mutation.
	h.notifyPolicyChange(ctx, dao, stored, previous)

	return response, nil
}

func (h *Handler) DeletePolicyGroup(ctx context.Context, request *idm.DeletePolicyGroupRequest) (*idm.DeletePolicyGroupResponse, error) {
	if request == nil || request.PolicyGroup == nil {
		return nil, errors.New("invalid argument")
	}

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	response := &idm.DeletePolicyGroupResponse{}
	previous, err := previousPolicyGroup(ctx, dao, request.PolicyGroup.GetUuid())
	if err != nil {
		return nil, err
	}

	err = dao.DeletePolicyGroup(ctx, request.PolicyGroup)
	if err != nil {
		h.notifyPolicyChange(ctx, dao, request.PolicyGroup, previous)
		return nil, err
	}

	response.Success = true
	log.Auditer(ctx).Info(
		fmt.Sprintf("Deleted policy group [%s]", request.PolicyGroup.Name),
		log.GetAuditId(common.AuditPolicyGroupDelete),
		request.PolicyGroup.ZapUuid(),
	)

	// Invalidate only entries affected by this policy mutation.
	h.notifyPolicyChange(ctx, dao, request.PolicyGroup, previous)

	return response, nil
}
