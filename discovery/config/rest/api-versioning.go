/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package rest

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/discovery/config/lang"
)

/****************************
VERSIONING POLICIES MANAGEMENT
*****************************/

// ListVersioningPolicies list all defined policies.
func (s *Handler) ListVersioningPolicies(req *restful.Request, resp *restful.Response) error {
	T := lang.Bundle().T(middleware.DetectedLanguages(req.Request.Context())...)
	ctx := req.Request.Context()
	vc := tree.NewNodeVersionerClient(grpc.ResolveConn(ctx, common.ServiceVersionsGRPC))
	pols, er := vc.ListVersioningPolicies(ctx, &tree.ListVersioningPoliciesRequest{})
	response := &rest.VersioningPolicyCollection{}
	if er = commons.ForEach(pols, er, func(policy *tree.VersioningPolicy) error {
		policy.Name = T(policy.Name)
		policy.Description = T(policy.Description)
		response.Policies = append(response.Policies, policy)
		return nil
	}); er != nil {
		return er
	}
	return resp.WriteEntity(response)
}

// GetVersioningPolicy returns a specific policy
func (s *Handler) GetVersioningPolicy(req *restful.Request, resp *restful.Response) error {
	T := lang.Bundle().T(middleware.DetectedLanguages(req.Request.Context())...)
	policyId := req.PathParameter("Uuid")
	ctx := req.Request.Context()
	vc := tree.NewNodeVersionerClient(grpc.ResolveConn(ctx, common.ServiceVersionsGRPC))
	pols, er := vc.ListVersioningPolicies(ctx, &tree.ListVersioningPoliciesRequest{PolicyID: policyId})
	return commons.ForEach(pols, er, func(policy *tree.VersioningPolicy) error {
		policy.Name = T(policy.Name)
		policy.Description = T(policy.Description)
		return resp.WriteEntity(policy)
	})

}
