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
	"encoding/json"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/scheduler/actions"
	"github.com/pydio/cells/v5/scheduler/tasks"
)

var (
	middlewareMetaActionName = tasks.MiddlewareActionPrefix + "tree.meta"
)

type middlewareMetaAction struct {
	common.RuntimeHolder
	MetaJSON string
}

func (c *middlewareMetaAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                middlewareMetaActionName,
		Label:             "Middleware Metadata",
		Icon:              "file-cog",
		Category:          actions.ActionCategoryTree,
		Description:       "Synchronously set internal metadata on incoming resources (special)",
		InputDescription:  "Multiple selection of files or folders",
		OutputDescription: "Updated selection of files or folders",
		SummaryTemplate:   "",
		HasForm:           true,
	}
}

func (c *middlewareMetaAction) GetParametersForm() *forms.Form {
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
func (c *middlewareMetaAction) GetName() string {
	return middlewareMetaActionName
}

// Init passes parameters to the action
func (c *middlewareMetaAction) Init(job *jobs.Job, action *jobs.Action) error {

	c.MetaJSON = action.Parameters["metaJSON"]

	return nil
}

// HandleIncomingNode makes this action an IncomingMiddlewareAction
func (c *middlewareMetaAction) HandleIncomingNode(ctx context.Context, input *tree.Node) (context.Context, *tree.Node, map[string]interface{}, error) {
	log.Logger(ctx).Info("Handling MiddlewareMetaAction", zap.Any("input", input))

	//	ms := jobs.EvaluateFieldStr(ctx, input, c.MetaJSON)
	var mm map[string]interface{}
	if e := json.Unmarshal([]byte(c.MetaJSON), &mm); e != nil {
		return ctx, input, nil, e
	}
	return ctx, input, mm, nil
}

// Run does nothing, this action is used in middleware context
func (c *middlewareMetaAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {
	return input, nil
}
