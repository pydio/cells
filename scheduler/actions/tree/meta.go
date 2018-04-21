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

package tree

import (
	"context"

	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/scheduler/actions"
)

type MetaAction struct {
	Client        tree.NodeReceiverClient
	MetaNamespace string
	MetaValue     interface{}
}

var (
	metaActionName = "actions.tree.meta"
)

// GetName returns this action unique identifier
func (c *MetaAction) GetName() string {
	return metaActionName
}

// Init passes parameters to the action
func (c *MetaAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {

	c.Client = tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, cl)
	c.MetaNamespace = action.Parameters["metaName"]
	c.MetaValue = action.Parameters["metaValue"]

	return nil
}

// Run the actual action code
func (c *MetaAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}

	// Update Metadata
	input.Nodes[0].SetMeta(c.MetaNamespace, c.MetaValue)

	_, err := c.Client.UpdateNode(ctx, &tree.UpdateNodeRequest{From: input.Nodes[0], To: input.Nodes[0]})
	if err != nil {
		return input.WithError(err), err
	}

	input.AppendOutput(&jobs.ActionOutput{Success: true})

	return input, nil
}
