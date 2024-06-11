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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var (
	metaActionName = "actions.tree.meta"
)

type MetaAction struct {
	common.RuntimeHolder
	Client   tree.NodeReceiverClient
	MetaJSON string
}

func (c *MetaAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                metaActionName,
		Label:             "Internal Metadata",
		Icon:              "file-cog",
		Category:          actions.ActionCategoryTree,
		Description:       "Update internal metadata on files or folders passed in input",
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
					Name:        "metaJSON",
					Type:        forms.ParamTextarea,
					Label:       "Metadata keys/values",
					Description: `Metadata to be appended to incoming node, using JSON, e.g. {"key":"value"}. Leave empty to just save input node meta.`,
					Default:     "{}",
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
func (c *MetaAction) Init(job *jobs.Job, action *jobs.Action) error {

	if !nodes.IsUnitTestEnv {
		c.Client = tree.NewNodeReceiverClient(grpc.ResolveConn(c.GetRuntimeContext(), common.ServiceMeta))
	}
	c.MetaJSON = action.Parameters["metaJSON"]

	return nil
}

// Run the actual action code
func (c *MetaAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}

	// Update Metadata
	ms := jobs.EvaluateFieldStr(ctx, input, c.MetaJSON)
	var mm map[string]interface{}
	if e := json.Unmarshal([]byte(ms), &mm); e != nil {
		return input.WithError(e), e
	}
	for _, n := range input.Nodes {
		for k, v := range mm {
			n.MustSetMeta(k, v)
		}
		_, err := c.Client.UpdateNode(ctx, &tree.UpdateNodeRequest{From: n, To: n})
		if err != nil {
			return input.WithError(err), err
		}
		if len(mm) > 0 {
			log.TasksLogger(ctx).Info(fmt.Sprintf("Updated %s with meta %s and stored", path.Base(n.GetPath()), ms))
		} else {
			log.TasksLogger(ctx).Info(fmt.Sprintf("Stored node metadata for %s", path.Base(n.GetPath())))
		}
	}

	output := input.WithOutput(&jobs.ActionOutput{Success: true})

	return output, nil
}
