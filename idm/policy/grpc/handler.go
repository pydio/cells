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
	"github.com/pydio/cells/v5/idm/policy"
	"github.com/pydio/cells/v5/idm/policy/converter"
)

type Handler struct {
	idm.UnimplementedPolicyEngineServiceServer
}

func NewHandler(context context.Context) idm.PolicyEngineServiceServer {
	return &Handler{}
}

func (h *Handler) IsAllowed(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error) {

	groups, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
	if err != nil {
		return nil, err
	}
	mem := memory.NewMemoryManager()
	for _, group := range groups.PolicyGroups {
		for _, p := range group.Policies {
			// A policy may belong to more than one group.
			_ = mem.Create(ctx, converter.ProtoToLadonPolicy(p))
		}
	}
	return runChecks(ctx, request, func(ctx context.Context, r *ladon.Request) error {
		return (&ladon.Ladon{Manager: mem}).IsAllowed(ctx, r)
	})
}

// runChecks evaluates each subject and aggregates decisions with explicit deny precedence.
func runChecks(ctx context.Context, request *idm.PolicyEngineRequest, checker func(context.Context, *ladon.Request) error) (*idm.PolicyEngineResponse, error) {
	response := &idm.PolicyEngineResponse{}

	reqContext := make(map[string]interface{})
	for k, v := range request.Context {
		reqContext[k] = v
	}
	var allowed atomic.Bool
	var explicitDeny atomic.Bool
	var checkError atomic.Pointer[error]

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
				allowed.Store(true)
			} else if errors.Is(err, ladon.ErrRequestForcefullyDenied) {
				// Explicitly Deny : break and return false, cancel other policies
				explicitDeny.Store(true)
				can()
			} else if !errors.Is(err, ladon.ErrRequestDenied) && !errors.Is(err, context.Canceled) {
				if strings.Contains(err.Error(), "connection refused") {
					log.Logger(ctx).Error("Connection to DB error", zap.String("error", err.Error()))
					err = errors.New("DAO error received")
				}
				checkError.CompareAndSwap(nil, &err)
				can()
			}
		}(subject)
	}
	wg.Wait()

	if ptr := checkError.Load(); ptr != nil {
		return response, *ptr
	}
	if explicitDeny.Load() {
		response.ExplicitDeny = true
	} else if allowed.Load() {
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

	response.Success = true
	log.Auditer(ctx).Info(
		fmt.Sprintf("Deleted policy group [%s]", request.PolicyGroup.Name),
		log.GetAuditId(common.AuditPolicyGroupDelete),
		request.PolicyGroup.ZapUuid(),
	)
	_ = broker.Publish(ctx, common.TopicIdmPolicies, &idm.ChangeEvent{Type: idm.ChangeEventType_UPDATE})

	return response, nil
}
