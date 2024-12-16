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

package uuid

import (
	"context"
	"path"

	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// WithExternalPath is used by UUID clients to hide internal path from API consumers
func WithExternalPath() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.UuidExternalPath = true
	}
}

// externalPathHandler is an BranchFilter setting node Path to the first workspace it finds, or empty
type externalPathHandler struct {
	abstract.BranchFilter
}

func (h *externalPathHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	h.AdaptOptions(c, options)
	return h
}

func newExternalPathHandler() *externalPathHandler {
	u := &externalPathHandler{}
	u.InputMethod = u.updateInputBranch
	u.OutputMethod = u.updateOutputBranch
	return u
}

func (h *externalPathHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	return ctx, node, nil
}

func (h *externalPathHandler) updateOutputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	out := node.Clone()
	aa := node.GetAppearsIn()
	out.Path = ""
	if len(aa) > 0 {
		out.Path = path.Join(aa[0].GetWsSlug(), aa[0].GetPath())
	}
	return ctx, out, nil

}
