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
	"encoding/json"

	"github.com/emicklei/go-restful"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/discovery/config/lang"
)

/****************************
VERSIONING POLICIES MANAGEMENT
*****************************/

// ListVersioningPolicies list all defined policies.
func (s *Handler) ListVersioningPolicies(req *restful.Request, resp *restful.Response) {
	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguagesFromRestRequest(req, config.Default())...)
	dc := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	docs, er := dc.ListDocuments(req.Request.Context(), &docstore.ListDocumentsRequest{
		StoreID: common.DOCSTORE_ID_VERSIONING_POLICIES,
	})
	if er != nil {
		service.RestError500(req, resp, er)
		return
	}
	defer docs.Close()
	response := &rest.VersioningPolicyCollection{}
	for {
		r, e := docs.Recv()
		if e != nil {
			break
		}
		var policy *tree.VersioningPolicy
		if er := json.Unmarshal([]byte(r.Document.Data), &policy); er == nil {
			policy.Name = T(policy.Name)
			policy.Description = T(policy.Description)
			response.Policies = append(response.Policies, policy)
		}
	}
	resp.WriteEntity(response)
}

// GetVersioningPolicy returns a specific policy
func (s *Handler) GetVersioningPolicy(req *restful.Request, resp *restful.Response) {
	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguagesFromRestRequest(req, config.Default())...)
	policyId := req.PathParameter("Uuid")
	dc := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	if r, e := dc.GetDocument(req.Request.Context(), &docstore.GetDocumentRequest{
		StoreID:    common.DOCSTORE_ID_VERSIONING_POLICIES,
		DocumentID: policyId,
	}); e != nil {
		service.RestError404(req, resp, e)
	} else {
		var policy *tree.VersioningPolicy
		if er := json.Unmarshal([]byte(r.Document.Data), &policy); er == nil {
			policy.Name = T(policy.Name)
			policy.Description = T(policy.Description)
			resp.WriteEntity(policy)
		} else {
			service.RestError500(req, resp, er)
		}
	}
}
