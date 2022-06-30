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

	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/idm/policy/converter"
)

const (
	PolicyNodeMetaName      = "NodeMetaName"
	PolicyNodeMetaPath      = "NodeMetaPath"
	PolicyNodeMetaType      = "NodeMetaType"
	PolicyNodeMetaExtension = "NodeMetaExtension"
	PolicyNodeMetaSize      = "NodeMetaSize"
	PolicyNodeMetaMTime     = "NodeMetaMTime"
	PolicyNodeMeta_         = "NodeMeta:"
)

func getCheckersCache() cache.Cache {
	if checkersCache == nil {
		c, _ := cache.OpenCache(context.TODO(), runtime.ShortCacheURL()+"?evictionTime=1m&cleanWindow=10m")
		checkersCache = c
	}
	return checkersCache
}

// PolicyRequestSubjectsFromUser builds an array of string subjects from the passed User.
func PolicyRequestSubjectsFromUser(user *idm.User) []string {
	subjects := []string{
		fmt.Sprintf("user:%s", user.Login),
	}
	if prof, ok := user.Attributes["profile"]; ok {
		subjects = append(subjects, fmt.Sprintf("profile:%s", prof))
	} else {
		subjects = append(subjects, "profile:standard")
	}
	for _, r := range user.Roles {
		subjects = append(subjects, fmt.Sprintf("role:%s", r.Uuid))
	}
	return subjects
}

// PolicyRequestSubjectsFromClaims builds an array of string subjects from the passed Claims.
func PolicyRequestSubjectsFromClaims(claims claim.Claims) []string {
	subjects := []string{
		fmt.Sprintf("user:%s", claims.Name),
	}
	if claims.Profile != "" {
		subjects = append(subjects, fmt.Sprintf("profile:%s", claims.Profile))
	} else {
		subjects = append(subjects, "profile:standard")
	}
	for _, r := range strings.Split(claims.Roles, ",") {
		subjects = append(subjects, fmt.Sprintf("role:%s", r))
	}
	return subjects
}

// PolicyContextFromMetadata extracts metadata directly from the context and enriches the passed policyContext.
func PolicyContextFromMetadata(policyContext map[string]string, ctx context.Context) {
	if ctxMeta, has := metadata.FromContextRead(ctx); has {
		for _, key := range []string{
			servicecontext.HttpMetaRemoteAddress,
			servicecontext.HttpMetaUserAgent,
			servicecontext.HttpMetaContentType,
			servicecontext.HttpMetaProtocol,
			servicecontext.HttpMetaHostname,
			servicecontext.HttpMetaHost,
			servicecontext.HttpMetaPort,
			servicecontext.ClientTime,
			servicecontext.ServerTime,
		} {
			if val, hasKey := ctxMeta[key]; hasKey {
				policyContext[key] = val
				// log.Logger(ctx).Error("Set key: "+key, zap.Any("value", val))
			}
		}
	}
}

// PolicyContextFromNode extracts metadata from the Node and enriches the passed policyContext.
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
	for k := range ms {
		policyContext[PolicyNodeMeta_+k] = node.GetStringMeta(k)
	}
}

var checkersCache cache.Cache

func loadPoliciesByResourcesType(ctx context.Context, resType string) ([]*idm.Policy, error) {

	cli := idm.NewPolicyEngineServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServicePolicy))
	r, e := cli.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
	if e != nil {
		return nil, e
	}
	var policies []*idm.Policy
	for _, g := range r.PolicyGroups {
		for _, p := range g.Policies {
			isType := false
			for _, res := range p.Resources {
				if res == resType {
					isType = true
					break
				}
			}
			if isType {
				policies = append(policies, p)
			}
		}
	}
	return policies, nil
}

// ClearCachedPolicies empties local cache
func ClearCachedPolicies(ctx context.Context, resType string) {
	getCheckersCache().Delete(resType)
}

func CachedPoliciesChecker(ctx context.Context, resType string) (ladon.Warden, error) {

	if ww, ok := getCheckersCache().Get(resType); ok {
		return ww.(ladon.Warden), nil
	}

	w := &ladon.Ladon{
		Manager: memory.NewMemoryManager(),
	}
	if policies, err := loadPoliciesByResourcesType(ctx, resType); err != nil {
		return nil, nil
	} else {
		for _, pol := range policies {
			w.Manager.Create(converter.ProtoToLadonPolicy(pol))
		}
	}

	getCheckersCache().Set(resType, w)
	return w, nil
}

func LocalACLPoliciesResolver(ctx context.Context, request *idm.PolicyEngineRequest, explicitOnly bool) (*idm.PolicyEngineResponse, error) {
	checker, e := CachedPoliciesChecker(ctx, "acl")
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
