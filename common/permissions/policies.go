/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package permissions

import (
	"bytes"
	"context"
	"fmt"
	"path"
	"strings"
	"sync"
	"text/template"

	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/middleware/keys"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/idm/policy/converter"
)

const (
	PolicyNodeMetaName      = "NodeMetaName"
	PolicyNodeMetaPath      = "NodeMetaPath"
	PolicyNodeMetaType      = "NodeMetaType"
	PolicyNodeMetaExtension = "NodeMetaExtension"
	PolicyNodeMetaSize      = "NodeMetaSize"
	PolicyNodeMetaMTime     = "NodeMetaMTime"
	PolicyNodeMeta_         = "NodeMeta:"

	PolicySubjectLoginPrefix   = "user:"
	PolicySubjectUuidPrefix    = "subject:"
	PolicySubjectProfilePrefix = "profile:"
	PolicySubjectRolePrefix    = "role:"

	PolicySubjectSelf = "self"
)

// var polCachePool *openurl.Pool[cache.Cache]
var polCacheConfig = cache.Config{
	Prefix:      "permissions/policies",
	Eviction:    "1m",
	CleanWindow: "10m",
}

var polCacheOnce sync.Once

func getCheckersCache(ctx context.Context) cache.Cache {
	polCacheOnce.Do(func() {
		_, _ = broker.Subscribe(context.WithoutCancel(ctx), common.TopicIdmPolicies, func(ct context.Context, message broker.Message) error {
			polCache := cache_helper.MustResolveCache(ct, common.CacheTypeLocal, polCacheConfig)
			_ = polCache.Delete("acl")
			_ = polCache.Delete("oidc")
			return nil
		}, broker.WithCounterName("policies-cache"))
	})
	return cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, polCacheConfig)
}

// PolicyRequestSubjectsFromUser builds an array of string subjects from the passed User.
func PolicyRequestSubjectsFromUser(ctx context.Context, user *idm.User, inheritProfiles bool) []string {
	subjects := []string{
		PolicySubjectLoginPrefix + user.Login,
		PolicySubjectUuidPrefix + user.Uuid,
	}
	prof, ok := user.Attributes[idm.UserAttrProfile]
	if !ok {
		log.Logger(ctx).Warn("No profile found for user, this is not expected")
	}
	if inheritProfiles {
		// Add all profiles up to the current one (e.g admin will check for anon, shared, standard, admin)
		for _, p := range common.PydioUserProfiles {
			subjects = append(subjects, PolicySubjectProfilePrefix+p)
			if p == prof {
				break
			}
		}
	} else {
		subjects = append(subjects, PolicySubjectProfilePrefix+prof)
	}
	for _, r := range user.Roles {
		subjects = append(subjects, PolicySubjectRolePrefix+r.Uuid)
	}
	return subjects
}

// PolicyRequestSubjectsFromClaims builds an array of string subjects from the passed Claims.
func PolicyRequestSubjectsFromClaims(ctx context.Context, claims claim.Claims, inheritProfiles bool) []string {
	subjects := []string{
		PolicySubjectLoginPrefix + claims.Name,
		PolicySubjectUuidPrefix + claims.Subject,
	}
	if claims.Profile == "" {
		log.Logger(ctx).Warn("No profile found in claims, this is not expected")
	}
	if inheritProfiles {
		// Add all profiles up to the current one (e.g admin will check for anon, shared, standard, admin)
		for _, p := range common.PydioUserProfiles {
			subjects = append(subjects, PolicySubjectProfilePrefix+p)
			if p == claims.Profile {
				break
			}
		}
	} else {
		subjects = append(subjects, PolicySubjectProfilePrefix+claims.Profile)
	}
	for _, r := range strings.Split(claims.Roles, ",") {
		subjects = append(subjects, PolicySubjectRolePrefix+r)
	}
	return subjects
}

// PolicyContextFromMetadata extracts metadata directly from the context and enriches the passed policyContext.
func PolicyContextFromMetadata(policyContext map[string]string, ctx context.Context) {
	if ctxMeta, has := propagator.FromContextRead(ctx); has {
		for _, key := range []string{
			keys.HttpMetaRemoteAddress,
			keys.HttpMetaUserAgent,
			keys.HttpMetaContentType,
			keys.HttpMetaProtocol,
			keys.HttpMetaHostname,
			keys.HttpMetaHost,
			keys.HttpMetaPort,
			keys.ClientTime,
			keys.ServerTime,
		} {
			if val, hasKey := ctxMeta[key]; hasKey {
				policyContext[key] = val
				// log.Logger(ctx).Error("Set key: "+key, zap.Any("value", val))
			}
		}
	}
}

// PolicyContextFromNode extracts metadata from the N and enriches the passed policyContext.
func PolicyContextFromNode(policyContext map[string]string, node *tree.Node) {
	policyContext[PolicyNodeMetaName] = node.GetStringMeta(common.MetaNamespaceNodeName)
	policyContext[PolicyNodeMetaPath] = node.Path
	policyContext[PolicyNodeMetaType] = node.GetType().String()
	policyContext[PolicyNodeMetaMTime] = fmt.Sprintf("%v", node.MTime)
	policyContext[PolicyNodeMetaSize] = fmt.Sprintf("%v", node.Size)
	policyContext[PolicyNodeMetaExtension] = strings.TrimLeft(path.Ext(node.Path), ".")
	ms := node.GetMetaStore()
	if ms == nil {
		return
	}
	for k, v := range ms {
		if s := node.GetStringMeta(k); s != "" {
			policyContext[PolicyNodeMeta_+k] = s
		} else {
			policyContext[PolicyNodeMeta_+k] = v
		}
	}
}

func PolicyContextFromClaims(policyContext map[string]string, ctx context.Context) {
	// Find profile in claims, if any
	if claims, ok := claim.FromContext(ctx); ok {
		policyContext["ClaimsName"] = claims.Name
		policyContext["ClaimsRoles"] = claims.Roles
		policyContext["ClaimsSubject"] = claims.Subject
		policyContext["ClaimsProfile"] = claims.Profile
		policyContext["ClaimsGroupPath"] = claims.GroupPath
		policyContext["ClaimsIssuer"] = claims.Issuer
		policyContext["ClaimsClientApp"] = claims.GetClientApp()
	}
}

func loadPoliciesByResourcesType(ctx context.Context, resType string) ([]*idm.Policy, error) {

	cli := idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicyGRPC))
	st, e := cli.StreamPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Filter: "resource_group:" + resType})
	if e != nil {
		return nil, e
	}
	var policies []*idm.Policy

	for {
		g, er := st.Recv()
		if er != nil {
			break
		}
		for _, p := range g.Policies {
			// THIS CHECK SHOULD BE UNNECESSARY NOW
			//isType := false
			//for _, res := range p.Resources {
			//	if res.GetID() == resType {
			//		isType = true
			//		break
			//	}
			//}
			//if isType {
			policies = append(policies, p)
			//}
		}
	}
	return policies, nil
}

// ClearCachedPolicies empties local cache
func ClearCachedPolicies(ctx context.Context, resType string) {
	_ = getCheckersCache(ctx).Delete(resType)
}

func CachedPoliciesChecker(ctx context.Context, resType string, requestContext map[string]string) (ladon.Warden, error) {
	w := &ladon.Ladon{
		Manager: memory.NewMemoryManager(),
	}

	ca := getCheckersCache(ctx)
	var policies []*idm.Policy
	if !ca.Get(resType, &policies) {
		if p, err := loadPoliciesByResourcesType(ctx, resType); err != nil {
			return nil, err
		} else {
			policies = p
			_ = ca.Set(resType, policies)
		}
	}

	for _, pol := range policies {
		replaces := map[string]*idm.PolicyCondition{}
		for key, cond := range pol.Conditions {
			if strings.Contains(cond.GetJsonOptions(), "{{") && requestContext != nil {
				if tpl, er := template.New("temp").Parse(cond.GetJsonOptions()); er == nil {
					bb := &bytes.Buffer{}
					if e := tpl.Execute(bb, requestContext); e == nil {
						replaces[key] = &idm.PolicyCondition{
							Type:        cond.GetType(),
							JsonOptions: bb.String(),
						}
					}
				}
			}
		}
		if len(replaces) > 0 {
			pol = proto.Clone(pol).(*idm.Policy)
			for k, c := range replaces {
				pol.Conditions[k] = c
			}
		}
		_ = w.Manager.Create(converter.ProtoToLadonPolicy(pol))
	}

	return w, nil
}

func LocalACLPoliciesResolver(ctx context.Context, request *idm.PolicyEngineRequest, explicitOnly bool) (*idm.PolicyEngineResponse, error) {
	checker, e := CachedPoliciesChecker(ctx, "acl", request.Context)
	if e != nil {
		return nil, e
	}
	cx := ladon.Context{}
	for k, v := range request.Context {
		cx[k] = v
	}

	allow := explicitOnly
	for _, subject := range request.Subjects {
		request := &ladon.Request{
			Resource: request.Resource,
			Subject:  subject,
			Action:   request.Action,
			Context:  cx,
		}
		if err := checker.IsAllowed(request); err != nil && err.Error() == ladon.ErrRequestForcefullyDenied.Error() {
			if explicitOnly {
				allow = false
			}
			break
		} else if err == nil {
			allow = true
		} // Else "default deny" => continue checking
	}
	return &idm.PolicyEngineResponse{Allowed: allow}, nil

}
