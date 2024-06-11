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

	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/idm/policy"
)

type Handler struct {
	idm.UnimplementedPolicyEngineServiceServer
	groupsCachePool *openurl.Pool[cache.Cache]
}

func NewHandler() idm.PolicyEngineServiceServer {
	return &Handler{
		groupsCachePool: cache.MustOpenPool(runtime.ShortCacheURL("evictionTime", "72h", "cleanWindow", "72h")),
	}
}

func (h *Handler) IsAllowed(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	response := &idm.PolicyEngineResponse{}

	reqContext := make(map[string]interface{})
	for k, v := range request.Context {
		reqContext[k] = v
	}
	var allowed bool

	for _, subject := range request.Subjects {

		ladonRequest := &ladon.Request{
			Subject:  subject,
			Resource: request.Resource,
			Action:   request.Action,
			Context:  reqContext,
		}

		if err := dao.IsAllowed(ctx, ladonRequest); err == nil {
			// Explicit allow
			allowed = true
		} else if strings.Contains(err.Error(), "Request was denied by default") {
			// This is a deny because no match: it does nothing but waits for
			// the loop to finish and see if there is an explicit allow or deny
		} else if strings.Contains(err.Error(), "Request was forcefully denied") {
			// Explicitly Deny : break and return false, ignoring following policies
			response.ExplicitDeny = true
			// log.Logger(context.Background()).Error("IsAllowed: explicitly denied", zap.Any("ladonRequest", ladonRequest))
			return response, nil
		} else {
			if strings.Contains(err.Error(), "connection refused") {
				log.Logger(ctx).Error("Connection to DB error", zap.String("error", err.Error()))
				err = fmt.Errorf("DAO error received")
			}
			return response, err
		}
	}

	if allowed {
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

	ka, er := h.groupsCachePool.Get(ctx)

	if er == nil && request.Filter == "" && ka.Get("policyGroup", &response.PolicyGroups) {
		response.Total = int32(len(response.PolicyGroups))
		return response, nil
	}

	groups, err := dao.ListPolicyGroups(ctx, request.Filter)
	if err != nil {
		return nil, err
	}
	response.PolicyGroups = groups
	response.Total = int32(len(groups))

	if request.Filter == "" && ka != nil {
		_ = ka.Set("policyGroup", groups)
	}

	return response, nil
}

func (h *Handler) StorePolicyGroup(ctx context.Context, request *idm.StorePolicyGroupRequest) (*idm.StorePolicyGroupResponse, error) {

	dao, er := manager.Resolve[policy.DAO](ctx)
	if er != nil {
		return nil, er
	}

	if ka, er := h.groupsCachePool.Get(ctx); er == nil {
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

	if ka, er := h.groupsCachePool.Get(ctx); er == nil {
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
