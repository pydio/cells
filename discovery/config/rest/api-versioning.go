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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons"
	"github.com/pydio/cells/v4/common/client/commons/docstorec"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/discovery/config/lang"
)

/****************************
VERSIONING POLICIES MANAGEMENT
*****************************/

// ListVersioningPolicies list all defined policies.
func (s *Handler) ListVersioningPolicies(req *restful.Request, resp *restful.Response) error {
	T := lang.Bundle().T(middleware.DetectedLanguages(req.Request.Context())...)
	ctx := req.Request.Context()
	dc := docstorec.DocStoreClient(ctx)
	response := &rest.VersioningPolicyCollection{}
	docs, er := dc.ListDocuments(ctx, &docstore.ListDocumentsRequest{
		StoreID: common.DocStoreIdVersioningPolicies,
	})
	if er = commons.ForEach(docs, er, func(r *docstore.ListDocumentsResponse) error {
		var policy *tree.VersioningPolicy
		if err := json.Unmarshal([]byte(r.GetDocument().GetData()), &policy); err != nil {
			return err
		}
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
	dc := docstorec.DocStoreClient(ctx)
	if r, e := dc.GetDocument(ctx, &docstore.GetDocumentRequest{
		StoreID:    common.DocStoreIdVersioningPolicies,
		DocumentID: policyId,
	}); e != nil {
		return e
	} else {
		var policy *tree.VersioningPolicy
		if er := json.Unmarshal([]byte(r.Document.Data), &policy); er == nil {
			policy.Name = T(policy.Name)
			policy.Description = T(policy.Description)
			return resp.WriteEntity(policy)
		} else {
			return er
		}
	}
}
