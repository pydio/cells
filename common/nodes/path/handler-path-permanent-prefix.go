/*
 * Copyright (c) 2019-2023. Abstrium SAS <team (at) pydio.com>
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

package path

import (
	"context"
	"path"
	"strings"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/proto/tree"
)

func WithPermanentPrefix() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if options.PermanentPrefix != "" {
			options.Wrappers = append(options.Wrappers, NewPermanentPrefix(options.PermanentPrefix))
		}
	}
}

func NewPermanentPrefix(p string) *PermanentPrefix {
	bt := &PermanentPrefix{
		Prefix: p,
	}
	bt.InputMethod = bt.updateInputBranch
	bt.OutputMethod = bt.updateOutputNode
	return bt
}

// PermanentPrefix is an BranchFilter finding workspace root(s) based on the path.
type PermanentPrefix struct {
	abstract.BranchFilter
	Prefix string
}

func (v *PermanentPrefix) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	v.AdaptOptions(c, options)
	return v
}

func (v *PermanentPrefix) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	out := node.Clone()
	out.Path = path.Join(v.Prefix, out.Path)
	return ctx, out, nil

}

func (v *PermanentPrefix) updateOutputNode(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	out := node.Clone()

	if r := strings.TrimPrefix(out.Path, v.Prefix); len(r) < len(out.Path) {
		out.Path = r
		return ctx, out, nil
	}

	return ctx, node, errors.WithMessagef(errors.StatusInternalServerError, "Cannot find prefix %s in output node path %s, this not normal", out.Path, v.Prefix)

}
