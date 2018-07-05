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
	"github.com/ory/ladon"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/idm/policy/conditions"
)

var (
	// DefaultPolicyGroups provides some sample policies to Admin Users
	DefaultPolicyGroups = []*idm.PolicyGroup{
		{
			Uuid:          "public-access",
			Name:          "PolicyGroup.PublicAccess.Title",
			Description:   "PolicyGroup.PublicAccess.Description",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "discovery-policy",
					Description: "PolicyGroup.PublicAccess.Rule1",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/config/discovery<.*>"},
					Actions:     []string{"GET"},
					Effect:      ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "reset-password-policy",
					Description: "PolicyGroup.PublicAccess.Rule2",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/auth/reset-password<.*>"},
					Actions:     []string{"PUT", "POST"},
					Effect:      ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "frontend-state",
					Description: "PolicyGroup.PublicAccess.Rule3",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/frontend/<.*>"},
					Actions:     []string{"GET"},
					Effect:      ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "frontend-auth",
					Description: "PolicyGroup.PublicAccess.Rule3",
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
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "install-policy",
					Description: "PolicyGroup.PublicInstall.Rule1",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/install"},
					Actions:     []string{"GET", "POST"},
					Effect:      ladon.AllowAccess,
				}),
			},
		},

		{
			Uuid:          "frontend-restricted-accesses",
			Name:          "PolicyGroup.FrontendAccess.Title",
			Description:   "PolicyGroup.FrontendAccess.Description",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				// This policies must be refined with trusted frontends IPs
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "anon-default-policy",
					Description: "PolicyGroup.FrontendAccess.Rule1",
					Subjects:    []string{"profile:anon"},
					Resources: []string{
						"rest:/config/frontend<.+>",
						"rest:/docstore/share/<.+>",
						"rest:/docstore/keystore/<.+>",
					},
					Actions: []string{"GET", "POST"},
					Effect:  ladon.AllowAccess,
					Conditions: ladon.Conditions{
						servicecontext.HttpMetaRemoteAddress: &ladon.StringMatchCondition{
							Matches: "localhost|127.0.0.1|::1",
						},
					},
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "anon-frontend-logs",
					Description: "PolicyGroup.FrontendAccess.Rule2",
					Subjects:    []string{"profile:anon"},
					Resources:   []string{"rest:/frontend/frontlogs"},
					Actions:     []string{"PUT"},
					Effect:      ladon.AllowAccess,
					Conditions: ladon.Conditions{
						servicecontext.HttpMetaRemoteAddress: &ladon.StringMatchCondition{
							Matches: "localhost|127.0.0.1|::1",
						},
					},
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
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "admin-default-policy",
					Description: "PolicyGroup.LoggedUsers.Rule1",
					Subjects:    []string{"profile:admin"},
					Resources:   []string{"rest:<.+>"},
					Actions:     []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
					Effect:      ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "user-default-policy",
					Description: "PolicyGroup.LoggedUsers.Rule2",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/acl",
						"rest:/acl/<.+>",
						"rest:/user",
						"rest:/user/<.+>",
						"rest:/workspace",
						"rest:/workspace/<.+>",
						"rest:/role",
						"rest:/role/<.+>",
						"rest:/graph<.+>",
						"rest:/docstore/bulk_delete/keystore",
						"rest:/docstore/keystore<.+>",
						"rest:/jobs/user",
						"rest:/jobs/user<.+>",
						"rest:/meta<.+>",
						"rest:/user-meta<.+>",
						"rest:/mailer/send",
						"rest:/search/nodes",
						"rest:/share<.+>",
						"rest:/activity<.+>",
						"rest:/changes",
						"rest:/changes<.+>",
						"rest:/frontend/<.*>",
						"rest:/tree/<.*>",
					},
					Actions: []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
					Effect:  ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "user-meta-tags-no-delete",
					Description: "Prevent clearing user meta tags for non admins",
					Subjects:    []string{"profile:standard", "profile:shared"},
					Resources: []string{
						"rest:/user-meta/tags<.+>",
					},
					Actions: []string{"DELETE"},
					Effect:  ladon.DenyAccess,
				}),
			},
		},

		{
			Uuid:          "oidc-actions-policies",
			Name:          "PolicyGroup.OIDC.Title",
			Description:   "PolicyGroup.OIDC.Description",
			ResourceGroup: idm.PolicyResourceGroup_oidc,
			Policies: []*idm.Policy{
				LadonToProtoPolicy(&ladon.DefaultPolicy{
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
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-complex-rule1",
					Description: "PolicyGroup.ACLSample1.Rule1",
					Subjects:    []string{"policy:sample-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
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
						utils.PolicyNodeMetaName: &ladon.StringMatchCondition{
							Matches: "target",
						},
					},
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
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
						utils.PolicyNodeMetaName: &ladon.StringMatchCondition{
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
				LadonToProtoPolicy(&ladon.DefaultPolicy{
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
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-date-rule1",
					Description: "PolicyGroup.ACLSampleDateDisable.Rule1",
					Subjects:    []string{"policy:no-access-after-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
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
				LadonToProtoPolicy(&ladon.DefaultPolicy{
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
				LadonToProtoPolicy(&ladon.DefaultPolicy{
					ID:          "acl-complex-rule4",
					Description: "PolicyGroup.ACLSampleExternalIP.Rule1",
					Subjects:    []string{"policy:no-external-access-acl-policy"},
					Resources:   []string{"acl"},
					Actions:     []string{"read", "write"},
					Effect:      ladon.AllowAccess,
				}),
				LadonToProtoPolicy(&ladon.DefaultPolicy{
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
