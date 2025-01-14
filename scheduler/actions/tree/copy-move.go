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
	"strconv"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
	"github.com/pydio/cells/v5/scheduler/actions"
	"github.com/pydio/cells/v5/scheduler/actions/tools"
	"github.com/pydio/cells/v5/scheduler/lang"
)

var (
	copyMoveActionName = "actions.tree.copymove"
)

type CopyMoveAction struct {
	tools.ScopedRouterConsumer
	move              bool
	targetPlaceholder string
	createFolder      bool
	targetIsParent    bool
}

func (c *CopyMoveAction) GetDescription(_ ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                copyMoveActionName,
		Label:             "Copy/Move",
		Icon:              "file-move",
		Category:          actions.ActionCategoryTree,
		Description:       "Recursively copy or move files or folders passed in input",
		InputDescription:  "Single-selection of a file or a folder to process",
		OutputDescription: "The processed file or folder at its new location",
		SummaryTemplate:   "",
		HasForm:           true,
	}
}

func (c *CopyMoveAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "target",
					Type:        forms.ParamString,
					Label:       "Destination",
					Description: "Where to copy or move original files",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "type",
					Type:        forms.ParamSelect,
					Label:       "Operation Type",
					Description: "Copy or move",
					Mandatory:   true,
					Editable:    true,
					Default:     "copy",
					ChoicePresetList: []map[string]string{
						{"copy": "Copy"},
						{"move": "Move"},
					},
				},
				&forms.FormField{
					Name:        "targetParent",
					Type:        forms.ParamBool,
					Label:       "Destination points to parent folder",
					Description: "If set to true, the files are created inside the target folder, otherwise the destination should point to full path of target",
					Default:     true,
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "create",
					Type:        forms.ParamBool,
					Label:       "Create Destination",
					Description: "Whether to automatically create the destination folder or not",
					Default:     true,
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName returns this action unique identifier
func (c *CopyMoveAction) GetName() string {
	return copyMoveActionName
}

func (c *CopyMoveAction) ProvidesProgress() bool {
	return true
}

// Init passes parameters to the action
func (c *CopyMoveAction) Init(job *jobs.Job, action *jobs.Action) error {

	if action.Parameters == nil {
		return errors.WithMessage(errors.InvalidParameters, "Could not find parameters for CopyMove action")
	}
	var tOk bool
	c.targetPlaceholder, tOk = action.Parameters["target"]
	if !tOk {
		return errors.WithMessage(errors.InvalidParameters, "Could not find parameters for CopyMove action")
	}
	if actionType, ok := action.Parameters["type"]; ok && actionType == "move" {
		c.move = true
	}

	if createParam, ok := action.Parameters["create"]; ok {
		c.createFolder, _ = strconv.ParseBool(createParam)
	}

	if targetParent, ok := action.Parameters["targetParent"]; ok && targetParent == "true" {
		c.targetIsParent = true
	}
	c.ParseScope(job.Owner, action.Parameters)
	return nil
}

// Run the actual action code
func (c *CopyMoveAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}
	sourceNode := input.Nodes[0]
	T := lang.Bundle().T(languages.UserLanguageFromContext(ctx, true))

	targetNode := &tree.Node{
		Path: jobs.EvaluateFieldStr(ctx, input, c.targetPlaceholder),
	}
	if c.targetIsParent {
		targetNode.Path = path.Join(targetNode.Path, path.Base(sourceNode.Path))
	}
	targetNode.Path = strings.ReplaceAll(targetNode.Path, "//", "/")

	log.Logger(ctx).Debug("Copy/Move target path is", targetNode.ZapPath(), zap.Bool("targetIsParent", c.targetIsParent))

	// Load correct client
	c2, cli, e := c.GetHandler(ctx)
	if e != nil {
		return input.WithError(e), e
	}
	ctx = c2

	readR, readE := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: sourceNode})
	if readE != nil {
		log.Logger(ctx).Error("Read Source", zap.Error(readE))
		return input.WithError(readE), readE
	}
	sourceNode = readR.Node

	// Handle already existing - Feed with parent folder children locks
	var childrenLocks []string
	if parentResp, er := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Dir(targetNode.Path)}}); er == nil && !nodes.IsUnitTestEnv {
		if cl, err := permissions.GetChildrenLocks(ctx, parentResp.GetNode()); err != nil {
			return input.WithError(err), nil
		} else {
			childrenLocks = append(childrenLocks, cl...)
		}
	}
	if er := nodes.SuffixPathIfNecessary(ctx, cli, targetNode, !sourceNode.IsLeaf(), childrenLocks...); er != nil {
		return input.WithError(er), er
	}

	output := input.Clone()

	if e := nodes.CopyMoveNodes(ctx, cli, sourceNode, targetNode, c.move, true, channels.StatusMsg, channels.Progress, T); e != nil {
		output = output.WithError(e)
		return output, e
	}

	if c.move && path.Dir(sourceNode.GetPath()) == path.Dir(targetNode.GetPath()) {
		log.TasksLogger(ctx).Info(fmt.Sprintf("Successfully renamed %s to %s", sourceNode.GetPath(), targetNode.GetPath()))
		log.Auditer(ctx).Info(
			fmt.Sprintf("Renamed [%s] to [%s]", sourceNode.GetPath(), targetNode.GetPath()),
			log.GetAuditId(common.AuditNodeUpdatePath),
			sourceNode.Zap("source"),
			targetNode.Zap("target"),
		)
	} else if c.move {
		log.TasksLogger(ctx).Info(fmt.Sprintf("Successfully moved %s to %s", sourceNode.GetPath(), targetNode.GetPath()))
		log.Auditer(ctx).Info(
			fmt.Sprintf("Moved [%s] to [%s]", sourceNode.GetPath(), targetNode.GetPath()),
			log.GetAuditId(common.AuditNodeUpdatePath),
			sourceNode.Zap("source"),
			targetNode.Zap("target"),
		)
	} else {
		log.TasksLogger(ctx).Info(fmt.Sprintf("Successfully copied %s to %s", sourceNode.GetPath(), targetNode.GetPath()))
		log.Auditer(ctx).Info(
			fmt.Sprintf("Copied [%s] to [%s]", sourceNode.GetPath(), targetNode.GetPath()),
			log.GetAuditId(common.AuditNodeCreate),
			sourceNode.Zap("source"),
			targetNode.Zap("target"),
			sourceNode.ZapSize(),
		)
	}
	output = output.WithNode(targetNode)
	output.AppendOutput(&jobs.ActionOutput{
		Success: true,
	})
	return output, nil

}
