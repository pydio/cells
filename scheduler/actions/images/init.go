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

// Package images provides default implementation of image related tasks.
package images

import (
	"context"
	"path"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/scheduler/actions"
)

// init auto registers image-related tasks.
func init() {

	manager := actions.GetActionsManager()

	manager.Register(thumbnailsActionName, func() actions.ConcreteAction {
		return &ThumbnailExtractor{}
	})

	manager.Register(exifTaskName, func() actions.ConcreteAction {
		return &ExifProcessor{}
	})

	manager.Register(cleanThumbTaskName, func() actions.ConcreteAction {
		return &CleanThumbsTask{}
	})

}

// getRouter provides a singleton-initialized StandardRouter in AdminView.
func getRouter(runtime context.Context) nodes.Client {
	return compose.PathClient(runtime, nodes.AsAdmin())
}

// getThumbLocation returns a node with the correct ds name for pydio thumbs store.
func getThumbLocation(r nodes.Client, ctx context.Context, keyName string) (c context.Context, n *tree.Node, e error) {
	source, er := r.GetClientsPool(ctx).GetDataSourceInfo(common.PydioThumbstoreNamespace)
	if er != nil {
		e = er
		return
	}
	n = &tree.Node{
		Type:  tree.NodeType_LEAF,
		Path:  path.Join(source.Name, keyName),
		MTime: time.Now().Unix(),
	}
	c = propagator.WithUserNameMetadata(ctx, common.PydioContextUserKey, common.PydioSystemUsername)
	return
}
