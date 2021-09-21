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
	"fmt"
	"io"
	"path"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	compressActionName = "actions.archive.compress"
)

const (
	zipFormat   = "zip"
	tarFormat   = "tar"
	tarGzFormat = "tar.gz"
)

// CompressAction implements compression. Currently, it supports zip, tar and tar.gz formats.
type CompressAction struct {
	Router     *views.Router
	Format     string
	TargetName string
	Date       string

	filter *jobs.NodesSelector
}

// SetNodeFilterAsWalkFilter declares this action as RecursiveNodeWalkerAction
func (c *CompressAction) SetNodeFilterAsWalkFilter(f *jobs.NodesSelector) {
	c.filter = f
}

func (c *CompressAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                compressActionName,
		Category:          actions.ActionCategoryArchives,
		Label:             "Create Archive",
		Icon:              "package-down",
		Description:       "Create a Zip, Tar or Tar.gz archive from the input",
		InputDescription:  "Selection of node(s). Folders will be recursively walked through.",
		OutputDescription: "One single node pointing to the created archive file.",
		SummaryTemplate:   "",
		HasForm:           true,
	}
}

func (c *CompressAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "format",
					Type:        forms.ParamSelect,
					Label:       "Archive format",
					Description: "The format of the archive",
					Mandatory:   true,
					Editable:    true,
					ChoicePresetList: []map[string]string{
						{zipFormat: "Zip"},
						{tarFormat: "Tar"},
						{tarGzFormat: "TarGz"},
					},
				},
				&forms.FormField{
					Name:        "target",
					Type:        forms.ParamString,
					Label:       "Archive path",
					Description: "FullPath to the new archive",
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "date",
					Type:        forms.ParamBool,
					Label:       "Date",
					Description: "Append date to Archive name",
					Default:     nil,
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
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
	if action.Parameters["date"] == "true" {
		//Format is YYYY-MM-DD
		c.Date = time.Now().Format("2006-01-02")
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
		Router:      c.Router,
		NodesFilter: c.filter, // may be nil
	}

	dir := path.Dir(nodes[0].Path)
	base := "Archive"
	if len(nodes) == 1 {
		base = path.Base(nodes[0].Path)
	}
	if c.TargetName != "" {
		dir, base = path.Split(jobs.EvaluateFieldStr(ctx, input, c.TargetName))
		if c.Date != "" {
			base = strings.Join([]string{base, c.Date}, "-")
		}
		base = strings.TrimRight(base, path.Ext(base))
	}

	// Final check for format
	if c.Format != zipFormat && c.Format != tarFormat && c.Format != tarGzFormat {
		er := fmt.Errorf("unsupported archive format")
		return input.WithError(er), er
	}

	targetFile := computeTargetName(ctx, c.Router, dir, base, c.Format)

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
		log.TasksLogger(ctx).Error("Error PutObject", zap.Error(err))
		return input.WithError(err), err
	}

	logBody, _ := json.Marshal(map[string]interface{}{
		"Written": written,
	})

	log.TasksLogger(ctx).Info(fmt.Sprintf("Archive %s was created in %s", path.Base(targetFile), path.Dir(targetFile)))

	// Reload node
	output := input
	resp, err := c.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: targetFile}})
	if err == nil {
		output = input.WithNode(resp.Node)
		output.AppendOutput(&jobs.ActionOutput{
			Success:  true,
			JsonBody: logBody,
		})
	} else {
		output = input.WithError(err)
	}
	return output, nil
}
