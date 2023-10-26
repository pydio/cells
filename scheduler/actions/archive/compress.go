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
	"fmt"
	"io"
	"path"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/archive"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
	"github.com/pydio/cells/v4/scheduler/actions/tools"
)

var (
	compressActionName = "actions.archive.compress"
)

const (
	detectFormat = "detect"
	zipFormat    = "zip"
	tarFormat    = "tar"
	tarGzFormat  = "tar.gz"
)

// CompressAction implements compression. Currently, it supports zip, tar and tar.gz formats.
type CompressAction struct {
	tools.ScopedRouterConsumer
	Format     string
	TargetName string

	filter *jobs.NodesSelector
}

// SetNodeFilterAsWalkFilter declares this action as RecursiveNodeWalkerAction
func (c *CompressAction) SetNodeFilterAsWalkFilter(f *jobs.NodesSelector) {
	c.filter = f
}

// GetDescription returns action description
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

// GetParametersForm returns a UX form
func (c *CompressAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "target",
					Type:        forms.ParamString,
					Label:       "Archive path",
					Description: "FullPath to the new archive",
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "format",
					Type:        forms.ParamSelect,
					Label:       "Archive format",
					Description: "Compression format of the archive",
					Mandatory:   true,
					Editable:    true,
					Default:     detectFormat,
					ChoicePresetList: []map[string]string{
						{detectFormat: "Detect (file extension)"},
						{zipFormat: "Zip"},
						{tarFormat: "Tar"},
						{tarGzFormat: "TarGz"},
					},
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
func (c *CompressAction) Init(job *jobs.Job, action *jobs.Action) error {
	if format, ok := action.Parameters["format"]; ok {
		c.Format = format
	} else {
		c.Format = "zip"
	}
	if target, ok := action.Parameters["target"]; ok {
		c.TargetName = target
	}
	c.ParseScope(job.Owner, action.Parameters)
	return nil
}

// Run the actual action code
func (c *CompressAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil
	}
	nn := input.Nodes
	log.Logger(ctx).Debug("Compress to : " + c.Format)

	c2, handler, e := c.GetHandler(ctx)
	if e != nil {
		return input.WithError(e), e
	}
	ctx = c2
	// Assume Target is root node sibling
	compressor := &archive.Writer{
		Router: handler,
	}
	if c.filter != nil {
		compressor.WalkFilter = func(ctx context.Context, node *tree.Node) bool {
			in := (&jobs.ActionMessage{}).WithNode(node)
			_, _, pass := c.filter.Filter(ctx, in)
			return pass
		}
	}

	dir := path.Dir(nn[0].Path)
	base := "Archive"
	if len(nn) == 1 {
		base = path.Base(nn[0].Path)
	}
	if c.TargetName != "" {
		dir, base = path.Split(jobs.EvaluateFieldStr(ctx, input, c.TargetName))
	}
	format := jobs.EvaluateFieldStr(ctx, input, c.Format)
	if format == detectFormat {
		switch strings.ToLower(path.Ext(base)) {
		case ".zip":
			format = zipFormat
		case ".tar":
			format = tarFormat
		case ".tar.gz":
			format = tarGzFormat
		default:
			e := fmt.Errorf("could not detect archive format from file name " + base)
			return input.WithError(e), e
		}
	}
	// Final check for format
	if format != zipFormat && format != tarFormat && format != tarGzFormat {
		er := fmt.Errorf("unsupported archive format")
		return input.WithError(er), er
	}
	// Remove extension
	base = strings.TrimSuffix(base, "."+format)
	targetFile := computeTargetName(ctx, handler, dir, base, format)

	reader, writer := io.Pipe()

	var written int64
	var err error

	go func() {
		defer writer.Close()
		switch format {
		case "zip":
			written, err = compressor.ZipSelection(ctx, writer, input.Nodes, channels.StatusMsg)
		case "tar":
			written, err = compressor.TarSelection(ctx, writer, false, input.Nodes, channels.StatusMsg)
		case "tar.gz":
			written, err = compressor.TarSelection(ctx, writer, true, input.Nodes, channels.StatusMsg)
		}
	}()

	_, err2 := handler.PutObject(ctx, &tree.Node{Path: targetFile}, reader, &models.PutRequestData{Size: -1})

	if err != nil {
		log.TasksLogger(ctx).Error("Error PutObject", zap.Error(err))
		return input.WithError(err), err
	}
	if err2 != nil {
		log.TasksLogger(ctx).Error("Error PutObject", zap.Error(err2))
		return input.WithError(err2), err2
	}

	logBody, _ := json.Marshal(map[string]interface{}{
		"Written": written,
	})

	log.TasksLogger(ctx).Info(fmt.Sprintf("Archive %s was created in %s", path.Base(targetFile), path.Dir(targetFile)))
	var pp []string
	for _, n := range nn {
		pp = append(pp, n.GetPath())
	}
	log.Auditer(ctx).Info(
		fmt.Sprintf("Archive [%s] created from [%s]", targetFile, strings.Join(pp, ",")),
		log.GetAuditId(common.AuditNodeCreate),
		zap.String("archive", targetFile),
		zap.Strings("sources", pp),
		zap.Int64(common.KeyTransferSize, written),
	)

	// Reload node
	output := input
	resp, err := handler.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: targetFile}})
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
