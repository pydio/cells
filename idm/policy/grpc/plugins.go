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
	"github.com/pydio/cells/common/plugins"
	"go.uber.org/zap"

	"strings"

	"github.com/ory/ladon"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/idm/policy"
)

func init() {
	plugins.Register(func() {
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
				{
					TargetVersion: service.ValidVersion("1.0.3"),
					Up:            Upgrade103,
				},
				{
					TargetVersion: service.ValidVersion("1.2.0"),
					Up:            Upgrade120,
				},
				{
					TargetVersion: service.ValidVersion("1.2.2"),
					Up:            Upgrade122,
				},
				{
					TargetVersion: service.ValidVersion("1.4.2"),
					Up:            Upgrade142,
				},
				{
					TargetVersion: service.ValidVersion("2.0.3"),
					Up:            Upgrade203,
				},
			}),
			service.WithMicro(func(m micro.Service) error {
				handler := new(Handler)
				idm.RegisterPolicyEngineServiceHandler(m.Options().Server, handler)
				return nil
			}),
		)
	})
}

// InitDefaults is called once at first launch to create default policy groups.
func InitDefaults(ctx context.Context) error {

	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	for _, policyGroup := range policy.DefaultPolicyGroups {
		if _, er := dao.StorePolicyGroup(ctx, policyGroup); er != nil {
			log.Logger(ctx).Error("could not store default policy group "+policyGroup.Uuid, zap.Any("policy", policyGroup), zap.Error(er))
		}
	}
	log.Logger(ctx).Info("Inserted default policies")
	return nil
}

// Upgrade101 adapts policy dbs. It is called once at service launch when Cells version become >= 1.0.1.
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
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		} else if group.Uuid == "rest-apis-default-accesses" {
			for _, p := range group.Policies {
				if p.Id == "user-default-policy" {
					p.Resources = append(p.Resources, "rest:/docstore/keystore<.+>", "rest:/changes", "rest:/changes<.+>")
				}
			}
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		}
	}
	log.Logger(ctx).Info("Upgraded policy model to v1.0.1")
	return nil
}

// Upgrade103 adapts policy dbs. It is called once at service launch when Cells version become >= 1.0.3 .
func Upgrade103(ctx context.Context) error {
	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx)
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			group.Policies = append(group.Policies, policy.LadonToProtoPolicy(&ladon.DefaultPolicy{
				ID:          "shares-default-policy",
				Description: "PolicyGroup.LoggedUsers.Rule3",
				Subjects:    []string{"profile:standard", "profile:shared"},
				Resources:   []string{"rest:/docstore/share/<.+>"},
				Actions:     []string{"GET", "PUT"},
				Effect:      ladon.AllowAccess,
			}))
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		}
	}
	log.Logger(ctx).Info("Upgraded policy model to v1.0.3")
	return nil
}

// Upgrade120 performs upgrade on policies starting at v1.2.0
func Upgrade120(ctx context.Context) error {
	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx)
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			var updates []*idm.Policy
			for _, p := range group.Policies {
				if p.Id == "shares-default-policy" {
					// Remove that one
					continue
				}
				if p.Id == "user-default-policy" {
					var newResources []string
					for _, res := range p.Resources {
						if strings.HasPrefix(res, "rest:/acl") || strings.HasPrefix(res, "rest:/docstore") {
							// Remove those accesses
							continue
						}
						newResources = append(newResources, res)
					}
					newResources = append(newResources, "rest:/frontend/<.*>", "rest:/tree/<.*>")
					p.Resources = newResources
				}
				updates = append(updates, p)
			}
			updates = append(updates, policy.LadonToProtoPolicy(&ladon.DefaultPolicy{
				ID:          "user-meta-tags-no-delete",
				Description: "PolicyGroup.LoggedUsers.Rule3",
				Subjects:    []string{"profile:standard", "profile:shared"},
				Resources: []string{
					"rest:/user-meta/tags<.+>",
				},
				Actions: []string{"DELETE"},
				Effect:  ladon.DenyAccess,
			}))
			group.Policies = updates
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		} else if group.Uuid == "frontend-restricted-accesses" {
			if err := dao.DeletePolicyGroup(ctx, group); err != nil {
				log.Logger(ctx).Error("could not delete unused policy group "+group.Uuid, zap.Error(err))
			} else {
				log.Logger(ctx).Info("Deleted unused policy group "+group.Uuid, zap.Error(err))
			}
		} else if group.Uuid == "public-access" {
			group.Policies = append(group.Policies, policy.LadonToProtoPolicy(&ladon.DefaultPolicy{
				ID:          "frontend-state",
				Description: "PolicyGroup.PublicAccess.Rule3",
				Subjects:    []string{"profile:anon"},
				Resources:   []string{"rest:/frontend/<.*>"},
				Actions:     []string{"GET"},
				Effect:      ladon.AllowAccess,
			}), policy.LadonToProtoPolicy(&ladon.DefaultPolicy{
				ID:          "frontend-auth",
				Description: "PolicyGroup.PublicAccess.Rule4",
				Subjects:    []string{"profile:anon"},
				Resources:   []string{"rest:/frontend/session"},
				Actions:     []string{"POST"},
				Effect:      ladon.AllowAccess,
			}))
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		}

	}
	return nil
}

// Upgrade122 adapts policy dbs. It is called once at service launch when Cells version become >= 1.2.2.
func Upgrade122(ctx context.Context) error {
	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx)
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			for _, p := range group.Policies {
				if p.Id == "user-default-policy" {
					p.Resources = append(p.Resources, "rest:/templates")
				}
			}
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		}
	}
	log.Logger(ctx).Info("Upgraded policy model to v1.2.2")
	return nil
}

// Upgrade120 performs upgrade on policies starting at v1.2.0
func Upgrade142(ctx context.Context) error {
	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx)
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			group.Policies = append(group.Policies, policy.LadonToProtoPolicy(&ladon.DefaultPolicy{
				ID:          "user-ws-readonly",
				Description: "PolicyGroup.LoggedUsers.Rule4",
				Subjects:    []string{"profile:standard", "profile:shared"},
				Resources: []string{
					"rest:/workspace/<.+>",
				},
				Actions: []string{"DELETE", "PUT", "PATCH"},
				Effect:  ladon.DenyAccess,
			}))
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		}
	}
	return nil
}

func Upgrade203(ctx context.Context) error {
	dao := servicecontext.GetDAO(ctx).(policy.DAO)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx)
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			for _, p := range group.Policies {
				if p.Id == "user-default-policy" {
					var newRes []string
					for _, r := range p.Resources {
						if r == "rest:/tree/<.*>" {
							newRes = append(newRes,
								"rest:/tree/create",
								"rest:/tree/delete",
								"rest:/tree/restore",
								"rest:/tree/selection",
								"rest:/tree/stat/<.+>",
								"rest:/tree/stats",
							)
						} else {
							newRes = append(newRes, r)
						}
					}
					p.Resources = newRes
				}
			}
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		}
	}
	return nil
}
