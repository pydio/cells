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
	"path/filepath"
	"strings"

	microerr "github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"go.uber.org/zap"
)

const rootRelPath = "/"

// EndpointType specifies the endpoint implementation
type EndpointType string

const (
	// EndpointTypeDataSource ...
	EndpointTypeDataSource EndpointType = "datasource"
)

// EndpointConfig contains configuration information for a datasource
type EndpointConfig struct {
	Type   EndpointType `json:"type"`
	DSName string       `json:"name"`
	Path   string       `json:"path"`
}

// GetRootPath prepends the datasource to the path
func (c EndpointConfig) GetRootPath() string {
	return c.DSName + "/" + strings.TrimLeft(c.Path, "/")
}

// IsFromSide returns true if a node comes from the same side as the endpoint
func (c EndpointConfig) IsFromSide(node *tree.Node) bool {
	return strings.HasPrefix(node.Path, c.GetRootPath())
}

func (c EndpointConfig) insertRootPath(n *tree.Node) {
	n.Path = filepath.Join(c.GetRootPath(), n.Path)
}

// TrimRootPath updates a node's path with the relative path
func (c EndpointConfig) TrimRootPath(n *tree.Node) {
	n.Path = strings.TrimPrefix(n.Path, c.GetRootPath())
}

// GetRoot obtains the root node from the client
func (c EndpointConfig) GetRoot(ctx context.Context) (n *tree.Node, err error) {
	if resp, err := GetClient().ReadNode(ctx, &tree.ReadNodeRequest{
		Node:        &tree.Node{Path: rootRelPath},
		WithCommits: true,
	}); err == nil {
		c.TrimRootPath(resp.Node)
		n = resp.Node
	}

	return
}

// GetNode returns the node at a particular addr, if it exists.  A non-nil error
// signifies a network problem; missing nodes (404) are reported by a `false`
// boolean.
func (c EndpointConfig) GetNode(ctx context.Context, path string) (*tree.Node, bool, error) {
	l := log.Logger(ctx)

	// substitute leading "/" with the full datasource
	path = filepath.Join(c.GetRootPath(), path)
	path = filepath.Clean(path) // above step may produce "//" in the path
	l.Debug("fetching node", zap.String("path", path), zap.String("root path", c.GetRootPath()))

	resp, err := GetClient().ReadNode(ctx, &tree.ReadNodeRequest{
		Node:        &tree.Node{Path: path},
		WithCommits: true,
	})

	if err != nil {
		if microerr.Parse(err.Error()).Code == 404 {
			l.Debug("node not found", zap.String("absPath", path))
			return nil, false, nil
		}

		l.Debug("error fetching node", zap.String("error", microerr.Parse(err.Error()).Detail))
		return nil, false, err
	}

	c.TrimRootPath(resp.Node)
	return resp.Node, true, nil

}

// GetChildren provides a range-iterable view of a node's children
func (c EndpointConfig) GetChildren(ctx context.Context, path string) (chan *tree.Node, error) {
	// substitute leading "/" with the full datasource
	path = filepath.Join(c.GetRootPath(), path)
	path = filepath.Clean(path) // above step may produce "//" in the path

	streamer, err := GetClient().ListNodes(ctx, &tree.ListNodesRequest{
		Node:        &tree.Node{Path: path},
		WithCommits: true,
		Recursive:   false,
	})
	if err != nil {
		return nil, err
	}

	ch := make(chan *tree.Node, 1)
	go func() {
		defer streamer.Close()
		for {
			resp, e := streamer.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			c.TrimRootPath(resp.Node)
			ch <- resp.Node
		}
		close(ch)
	}()

	return ch, nil
}

// CreateNode inserts a node into the endpoint, failing if the node already exists
func (c EndpointConfig) CreateNode(ctx context.Context, n *tree.Node) (err error) {
	c.insertRootPath(n)
	_, err = GetClient().CreateNode(ctx, &tree.CreateNodeRequest{Node: n})
	// TODO:  do I need to check resp.Success? => NO
	return

}

// UpdateNode

// DeleteNode removes a node in an endpoint
func (c EndpointConfig) DeleteNode(ctx context.Context, n *tree.Node) (err error) {
	c.insertRootPath(n)
	_, err = GetClient().DeleteNode(ctx, &tree.DeleteNodeRequest{Node: n})
	return
}
