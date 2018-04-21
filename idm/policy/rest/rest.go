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
	"github.com/emicklei/go-restful"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/idm/policy/lang"
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

func (h *PolicyHandler) getClient() idm.PolicyEngineServiceClient {
	return idm.NewPolicyEngineServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY, defaults.NewClient())
}

// List Policy Groups
func (h *PolicyHandler) ListPolicies(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	log.Logger(ctx).Info("Received Policy.List API request")

	response, err := h.getClient().ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
	languages := utils.UserLanguagesFromRestRequest(req)
	tr := lang.Bundle().GetTranslationFunc(languages...)
	for _, g := range response.PolicyGroups {
		g.Name = tr(g.Name)
		g.Description = tr(g.Description)
		for _, r := range g.Policies {
			r.Description = tr(r.Description)
		}
	}
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	rsp.WriteEntity(response)
}
