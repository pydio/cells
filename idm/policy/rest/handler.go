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

package rest

import (
	"context"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/policy/lang"
)

type PolicyHandler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *PolicyHandler) SwaggerTags() []string {
	return []string{"PolicyService"}
}

// Filter returns a function to filter the swagger path
func (h *PolicyHandler) Filter() func(string) string {
	return nil
}

func (h *PolicyHandler) getClient(ctx context.Context) idm.PolicyEngineServiceClient {
	return idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicyGRPC))
}

// ListPolicies lists Policy Groups
func (h *PolicyHandler) ListPolicies(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	log.Logger(ctx).Debug("Received Policy.List API request")
	response := &idm.ListPolicyGroupsResponse{}
	tr := lang.Bundle().T(middleware.DetectedLanguages(ctx)...)

	streamer, err := h.getClient(ctx).StreamPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
	if er := commons.ForEach(streamer, err, func(g *idm.PolicyGroup) error {
		g.Name = tr(g.Name)
		g.Description = tr(g.Description)
		for _, r := range g.Policies {
			r.Description = tr(r.Description)
		}
		response.PolicyGroups = append(response.PolicyGroups, g)
		return nil
	}); er != nil {
		return er
	}
	return rsp.WriteEntity(response)

}
