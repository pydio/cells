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
	"github.com/ory/ladon/manager/memory"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/idm/policy"
	"github.com/pydio/cells/v5/idm/policy/converter"
)

var groupsCacheConfig = cache.Config{
	Prefix:      "pydio.grpc.policy/groups",
	Eviction:    "72h",
	CleanWindow: "72h",
}

// engineEntry holds the result of an in-flight engine rebuild.
// Multiple concurrent callers wait on ready to serialize access.
type engineEntry struct {
	ready chan struct{}
	err   error
}

type Handler struct {
	idm.UnimplementedPolicyEngineServiceServer

	mu           sync.Mutex // guards cachedEngine and rebuildEntry
	cachedEngine *ladon.Ladon
	rebuildEntry *engineEntry // non-nil while a rebuild is in flight
}

func NewHandler(ctx context.Context) idm.PolicyEngineServiceServer {
	h := &Handler{}
	go h.warmEngine(ctx) // IsAllowed waits for engine to warm
	h.watchPolicyChanges(ctx)
	return h
}

// getOrRebuildEngine serializes access to engine rebuilds using a ready channel.
// Only one goroutine does the DB work; all others wait for the result.
// Returns the cached engine and any error from the rebuild attempt.
func (h *Handler) getOrRebuildEngine(ctx context.Context) (*ladon.Ladon, error) {
	h.mu.Lock()
	if h.cachedEngine != nil {
		e := h.cachedEngine
		h.mu.Unlock()
		return e, nil
	}
	if h.rebuildEntry != nil {
		// A rebuild is already in flight; join it.
		entry := h.rebuildEntry
		h.mu.Unlock()
		<-entry.ready
		h.mu.Lock()
		e := h.cachedEngine
		h.mu.Unlock()
		return e, entry.err
	}
	// We are the first; become responsible for the rebuild.
	entry := &engineEntry{ready: make(chan struct{})}
	h.rebuildEntry = entry
	h.mu.Unlock()

	err := h.rebuildEngine(ctx)

	h.mu.Lock()
	h.rebuildEntry = nil
	h.mu.Unlock()

	entry.err = err
	close(entry.ready) // broadcast to all waiters

	h.mu.Lock()
	e := h.cachedEngine
	h.mu.Unlock()
	return e, err
}

// rebuildEngine loads all policy groups from the DAO, builds a new ladon engine,
// swaps it under the write-lock, and refreshes the shared cache.
func (h *Handler) rebuildEngine(ctx context.Context) error {
	dao, err := manager.Resolve[policy.DAO](ctx)
	if err != nil {
		return fmt.Errorf("policy: resolve DAO: %w", err)
	}
	groups, err := dao.ListPolicyGroups(ctx, nil)
	if err != nil {
		return fmt.Errorf("policy: list groups: %w", err)
	}

	mem := memory.NewMemoryManager()
	for _, g := range groups {
		for _, p := range g.Policies {
			if er := mem.Create(ctx, converter.ProtoToLadonPolicy(p)); er != nil {
				log.Logger(ctx).Warn("policy: skipping bad policy during engine rebuild",
					zap.String("id", p.GetID()), zap.Error(er))
			}
		}
	}

	engine := &ladon.Ladon{Manager: mem}

	h.mu.Lock()
	h.cachedEngine = engine
	h.mu.Unlock() // Notify waiters in getOrRebuildEngine

	log.Logger(ctx).Info("policy: engine rebuilt", zap.Int("groups", len(groups)))

	if ka, er := cache_helper.ResolveCache(ctx, common.CacheTypeShared, groupsCacheConfig); er == nil {
		if msg, er := json.Marshal(groups); er == nil {
			_ = ka.Set("policyGroup", msg)
		}

	} else {
		log.Logger(ctx).Error("policy: failed to cache engine groups in Redis", zap.Error(er))
	}

	return nil
}

// warmEngine populates cachedEngine on startup, trying Redis before falling back to the DB.
func (h *Handler) warmEngine(ctx context.Context) {
	var bb []byte
	if ka, err := cache_helper.ResolveCache(ctx, common.CacheTypeShared, groupsCacheConfig); err == nil && ka.Get("policyGroup", &bb) {
		var groups []*idm.PolicyGroup
		if json.Unmarshal(bb, &groups) == nil && len(groups) > 0 {
			mem := memory.NewMemoryManager()
			for _, g := range groups {
				for _, p := range g.Policies {
					_ = mem.Create(ctx, converter.ProtoToLadonPolicy(p))
				}
			}
			h.mu.Lock()
			h.cachedEngine = &ladon.Ladon{Manager: mem}
			h.mu.Unlock()
			log.Logger(ctx).Info("policy: engine warmed from Redis cache", zap.Int("groups", len(groups)))
			return
		}
	}
	if _, err := h.getOrRebuildEngine(ctx); err != nil {
		log.Logger(ctx).Error("policy: failed to warm engine from DB on startup", zap.Error(err))
	}
}

// watchPolicyChanges subscribes to TopicIdmPolicies and rebuilds the engine on any mutation.
func (h *Handler) watchPolicyChanges(ctx context.Context) {
	subCtx := propagator.ForkedBackgroundWithMeta(ctx)
	if err := broker.SubscribeCancellable(subCtx, common.TopicIdmPolicies,
		func(evCtx context.Context, msg broker.Message) error {
			log.Logger(evCtx).Info("policy: change event received, rebuilding engine")
			if err := h.rebuildEngine(context.WithoutCancel(evCtx)); err != nil {
				log.Logger(evCtx).Error("policy: engine rebuild failed", zap.Error(err))
			}
			return nil
		},
		broker.WithCounterName("policy-engine-rebuild"),
	); err != nil {
		// Without this subscription, other pods' engines are never refreshed on
		// policy changes made elsewhere; make sure that's visible in the logs.
		log.Logger(ctx).Error("policy: failed to subscribe to policy change events, engine may serve stale policies", zap.Error(err))
	}
}

// notifyPolicyChange rebuilds this pod's engine synchronously so the write is
// immediately reflected locally, then best-effort notifies other pods via the
// broker. The broker publish is not relied upon for local consistency: it may
// fail or be delayed, and we must not keep enforcing a stale/revoked policy
// on this pod while waiting for it.
func (h *Handler) notifyPolicyChange(ctx context.Context) {
	if err := h.rebuildEngine(context.WithoutCancel(ctx)); err != nil {
		log.Logger(ctx).Error("policy: local engine rebuild after policy change failed", zap.Error(err))
	}
	if err := broker.Publish(ctx, common.TopicIdmPolicies, &idm.ChangeEvent{Type: idm.ChangeEventType_UPDATE}); err != nil {
		log.Logger(ctx).Error("policy: failed to publish policy change event, other pods may serve stale policies", zap.Error(err))
	}
}

func (h *Handler) IsAllowed(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {
	engine, err := h.getOrRebuildEngine(ctx)
	if err != nil {
		return nil, err
	}
	if engine == nil {
		// Still no engine after rebuild attempt; should not happen, but fail safely.
		return nil, fmt.Errorf("policy: engine unavailable")
	}
	return h.isAllowedFromEngine(ctx, engine, request)
}

// isAllowedFromEngine checks permissions against the in-process ladon engine.
func (h *Handler) isAllowedFromEngine(ctx context.Context, engine *ladon.Ladon, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {
	return runChecks(ctx, request, func(ctx context.Context, r *ladon.Request) error {
		return engine.IsAllowed(ctx, r)
	})
}

// runChecks fans out one goroutine per subject and aggregates the results.
// Shared by isAllowedFromEngine and isAllowedFromDAO.
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

	ka, er := cache_helper.ResolveCache(ctx, common.CacheTypeShared, groupsCacheConfig)
	var bb []byte
	if er == nil && request.GetFilter() == "" && request.GetQuery() == nil && ka.Get("policyGroup", &bb) {
		if json.Unmarshal(bb, &response.PolicyGroups) == nil {
			response.Total = int32(len(response.PolicyGroups))
			return response, nil
		}
	}

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

	if request.GetFilter() == "" && request.GetQuery() == nil && ka != nil {
		msg, _ := json.Marshal(groups)
		if err = ka.Set("policyGroup", msg); err != nil {
			log.Logger(ctx).Error("Cannot fill cache for policy groups", zap.Error(err))
		}
	}

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

	response.PolicyGroup = stored
	log.Auditer(ctx).Info(
		fmt.Sprintf("Stored policy group [%s]", stored.Name),
		log.GetAuditId(common.AuditPolicyGroupStore),
		stored.ZapUuid(),
	)

	// Rebuild this pod's engine immediately
	h.notifyPolicyChange(ctx)

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

	response.Success = true
	log.Auditer(ctx).Info(
		fmt.Sprintf("Deleted policy group [%s]", request.PolicyGroup.Name),
		log.GetAuditId(common.AuditPolicyGroupDelete),
		request.PolicyGroup.ZapUuid(),
	)

	// Rebuild this pod's engine immediately
	h.notifyPolicyChange(ctx)

	return response, nil
}
