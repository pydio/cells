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
	"path"
	"strings"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
	"github.com/pydio/cells/scheduler/lang"
)

type DeleteAction struct {
	Client             views.Handler
	deleteChildrenOnly bool
}

var (
	deleteActionName = "actions.tree.delete"
)

// GetName returns this action unique identifier
func (c *DeleteAction) GetName() string {
	return deleteActionName
}

// Init passes parameters to the action
func (c *DeleteAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {

	c.Client = views.NewStandardRouter(views.RouterOptions{AdminView: true})
	if co, ok := action.Parameters["childrenOnly"]; ok && co == "true" {
		c.deleteChildrenOnly = true
	}

	return nil
}

// Run the actual action code
func (c *DeleteAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}

	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguageFromContext(ctx, config.Default(), true))

	sourceNode := input.Nodes[0]

	readR, readE := c.Client.ReadNode(ctx, &tree.ReadNodeRequest{Node: sourceNode})
	if readE != nil {
		log.Logger(ctx).Error("Read Source", zap.Error(readE))
		return input.WithError(readE), readE
	}
	sourceNode = readR.Node

	if sourceNode.IsLeaf() {
		_, err := c.Client.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: sourceNode})
		if err != nil {
			return input.WithError(err), err
		}
	} else {

		list, e := c.Client.ListNodes(ctx, &tree.ListNodesRequest{Node: sourceNode, Recursive: true})
		if e != nil {
			return input.WithError(e), e
		}
		defer list.Close()
		for {
			resp, e := list.Recv()
			if e != nil {
				break
			}
			if resp.Node.Path == path.Join(sourceNode.Path, common.PYDIO_SYNC_HIDDEN_FILE_META) && c.deleteChildrenOnly {
				// Do not delete first .pydio!
				continue
			}
			log.Logger(ctx).Debug("Deleting node in background", resp.Node.ZapPath())
			statusPath := strings.TrimPrefix(resp.Node.GetPath(), sourceNode.GetPath()+"/")
			if path.Base(statusPath) == common.PYDIO_SYNC_HIDDEN_FILE_META {
				statusPath = path.Dir(statusPath)
			}
			status := "[" + sourceNode.GetUuid() + "]" + strings.Replace(T("Jobs.User.DeletingItem"), "%s", statusPath, -1)
			channels.StatusMsg <- status
			_, er := c.Client.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: resp.Node})
			if er != nil {
				return input.WithError(er), er
			}
		}

	}

	output := input.WithNode(nil)
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Deleted node",
	})

	return output, nil
}
