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
	"fmt"
	"path"

	"github.com/pydio/cells/common/log"

	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	metaActionName = "actions.tree.meta"
)

type MetaAction struct {
	Client        tree.NodeReceiverClient
	MetaNamespace string
	MetaValue     string
}

func (c *MetaAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                metaActionName,
		Label:             "Update Meta",
		Icon:              "tag-multiple",
		Category:          actions.ActionCategoryTree,
		Description:       "Update metadata on files or folders passed in input",
		InputDescription:  "Multiple selection of files or folders",
		OutputDescription: "Updated selection of files or folders",
		SummaryTemplate:   "",
		HasForm:           true,
	}
}

func (c *MetaAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "metaName",
					Type:        "string",
					Label:       "Meta Name",
					Description: "Metadata namespace to update",
					Default:     "",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "metaValue",
					Type:        "string",
					Label:       "Meta Value",
					Description: "Value to apply",
					Default:     "",
					Mandatory:   true,
					Editable:    true,
				},
			},
		},
	}}
}

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
	for _, n := range input.Nodes {
		ns := jobs.EvaluateFieldStr(ctx, input, c.MetaNamespace)
		val := jobs.EvaluateFieldStr(ctx, input, c.MetaValue)
		n.SetMeta(ns, val)
		_, err := c.Client.UpdateNode(ctx, &tree.UpdateNodeRequest{From: n, To: n})
		if err != nil {
			return input.WithError(err), err
		}
		log.TasksLogger(ctx).Info(fmt.Sprintf("Updated metadata %s (value %s) on %s", ns, val, path.Base(n.GetPath())))
	}

	input.AppendOutput(&jobs.ActionOutput{Success: true})

	return input, nil
}
