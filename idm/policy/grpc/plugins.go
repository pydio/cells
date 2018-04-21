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

// Package grpc is the policy engine service
package grpc

import (
	"context"
	"fmt"
	"strings"

	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/idm/policy"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY),
		service.Tag(common.SERVICE_TAG_IDM),
		service.Description("Policy Engine Service"),
		service.WithStorage(policy.NewDAO, "idm_policy"),
		service.Migrations([]*service.Migration{
			{
				TargetVersion: service.FirstRun(),
				Up:            InitDefaults,
			},
		}),
		service.WithMicro(func(m micro.Service) error {
			handler := new(Handler)
			idm.RegisterPolicyEngineServiceHandler(m.Options().Server, handler)
			return nil
		}),
	)
}

func InitDefaults(ctx context.Context) error {

	cfg := config.Default()
	var ctxString string
	if allowed := cfg.Get("services", "pydio.frontends", "allowed").String(""); allowed != "" {
		// Replace "," with "|"
		ctxString = strings.Join(strings.Split(allowed, ","), "|")
	}

	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	for _, policyGroup := range policy.DefaultPolicyGroups {

		if policyGroup.Uuid == "frontend-restricted-accesses" && ctxString != "" {
			for _, pol := range policyGroup.Policies {
				pol.Conditions = map[string]*idm.PolicyCondition{
					servicecontext.HttpMetaRemoteAddress: &idm.PolicyCondition{
						Type:        "StringMatchCondition",
						JsonOptions: fmt.Sprintf("{\"matches\":\"%s\"}", ctxString),
					},
				}
			}
		}

		if _, er := dao.StorePolicyGroup(ctx, policyGroup); er != nil {
			log.Logger(ctx).Error("Could not store default policy!", zap.Any("policy", policyGroup), zap.Error(er))
		}
	}
	log.Logger(ctx).Info("Successfully inserted default policies")
	return nil
}
