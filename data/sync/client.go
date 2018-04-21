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

package sync

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
)

var (
	client *views.Router
)

// GetClient produces the Router that corresponds to an EndpointConfig
func GetClient() *views.Router {
	if client == nil {
		client = views.NewStandardRouter(views.RouterOptions{AdminView: true, WatchRegistry: true})
	}
	return client
}

// EndpointClient provides an API to an endpoint
type EndpointClient interface {
	GetRootPath() string
	GetRoot(context.Context) (*tree.Node, error)
	GetNode(ctx context.Context, path string) (n *tree.Node, ok bool, err error)
	GetChildren(ctx context.Context, path string) (chan *tree.Node, error)
	CreateNode(context.Context, *tree.Node) error
	DeleteNode(context.Context, *tree.Node) error
}
