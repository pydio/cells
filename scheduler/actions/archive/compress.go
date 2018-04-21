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

package archive

import (
	"context"
	"encoding/json"
	"io"
	"path/filepath"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	compressActionName = "actions.archive.compress"
)

// CompressAction implements compression. Currently, it supports zip, tar and tar.gz formats.
type CompressAction struct {
	Router     *views.Router
	Format     string
	TargetName string
}

// GetName returns this action unique identifier
func (c *CompressAction) GetName() string {
	return compressActionName
}

// Init passes parameters to the action
func (c *CompressAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	c.Router = views.NewStandardRouter(views.RouterOptions{AdminView: true})
	if format, ok := action.Parameters["format"]; ok {
		c.Format = format
	} else {
		c.Format = "zip"
	}
	if target, ok := action.Parameters["target"]; ok {
		c.TargetName = target
	}
	return nil
}

// Run the actual action code
func (c *CompressAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil
	}
	nodes := input.Nodes
	log.Logger(ctx).Debug("Compress to : " + c.Format)

	// Assume Target is root node sibling
	compressor := &views.ArchiveWriter{
		Router: c.Router,
	}
	if c.TargetName == "" {

	}

	base := "Archive"
	if len(nodes) == 1 {
		base = filepath.Base(nodes[0].Path)
	}
	targetFile := computeTargetName(ctx, c.Router, filepath.Dir(nodes[0].Path), base, c.Format)

	reader, writer := io.Pipe()

	var written int64
	var err error

	go func() {
		defer writer.Close()
		if c.Format == "zip" {
			written, err = compressor.ZipSelection(ctx, writer, input.Nodes, channels.StatusMsg)
		} else if c.Format == "tar" {
			written, err = compressor.TarSelection(ctx, writer, false, input.Nodes, channels.StatusMsg)
		} else if c.Format == "tar.gz" {
			written, err = compressor.TarSelection(ctx, writer, true, input.Nodes, channels.StatusMsg)
		}
	}()

	c.Router.PutObject(ctx, &tree.Node{Path: targetFile}, reader, &views.PutRequestData{Size: -1})

	if err != nil {
		log.Logger(ctx).Error("Error PutObject", zap.Error(err))
		return input.WithError(err), err
	}

	logBody, _ := json.Marshal(map[string]interface{}{
		"Written": written,
	})

	// Reload node
	resp, err := c.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: targetFile}})
	if err == nil {
		input = input.WithNode(resp.Node)
		input.AppendOutput(&jobs.ActionOutput{
			Success:  true,
			JsonBody: logBody,
		})
	} else {
		input = input.WithError(err)
	}
	return input, nil

}
