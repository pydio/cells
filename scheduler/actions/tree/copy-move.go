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

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
	"github.com/pydio/cells/scheduler/lang"
)

var (
	copyMoveActionName = "actions.tree.copymove"
)

type CopyMoveAction struct {
	Client            views.Handler
	Move              bool
	Copy              bool
	Recursive         bool
	TargetPlaceholder string
	CreateFolder      bool
	TargetIsParent    bool
}

func (c *CopyMoveAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                copyMoveActionName,
		Label:             "Copy/Move",
		Icon:              "folder-move",
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
					Name:        "type",
					Type:        "select",
					Label:       "Operation Type",
					Description: "Copy or move",
					Mandatory:   true,
					Editable:    true,
					ChoicePresetList: []map[string]string{
						{"copy": "Copy"},
						{"move": "Move"},
					},
				},
				&forms.FormField{
					Name:        "recursive",
					Type:        "boolean",
					Label:       "Recursive",
					Description: "Apply recursively on folders",
					Default:     true,
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "target",
					Type:        "string",
					Label:       "Destination",
					Description: "Where to copy or move original files",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "targetParent",
					Type:        "boolean",
					Label:       "Parent Folder",
					Description: "If set to true, the files are created inside the target folder, otherwise the destination should point to full path of target",
					Default:     true,
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "create",
					Type:        "boolean",
					Label:       "Create",
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
func (c *CopyMoveAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {

	if c.Client == nil {
		c.Client = views.NewStandardRouter(views.RouterOptions{AdminView: true})
	}

	if action.Parameters == nil {
		return errors.InternalServerError(common.SERVICE_JOBS, "Could not find parameters for CopyMove action")
	}
	var tOk bool
	c.TargetPlaceholder, tOk = action.Parameters["target"]
	if !tOk {
		return errors.InternalServerError(common.SERVICE_JOBS, "Could not find parameters for CopyMove action")
	}
	c.Move = false
	if actionType, ok := action.Parameters["type"]; ok && actionType == "move" {
		c.Move = true
	}
	c.Copy = !c.Move

	if createParam, ok := action.Parameters["create"]; ok {
		c.CreateFolder, _ = strconv.ParseBool(createParam)
	}

	if targetParent, ok := action.Parameters["targetParent"]; ok && targetParent == "true" {
		c.TargetIsParent = true
	}

	if recurseParam, ok := action.Parameters["recursive"]; ok {
		c.Recursive, _ = strconv.ParseBool(recurseParam)
	}

	return nil
}

// Run the actual action code
func (c *CopyMoveAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}
	sourceNode := input.Nodes[0]
	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguageFromContext(ctx, config.Default(), true))

	targetNode := &tree.Node{
		Path: jobs.EvaluateFieldStr(ctx, input, c.TargetPlaceholder),
	}
	if c.TargetIsParent {
		targetNode.Path = path.Join(targetNode.Path, path.Base(sourceNode.Path))
	}

	log.Logger(ctx).Debug("Copy/Move target path is", targetNode.ZapPath(), zap.Bool("targetIsParent", c.TargetIsParent))

	// Do not copy on itself, ignore - NO : suffixPathWillDoTheJob
	//if targetNode.Path == input.Nodes[0].Path {
	//	return input, nil
	//}

	// Handle already existing
	c.suffixPathIfNecessary(ctx, targetNode)

	readR, readE := c.Client.ReadNode(ctx, &tree.ReadNodeRequest{Node: sourceNode})
	if readE != nil {
		log.Logger(ctx).Error("Read Source", zap.Error(readE))
		return input.WithError(readE), readE
	}
	sourceNode = readR.Node
	output := input

	e := views.CopyMoveNodes(ctx, c.Client, sourceNode, targetNode, c.Move, c.Recursive, true, channels.StatusMsg, channels.Progress, T)
	if e != nil {
		output = output.WithError(e)
		return output, e
	} else {
		if c.Move {
			log.TasksLogger(ctx).Info(fmt.Sprintf("Successfully moved %s to %s", sourceNode.GetPath(), targetNode.GetPath()))
		} else {
			log.TasksLogger(ctx).Info(fmt.Sprintf("Successfully copied %s to %s", sourceNode.GetPath(), targetNode.GetPath()))
		}
		output = output.WithNode(targetNode)
		output.AppendOutput(&jobs.ActionOutput{
			Success: true,
		})
		return output, nil
	}

}

func (c *CopyMoveAction) suffixPathIfNecessary(ctx context.Context, targetNode *tree.Node) {
	compares := make(map[string]struct{})
	listReq := &tree.ListNodesRequest{Node: &tree.Node{Path: path.Dir(targetNode.Path)}, Recursive: false}
	c.Client.ListNodesWithCallback(ctx, listReq, func(ctx context.Context, node *tree.Node, err error) error {
		basename := strings.ToLower(path.Base(node.Path))
		compares[basename] = struct{}{}
		return nil
	}, true)
	exists := func(node *tree.Node) bool {
		_, ok := compares[strings.ToLower(path.Base(node.Path))]
		return ok
	}
	i := 1
	ext := path.Ext(targetNode.Path)
	noExt := strings.TrimSuffix(targetNode.Path, ext)
	for {
		if exists(targetNode) {
			targetNode.Path = fmt.Sprintf("%s-%d%s", noExt, i, ext)
			targetNode.SetMeta("name", path.Base(targetNode.Path))
			i++
		} else {
			break
		}
	}
}
