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

package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/scheduler/jobs/userspace"
)

// Templates forwards call to TemplatesHandler (same i/o format)
func (h *Handler) Templates(req *restful.Request, resp *restful.Response) error {
	return h.TemplatesHandler.ListTemplates(req, resp)
}

// CreateSelection forwards to userspace.PersistSelection
func (h *Handler) CreateSelection(req *restful.Request, resp *restful.Response) error {

	var input rest.Selection
	if e := req.ReadEntity(&input); e != nil {
		return e
	} else if len(input.Nodes) == 0 {
		return errors.WithMessage(errors.InvalidParameters, "please provide at least one node")
	}
	// Transform incoming node format to internal one
	var nn []*tree.Node
	for _, node := range input.Nodes {
		nn = append(nn, &tree.Node{Path: node.Path})
	}
	selectionUuid, err := userspace.PersistSelection(req.Request.Context(), nn)
	if err != nil {
		return err
	}
	response := &rest.Selection{
		Uuid:  selectionUuid,
		Nodes: input.Nodes,
	}
	return resp.WriteEntity(response)

}
