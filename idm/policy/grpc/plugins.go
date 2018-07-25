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

	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
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
			{
				TargetVersion: service.ValidVersion("1.0.1"),
				Up:            Upgrade101,
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

	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	for _, policyGroup := range policy.DefaultPolicyGroups {
		if _, er := dao.StorePolicyGroup(ctx, policyGroup); er != nil {
			log.Logger(ctx).Error("Could not store default policy!", zap.Any("policy", policyGroup), zap.Error(er))
		}
	}
	log.Logger(ctx).Info("Successfully inserted default policies")
	return nil
}

func Upgrade101(ctx context.Context) error {
	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx)
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "frontend-restricted-accesses" {
			for _, p := range group.Policies {
				if p.Id == "anon-frontend-logs" {
					p.Resources = []string{"rest:/frontend/frontlogs"}
				}
			}
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("Could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updating policy group " + group.Uuid)
			}
		} else if group.Uuid == "rest-apis-default-accesses" {
			for _, p := range group.Policies {
				if p.Id == "user-default-policy" {
					p.Resources = append(p.Resources, "rest:/docstore/keystore<.+>", "rest:/changes", "rest:/changes<.+>")
				}
			}
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("Could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updating policy group " + group.Uuid)
			}
		}
	}
	return nil
}
