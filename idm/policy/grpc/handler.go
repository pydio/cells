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

	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/idm/policy"
	"github.com/pydio/cells/v5/idm/policy/converter"
)

var groupsCacheConfig = cache.Config{
	Eviction:    "72h",
	CleanWindow: "72h",
}

type Handler struct {
	idm.UnimplementedPolicyEngineServiceServer
}

func NewHandler() idm.PolicyEngineServiceServer {
	return &Handler{}
}

func (h *Handler) IsAllowed(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {

	var checker func(context.Context, *ladon.Request) error

	var bb []byte
	if ka, err := cache_helper.ResolveCache(ctx, common.CacheTypeShared, groupsCacheConfig); err == nil && ka.Get("policyGroup", &bb) {
		var all []*idm.PolicyGroup
		if json.Unmarshal(bb, &all) == nil {
			log.Logger(ctx).Debug("Policies.IsAllowed - checking with Memory Manager from cache")
			mem := memory.NewMemoryManager()
			for _, g := range all {
				for _, p := range g.Policies {
					_ = mem.Create(converter.ProtoToLadonPolicy(p))
				}
			}
			checker = func(_ context.Context, r *ladon.Request) error {
				return (&ladon.Ladon{Manager: mem}).IsAllowed(r)
			}
		}
	}
	if checker == nil {
		dao, er := manager.Resolve[policy.DAO](ctx)
		if er != nil {
			return nil, er
		}
		checker = dao.IsAllowed
		log.Logger(ctx).Debug("Policies.IsAllowed - checking directly in DB and heating cache")
		defer func() {
			_, _ = h.ListPolicyGroups(context.WithoutCancel(ctx), &idm.ListPolicyGroupsRequest{})
		}()
	}

	response := &idm.PolicyEngineResponse{}

	reqContext := make(map[string]interface{})
	for k, v := range request.Context {
		reqContext[k] = v
	}
	var allowed bool
	var explicitDeny bool
	var checkError error

	wg := &sync.WaitGroup{}
	wg.Add(len(request.Subjects))
	var can context.CancelFunc
	ctx, can = context.WithCancel(ctx)
	defer can()

	for _, subject := range request.Subjects {

		go func(sub string) {
			defer wg.Done()
			ladonRequest := &ladon.Request{
				Subject:  sub,
				Resource: request.Resource,
				Action:   request.Action,
				Context:  reqContext,
			}
			if err := checker(ctx, ladonRequest); err == nil {
				// Explicit allow
				allowed = true
			} else if errors.Is(err, ladon.ErrRequestForcefullyDenied) {
				// Explicitly Deny : break and return false, cancel other policies
				explicitDeny = true
				can()
			} else if !errors.Is(err, ladon.ErrRequestDenied) && !errors.Is(err, context.Canceled) {
				if strings.Contains(err.Error(), "connection refused") {
					log.Logger(ctx).Error("Connection to DB error", zap.String("error", err.Error()))
					err = fmt.Errorf("DAO error received")
				}
				checkError = err
				can()
			}
		}(subject)
	}
	wg.Wait()

	if checkError != nil {
		return response, checkError
	}
	if explicitDeny {
		response.ExplicitDeny = true
	} else if allowed {
		response.Allowed = true
	} else {
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
	if er == nil && request.Filter == "" && ka.Get("policyGroup", &bb) {
		if json.Unmarshal(bb, &response.PolicyGroups) == nil {
			response.Total = int32(len(response.PolicyGroups))
			return response, nil
		}
	}

	groups, err := dao.ListPolicyGroups(ctx, request.Filter)
	if err != nil {
		return nil, err
	}
	response.PolicyGroups = groups
	response.Total = int32(len(groups))

	if request.Filter == "" && ka != nil {
		msg, _ := json.Marshal(groups)
		if err = ka.Set("policyGroup", msg); err != nil {
			log.Logger(ctx).Error("Cannot fill cache for policy groups", zap.Error(err))
		}
	}

	return response, nil
}

func (h *Handler) StorePolicyGroup(ctx context.Context, request *idm.StorePolicyGroupRequest) (*idm.StorePolicyGroupResponse, error) {

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	if ka, er := cache_helper.ResolveCache(ctx, common.CacheTypeShared, groupsCacheConfig); er == nil {
		_ = ka.Delete("policyGroup")
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
	_ = broker.Publish(ctx, common.TopicIdmPolicies, &idm.ChangeEvent{Type: idm.ChangeEventType_UPDATE})

	return response, nil
}

func (h *Handler) DeletePolicyGroup(ctx context.Context, request *idm.DeletePolicyGroupRequest) (*idm.DeletePolicyGroupResponse, error) {

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	if ka, er := cache_helper.ResolveCache(ctx, common.CacheTypeShared, groupsCacheConfig); er == nil {
		_ = ka.Delete("policyGroup")
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
	_ = broker.Publish(ctx, common.TopicIdmPolicies, &idm.ChangeEvent{Type: idm.ChangeEventType_UPDATE})

	return response, nil
}
