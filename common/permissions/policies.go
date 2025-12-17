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
	"context"
	"fmt"
	"path"
	"strings"
	"sync"
	"text/template"

	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/middleware/keys"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
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
	Eviction:    "5m",
	CleanWindow: "10m",
}

var polCacheOnce sync.Once

func getCheckersCache(ctx context.Context) cache.Cache {
	polCacheOnce.Do(func() {
		_, _ = broker.Subscribe(context.WithoutCancel(ctx), common.TopicIdmPolicies, func(ct context.Context, message broker.Message) error {
			polCache := cache_helper.MustResolveCache(ct, common.CacheTypeLocal, polCacheConfig)
			_ = polCache.Reset()
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

func loadPoliciesByResourcesTypeAndSubjects(ctx context.Context, resType string, subjects []string) ([]*idm.Policy, error) {

	cli := idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicyGRPC))

	var queries []*anypb.Any

	q1, _ := anypb.New(&idm.PolicyGroupSingleQuery{
		ResourceGroup: resType,
		PolicySubject: subjects,
	})

	queries = append(queries, q1)

	st, e := cli.StreamPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Query: &service.Query{
		SubQueries: queries,
		Operation:  service.OperationType_OR,
	}})

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
			policies = append(policies, p)
		}
	}
	return policies, nil
}

func loadPoliciesByResourcesType(ctx context.Context, resType string) ([]*idm.Policy, error) {

	var queries []*anypb.Any

	q1, _ := anypb.New(&idm.PolicyGroupSingleQuery{
		ResourceGroup: resType,
	})

	queries = append(queries, q1)

	cli := idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicyGRPC))
	st, e := cli.StreamPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Query: &service.Query{
		SubQueries: queries,
		Operation:  service.OperationType_OR,
	}})
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
			policies = append(policies, p)
		}
	}
	return policies, nil
}

// ClearCachedPolicies empties local cache
func ClearCachedPolicies(ctx context.Context, resType string) {
	_ = getCheckersCache(ctx).Delete(resType)
}

func CachedPoliciesChecker(ctx context.Context, resType string, requestContext map[string]string, subjects []string) (ladon.Warden, error) {
	w := &ladon.Ladon{
		Manager: memory.NewMemoryManager(),
	}

	ca := getCheckersCache(ctx)
	var policies []*idm.Policy
	cacheKey := resType + "," + strings.Join(subjects, ",")
	if !ca.Get(cacheKey, &policies) {
		if p, err := loadPoliciesByResourcesTypeAndSubjects(ctx, resType, subjects); err != nil {
			return nil, err
		} else {
			policies = p
			_ = ca.Set(cacheKey, policies)
		}
	}

	contextInterface := make(map[string]any, len(requestContext))
	for k, v := range requestContext {
		contextInterface[k] = v
	}

	localCache := map[string]*template.Template{}

	for _, pol := range policies {
		if res, er := resolveConditionsTemplates(ctx, pol, contextInterface, localCache); er != nil {
			return nil, er
		} else if er = w.Manager.Create(ctx, converter.ProtoToLadonPolicy(res)); er != nil {
			return nil, er
		}
	}

	return w, nil
}

// resolvedConditions converts Go Template to resolved version
func resolveConditionsTemplates(ctx context.Context, pol *idm.Policy, requestContext map[string]any, cache map[string]*template.Template) (*idm.Policy, error) {
	if len(pol.Conditions) == 0 {
		return pol, nil
	}
	resolvedConditions := make(map[string]*idm.PolicyCondition, len(pol.Conditions))
	for key, cond := range pol.Conditions {
		if strings.Contains(cond.GetJsonOptions(), "{{") {
			cKey := cond.GetJsonOptions()
			tmpl, ok := cache[cKey]
			if !ok {
				var err error
				tmpl, err = template.New(cKey).Parse(cond.GetJsonOptions())
				if err != nil {
					log.Logger(ctx).Error("Cannot parse template", zap.Error(err))
					continue
				}
				cache[cKey] = tmpl
			}
			b := strings.Builder{}
			err := tmpl.Execute(&b, requestContext)
			if err != nil {
				log.Logger(ctx).Error("Cannot execute template", zap.Error(err))
				continue
			}
			resolvedConditions[key] = &idm.PolicyCondition{Type: cond.GetType(),
				JsonOptions: b.String(),
			}
		} else {
			resolvedConditions[key] = cond
		}
	}
	return &idm.Policy{
		ID:           pol.ID,
		Description:  pol.Description,
		Subjects:     pol.Subjects,
		Resources:    pol.Resources,
		Actions:      pol.Actions,
		OrmSubjects:  pol.OrmSubjects,
		OrmResources: pol.OrmResources,
		OrmActions:   pol.OrmActions,
		Effect:       pol.Effect,
		Conditions:   resolvedConditions,
	}, nil

}

func LocalACLPoliciesResolver(ctx context.Context, request *idm.PolicyEngineRequest, explicitOnly bool) (*idm.PolicyEngineResponse, error) {
	checker, e := CachedPoliciesChecker(ctx, "acl", request.Context, request.Subjects)
	if e != nil {
		return nil, e
	}
	cx := ladon.Context{}
	for k, v := range request.Context {
		cx[k] = v
	}

	allow := explicitOnly
	for _, subject := range request.Subjects {
		req := &ladon.Request{
			Resource: request.Resource,
			Subject:  subject,
			Action:   request.Action,
			Context:  cx,
		}
		if err := checker.IsAllowed(ctx, req); err != nil && err.Error() == ladon.ErrRequestForcefullyDenied.Error() {
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
