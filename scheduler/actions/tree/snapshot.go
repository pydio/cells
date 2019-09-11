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
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"

	"context"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

type SnapshotAction struct {
	Client views.Handler
	Target string
}

var (
	snapshotActionName = "actions.tree.snapshot"
)

// GetName returns this action unique identifier
func (c *SnapshotAction) GetName() string {
	return snapshotActionName
}

// Init passes parameters to the action
func (c *SnapshotAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {

	c.Client = views.NewStandardRouter(views.RouterOptions{AdminView: true})
	if target, ok := action.Parameters["target_file"]; ok {
		c.Target = target
	} else {
		tmpDir := config.ApplicationWorkingDir()
		c.Target = filepath.Join(tmpDir, "snapshot.json")
	}

	return nil
}

// Run the actual action code
func (c *SnapshotAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	streamer, err := c.Client.ListNodes(ctx, &tree.ListNodesRequest{
		Node:      &tree.Node{Path: "miniods1"},
		Recursive: true,
	})
	if err != nil {
		return input.WithError(err), err
	}
	defer streamer.Close()

	nodesList := []*tree.Node{}
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
	os.Remove(c.Target)
	writeErr := ioutil.WriteFile(c.Target, []byte(content), 0755)
	if writeErr != nil {
		return input.WithError(writeErr), writeErr
	}

	log.Logger(ctx).Info("Tree snapshot written to " + c.Target)
	output := input.WithNode(nil)
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Tree snapshot written to " + c.Target,
	})

	return output, nil
}
