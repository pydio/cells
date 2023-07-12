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

package policy

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/service"
	"strings"

	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/idm/policy/conditions"
	"github.com/pydio/cells/v4/idm/policy/converter"
)

var (
	// DefaultPolicyGroups provides some sample policies to Admin Users.
	// Note that Name and Description fields are generally i18nized
	// that is why we rather declare here the corresponding message IDs.
	DefaultPolicyGroups = []*idm.PolicyGroup{
		{
			Uuid:          "public-access",
			Name:          "PolicyGroup.PublicAccess.Title",
			Description:   "PolicyGroup.PublicAccess.Description",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "discovery-policy",
					Description: "PolicyGroup.PublicAccess.Rule1",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/config/discovery<.*>"},
					Actions:     []string{"GET"},
					Effect:      ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "reset-password-policy",
					Description: "PolicyGroup.PublicAccess.Rule2",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/auth/reset-password<.*>"},
					Actions:     []string{"PUT", "POST"},
					Effect:      ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "frontend-state",
					Description: "PolicyGroup.PublicAccess.Rule3",
					Subjects:    []string{"profile:anon"},
					Resources: []string{
						"rest:/frontend/binaries/GLOBAL/<.*>",
						"rest:/frontend/bootconf",
						"rest:/frontend/messages/<.*>",
						"rest:/frontend/plugins/<.*>",
						"rest:/frontend/state",
						"rest:/frontend/auth/state",
						"rest:/frontend/login/connectors",
					},
					Actions: []string{"GET"},
					Effect:  ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "frontend-auth",
					Description: "PolicyGroup.PublicAccess.Rule4",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/frontend/session"},
					Actions:     []string{"POST"},
					Effect:      ladon.AllowAccess,
				}),
			},
		},

		{
			Uuid:          "public-access-install",
			Name:          "PolicyGroup.PublicInstall.Title",
			Description:   "PolicyGroup.PublicInstall.Description",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "install-policy",
					Description: "PolicyGroup.PublicInstall.Rule1",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/install"},
					Actions:     []string{"GET", "POST"},
					Effect:      ladon.AllowAccess,
				}),
			},
		},

		// Default Accesses to REST endpoints for logged user and for admin user
		{
			Uuid:          "rest-apis-default-accesses",
			Name:          "PolicyGroup.LoggedUsers.Title",
			Description:   "PolicyGroup.LoggedUsers.Description",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "admin-default-policy",
					Description: "PolicyGroup.LoggedUsers.Rule1",
					Subjects:    []string{"profile:admin"},
					Resources:   []string{"rest:<.+>"},
					Actions:     []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
					Effect:      ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "user-default-policy",
					Description: "PolicyGroup.LoggedUsers.Rule2",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/user",
						"rest:/user/<.+>",
						"rest:/workspace",
						"rest:/role",
						"rest:/role/<.+>",
						"rest:/graph<.+>",
						"rest:/jobs/user",
						"rest:/jobs/user<.+>",
						"rest:/meta<.+>",
						"rest:/mailer/send",
						"rest:/search/nodes",
						"rest:/share<.+>",
						"rest:/activity<.+>",
						"rest:/changes",
						"rest:/changes<.+>",
						"rest:/scheduler/hooks/<.+>",
						"rest:/tree/create",
						"rest:/tree/delete",
						"rest:/tree/restore",
						"rest:/tree/selection",
						"rest:/tree/stat/<.+>",
						"rest:/tree/stats",
						"rest:/templates",
						"rest:/templates<.+>",
						"rest:/auth/token/document",
					},
					Actions: []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
					Effect:  ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "user-meta-read",
					Description: "PolicyGroup.LoggedUsers.Rule3",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/user-meta/bookmarks",
						"rest:/user-meta/namespace",
						"rest:/user-meta/search",
						"rest:/user-meta/tags/<.+>",
					},
					Actions: []string{"GET", "POST"},
					Effect:  ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "user-meta-put",
					Description: "PolicyGroup.LoggedUsers.Rule4",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/user-meta/update",
					},
					Actions: []string{"PUT"},
					Effect:  ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "frontend-read",
					Description: "PolicyGroup.LoggedUsers.Rule5",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/frontend/<.*>",
					},
					Actions: []string{"GET"},
					Effect:  ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "frontend-post",
					Description: "PolicyGroup.LoggedUsers.Rule6",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/frontend/binaries/USER/<.+>",
						"rest:/frontend/enroll",
						"rest:/frontend/session",
					},
					Actions: []string{"POST"},
					Effect:  ladon.AllowAccess,
				}),
			},
		},

		{
			Uuid:          "oidc-actions-policies",
			Name:          "PolicyGroup.OIDC.Title",
			Description:   "PolicyGroup.OIDC.Description",
			ResourceGroup: idm.PolicyResourceGroup_oidc,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "all-users-login",
					Description: "PolicyGroup.OIDC.Rule1",
					Subjects:    []string{"user:<.+>", "profile:<.+>", "role:<.+>"},
					Resources:   []string{"oidc"},
					Actions:     []string{"login"},
					Effect:      ladon.AllowAccess,
				}),
			},
		},

		// Sample Complex policy, composed of many policies, linked to ACLs.
		// sample-acl-policy allows read-write by default but:
		// - disables write if accessed locally and folder name is "target",
		// - hides files with extension "png" when accessed locally.
		{
			Uuid:          "sample-acl-policy",
			Name:          "PolicyGroup.ACLSample1.Title",
			Description:   "PolicyGroup.ACLSample1.Description",
			ResourceGroup: idm.PolicyResourceGroup_acl,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-complex-rule1",
					Description: "PolicyGroup.ACLSample1.Rule1",
					Subjects:    []string{"policy:sample-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-complex-rule2",
					Description: "PolicyGroup.ACLSample1.Rule2",
					Subjects:    []string{"policy:sample-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"write"},
					Effect:      ladon.DenyAccess,
					Conditions: ladon.Conditions{
						servicecontext.HttpMetaRemoteAddress: &conditions.StringNotMatchCondition{
							Matches: "localhost|127.0.0.1|::1",
						},
						permissions.PolicyNodeMetaName: &ladon.StringMatchCondition{
							Matches: "target",
						},
					},
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-complex-rule3",
					Description: "PolicyGroup.ACLSample1.Rule3",
					Subjects:    []string{"policy:sample-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read"},
					Effect:      ladon.DenyAccess,
					Conditions: ladon.Conditions{
						servicecontext.HttpMetaRemoteAddress: &conditions.StringNotMatchCondition{
							Matches: "localhost|127.0.0.1|::1",
						},
						permissions.PolicyNodeMetaName: &ladon.StringMatchCondition{
							Matches: "(.+)\\.png",
						},
					},
				}),
			},
		},

		// This policy enables access to a given workspace for a given period only.
		{
			Uuid:          "limited-period-access-acl-policy2",
			Name:          "PolicyGroup.ACLSamplePeriod.Title",
			Description:   "PolicyGroup.ACLSamplePeriod.Description",
			ResourceGroup: idm.PolicyResourceGroup_acl,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-temporary-access2",
					Description: "PolicyGroup.ACLSamplePeriod.Rule1",
					Subjects:    []string{"policy:limited-period-access-acl-policy2"},
					Resources:   []string{"acl"},
					Actions:     []string{"write", "read"},
					Effect:      ladon.AllowAccess,
					Conditions: ladon.Conditions{
						servicecontext.ClientTime: &conditions.WithinPeriodCondition{
							Matches: "2018-02-01T00:00+0100/2018-04-01T00:00+0100",
						},
					},
				}),
			},
		},

		// This policy totally disables access to a given workspace after a given date
		{
			Uuid:          "no-access-after-acl-policy",
			Name:          "PolicyGroup.ACLSampleDateDisable.Title",
			Description:   "PolicyGroup.ACLSampleDateDisable.Description",
			ResourceGroup: idm.PolicyResourceGroup_acl,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-date-rule1",
					Description: "PolicyGroup.ACLSampleDateDisable.Rule1",
					Subjects:    []string{"policy:no-access-after-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-date-rule2",
					Description: "PolicyGroup.ACLSampleDateDisable.Rule2",
					Subjects:    []string{"policy:no-access-after-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.DenyAccess,
					Conditions: ladon.Conditions{
						servicecontext.ServerTime: &conditions.DateAfterCondition{
							Matches: "2018-02-28T23:59+0100",
						},
					},
				}),
			},
		},

		// This policy enable access to a given workspace only during business hours
		{
			Uuid:          "office-hours-access-acl-policy",
			Name:          "PolicyGroup.ACLSampleBusinessHours.Title",
			Description:   "PolicyGroup.ACLSampleBusinessHours.Description",
			ResourceGroup: idm.PolicyResourceGroup_acl,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-office-hours-rule",
					Description: "PolicyGroup.ACLSampleBusinessHours.Rule1",
					Subjects:    []string{"policy:office-hours-access-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.AllowAccess,
					Conditions: ladon.Conditions{
						servicecontext.ClientTime: &conditions.OfficeHoursCondition{
							Matches: "Monday-Friday/09:00/18:30",
						},
					},
				}),
			},
		},
		// This policy should totally disable access to a given workspace
		{
			Uuid:          "no-external-access-acl-policy",
			Name:          "PolicyGroup.ACLSampleExternalIP.Title",
			Description:   "PolicyGroup.ACLSampleExternalIP.Description",
			ResourceGroup: idm.PolicyResourceGroup_acl,
			Policies: []*idm.Policy{
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-complex-rule4",
					Description: "PolicyGroup.ACLSampleExternalIP.Rule1",
					Subjects:    []string{"policy:no-external-access-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-complex-rule5",
					Description: "PolicyGroup.ACLSampleExternalIP.Rule2",
					Subjects:    []string{"policy:no-external-access-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.DenyAccess,
					Conditions: ladon.Conditions{
						servicecontext.HttpMetaRemoteAddress: &conditions.StringNotMatchCondition{
							Matches: "localhost|127.0.0.1|::1",
						},
					},
				}),
			},
		},
	}
)

// InitDefaults is called once at first launch to create default policy groups.
func InitDefaults(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	for _, policyGroup := range DefaultPolicyGroups {
		if _, er := dao.StorePolicyGroup(ctx, policyGroup); er != nil {
			log.Logger(ctx).Error("could not store default policy group "+policyGroup.Uuid, zap.Any("policy", policyGroup), zap.Error(er))
		}
	}
	log.Logger(ctx).Info("Inserted default policies")
	return nil
}

// Upgrade101 adapts policy dbs. It is called once at service launch when Cells version become >= 1.0.1.
func Upgrade101(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
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
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			group.Policies = append(group.Policies, converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
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
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
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
			updates = append(updates, converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
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
			group.Policies = append(group.Policies, converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
				ID:          "frontend-state",
				Description: "PolicyGroup.PublicAccess.Rule3",
				Subjects:    []string{"profile:anon"},
				Resources:   []string{"rest:/frontend/<.*>"},
				Actions:     []string{"GET"},
				Effect:      ladon.AllowAccess,
			}), converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
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
	dao := service.DAOFromContext[DAO](ctx)

	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
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

// Upgrade142 performs upgrade on policies starting at v1.4.2
func Upgrade142(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			group.Policies = append(group.Policies, converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
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

func Upgrade202(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
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

func Upgrade210(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			var newPolicies []*idm.Policy
			for _, p := range group.Policies {
				if p.Id == "user-meta-tags-no-delete" || p.Id == "user-ws-readonly" {
					continue
				}
				if p.Id == "user-default-policy" {
					var newRes []string
					for _, r := range p.Resources {
						if r == "rest:/workspace/<.+>" || r == "rest:/user-meta<.+>" {
							continue
						} else {
							newRes = append(newRes, r)
						}
					}
					p.Resources = newRes
				}
				newPolicies = append(newPolicies, p)
			}
			newPolicies = append(newPolicies,
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "user-meta-read",
					Description: "PolicyGroup.LoggedUsers.Rule3",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/user-meta/bookmarks",
						"rest:/user-meta/namespace",
						"rest:/user-meta/search",
						"rest:/user-meta/tags/<.+>",
					},
					Actions: []string{"GET", "POST"},
					Effect:  ladon.AllowAccess,
				}),
				converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "user-meta-put",
					Description: "PolicyGroup.LoggedUsers.Rule4",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/user-meta/update",
					},
					Actions: []string{"PUT"},
					Effect:  ladon.AllowAccess,
				}),
			)
			group.Policies = newPolicies
			if _, er := dao.StorePolicyGroup(ctx, group); er != nil {
				log.Logger(ctx).Error("could not update policy group "+group.Uuid, zap.Error(er))
			} else {
				log.Logger(ctx).Info("Updated policy group " + group.Uuid)
			}
		}
	}
	return nil
}

func Upgrade220(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			for _, p := range group.Policies {
				if p.Id == "user-default-policy" {
					p.Resources = append(p.Resources, "rest:/auth/token/document")
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

func Upgrade227(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "public-access" {
			for _, p := range group.Policies {
				if p.Id == "frontend-state" {
					p.Resources = []string{
						"rest:/frontend/binaries/GLOBAL/<.*>",
						"rest:/frontend/bootconf",
						"rest:/frontend/messages/<.*>",
						"rest:/frontend/plugins/<.*>",
						"rest:/frontend/state",
						"rest:/frontend/auth/state",
						"rest:/frontend/login/connectors",
					}
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

func Upgrade399(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			for _, p := range group.Policies {
				if p.Id == "user-default-policy" {
					p.Resources = append(p.Resources, "rest:/templates<.+>")
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

func Upgrade4199(ctx context.Context) error {
	dao := service.DAOFromContext[DAO](ctx)
	if dao == nil {
		return fmt.Errorf("cannot find DAO for policies initialization")
	}
	groups, e := dao.ListPolicyGroups(ctx, "")
	if e != nil {
		return e
	}
	for _, group := range groups {
		if group.Uuid == "rest-apis-default-accesses" {
			for _, p := range group.Policies {
				if p.Id == "user-default-policy" {
					p.Resources = append(p.Resources, "rest:/scheduler/hooks/<.+>")
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
