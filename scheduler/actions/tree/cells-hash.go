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
	"encoding/hex"
	"io"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/hasher"
	"github.com/pydio/cells/v4/common/utils/hasher/simd"
	"github.com/pydio/cells/v4/scheduler/actions"
	"github.com/pydio/cells/v4/scheduler/actions/tools"
)

var (
	cellsHashActionName = "actions.tree.cells-hash"
)

type CellsHashAction struct {
	tools.ScopedRouterConsumer
	forceRecompute string
}

func (c *CellsHashAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                cellsHashActionName,
		Label:             "Compute Hash",
		Icon:              "pound-box",
		Category:          actions.ActionCategoryTree,
		Description:       "Compute file signature using Cells internal algorithm",
		InputDescription:  "Multiple selection of files",
		OutputDescription: "Updated selection of files",
		SummaryTemplate:   "",
		HasForm:           true,
	}
}

func (c *CellsHashAction) GetParametersForm() *forms.Form {
	return &forms.Form{
		Groups: []*forms.Group{
			{
				Fields: []forms.Field{
					&forms.FormField{
						Name:        "forceRecompute",
						Type:        forms.ParamBool,
						Label:       "Force Recompute",
						Description: "Recompute X-Cells-Hash even if it already exists",
						Default:     false,
						Mandatory:   false,
					},
				},
			},
		},
	}
}

// GetName returns this action unique identifier
func (c *CellsHashAction) GetName() string {
	return cellsHashActionName
}

// Init passes parameters to the action
func (c *CellsHashAction) Init(job *jobs.Job, action *jobs.Action) error {
	if b, o := action.Parameters["forceRecompute"]; o {
		c.forceRecompute = b
	}
	return nil
}

// Run the actual action code
func (c *CellsHashAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}

	forceRecompute, _ := jobs.EvaluateFieldBool(ctx, input, c.forceRecompute)

	ct, cli, e := c.GetHandler(ctx)
	if e != nil {
		return input.WithError(e), e
	}
	ctx = ct
	mc := tree.NewNodeReceiverClient(grpc.GetClientConnFromCtx(c.GetRuntimeContext(), common.ServiceMeta))
	var outnodes []*tree.Node
	for _, node := range input.Nodes {
		if node.Etag == "" {
			// Reload node if necessary
			resp, er := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if er != nil {
				return input.WithError(er), er
			}
			node = resp.GetNode()
		}
		if !forceRecompute && node.GetStringMeta(common.MetaNamespaceHash) != "" {
			// Meta already exists, do not recompute
			continue
		}
		rc, er := cli.GetObject(ctx, node, &models.GetRequestData{Length: node.GetSize()})
		if er != nil {
			return input.WithError(er), er
		}
		bh := hasher.NewBlockHash(simd.MD5(), hasher.DefaultBlockSize)
		if _, er := io.Copy(bh, rc); er != nil {
			rc.Close()
			return input.WithError(er), er
		}
		rc.Close()
		hash := hex.EncodeToString(bh.Sum(nil))
		n := node.Clone()
		n.MetaStore = make(map[string]string)
		n.MustSetMeta(common.MetaNamespaceHash, hash)
		if _, er = mc.UpdateNode(ctx, &tree.UpdateNodeRequest{From: n, To: n}); er != nil {
			return input.WithError(er), er
		} else {
			log.TasksLogger(ctx).Info("Computed hash for " + n.GetPath() + ": " + hash)
		}
		node.MustSetMeta(common.MetaNamespaceHash, hash)
		outnodes = append(outnodes, node)
	}

	// Reset
	input = input.WithNode(nil)
	// Replace
	input = input.WithNodes(outnodes...)

	input.AppendOutput(&jobs.ActionOutput{Success: true})

	return input, nil
}
