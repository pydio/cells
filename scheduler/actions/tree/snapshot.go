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
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	snapshotActionName = "actions.tree.snapshot"
)

type SnapshotAction struct {
	Client  views.Handler
	Target  string
	IsLocal string
}

func (c *SnapshotAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                snapshotActionName,
		Label:             "Snapshot",
		Icon:              "file-tree",
		Category:          actions.ActionCategoryTree,
		Description:       "Generate a JSON snapshot of the index, starting at a given path",
		InputDescription:  "Single-selection of root to browse for building the snapshot",
		OutputDescription: "Empty output",
		SummaryTemplate:   "",
		HasForm:           true,
	}
}

func (c *SnapshotAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "target_file",
					Type:        forms.ParamString,
					Label:       "Target File",
					Description: "Full name of the file to write, either on FS or inside a datasource. If not specified, will be written in application temporary directory",
					Default:     "",
					Editable:    true,
				},
				&forms.FormField{
					Name:        "is_fs",
					Type:        forms.ParamBool,
					Label:       "Local FS",
					Description: "If set, target file is expected to be an absolute path on the server",
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}

}

// GetName returns this action unique identifier
func (c *SnapshotAction) GetName() string {
	return snapshotActionName
}

// Init passes parameters to the action
func (c *SnapshotAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {

	c.Client = views.NewStandardRouter(views.RouterOptions{AdminView: true})
	if target, ok := action.Parameters["target_file"]; ok {
		c.Target = target
		if loc, o := action.Parameters["is_local"]; o {
			c.IsLocal = loc
		}
	} else {
		tmpDir := config.ApplicationWorkingDir()
		c.Target = filepath.Join(tmpDir, "snapshot.json")
	}

	return nil
}

// Run the actual action code
func (c *SnapshotAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		err := fmt.Errorf("you must provide at least one node as input")
		return input.WithError(err), err
	}
	isLocal, e := jobs.EvaluateFieldBool(ctx, input, c.IsLocal)
	if e != nil {
		return input.WithError(e), e
	}
	target := jobs.EvaluateFieldStr(ctx, input, c.Target)

	streamer, err := c.Client.ListNodes(ctx, &tree.ListNodesRequest{
		Node:      input.Nodes[0],
		Recursive: true,
	})
	if err != nil {
		return input.WithError(err), err
	}
	defer streamer.Close()

	var nodesList []*tree.Node
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		nodesList = append(nodesList, resp.Node)
	}

	content, _ := json.Marshal(nodesList)
	var writeErr error
	if isLocal {
		if e := os.Remove(target); e != nil {
			return input.WithError(e), e
		}
		writeErr = ioutil.WriteFile(target, content, 0755)
	} else {
		router := views.NewStandardRouter(views.RouterOptions{AdminView: true})
		_, writeErr = router.PutObject(ctx, &tree.Node{Path: target}, bytes.NewBuffer(content), &views.PutRequestData{
			Size: int64(len(content)),
		})
	}
	if writeErr != nil {
		return input.WithError(writeErr), writeErr
	}

	log.TasksLogger(ctx).Info("Tree snapshot written to " + target)
	output := input.WithNode(nil)
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Tree snapshot written to " + target,
	})

	return output, nil
}
