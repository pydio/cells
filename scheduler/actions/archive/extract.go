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
	"path"
	"path/filepath"
	"strings"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/nodes/archive"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/scheduler/actions"
	"github.com/pydio/cells/v5/scheduler/actions/tools"
)

var (
	extractActionName = "actions.archive.extract"
)

type ExtractAction struct {
	tools.ScopedRouterConsumer
	format     string
	targetName string
}

// GetDescription returns action description
func (ex *ExtractAction) GetDescription(_ ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                extractActionName,
		Label:             "Extract Archive",
		Icon:              "archive-search",
		Category:          actions.ActionCategoryArchives,
		Description:       "Extract files and folders from a Zip, Tar or Tar.gz archive",
		SummaryTemplate:   "",
		HasForm:           true,
		InputDescription:  "Single-node selection pointing to an archive to extract",
		OutputDescription: "One node pointing to the parent folder where all files where extracted.",
	}
}

// GetParametersForm returns a UX form
func (ex *ExtractAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "target",
					Type:        forms.ParamString,
					Label:       "Extraction path",
					Description: "FullPath used for extracting contents. If left empty, will extract in the same folder.",
					Default:     "",
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "format",
					Type:        forms.ParamSelect,
					Label:       "Archive format",
					Description: "Compression format of the archive",
					Default:     detectFormat,
					Mandatory:   true,
					Editable:    true,
					ChoicePresetList: []map[string]string{
						{detectFormat: "Detect (from filename)"},
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
func (ex *ExtractAction) GetName() string {
	return extractActionName
}

// Init passes parameters to the action
func (ex *ExtractAction) Init(job *jobs.Job, action *jobs.Action) error {
	if format, ok := action.Parameters["format"]; ok {
		ex.format = format
	}
	if target, ok := action.Parameters["target"]; ok {
		ex.targetName = target
	}
	ex.ParseScope(job.Owner, action.Parameters)
	return nil
}

// Run the actual action code
func (ex *ExtractAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil
	}
	c2, handler, er := ex.GetHandler(ctx)
	if er != nil {
		return input.WithError(er), er
	}
	ctx = c2

	archiveNode := input.Nodes[0]
	ext := filepath.Ext(archiveNode.Path)
	if ext == ".gz" && strings.HasSuffix(archiveNode.Path, ".tar.gz") {
		ext = ".tar.gz"
	}
	if archiveNode.Size == 0 {
		resp, e := handler.ReadNode(ctx, &tree.ReadNodeRequest{Node: archiveNode})
		if e != nil {
			return input.WithError(e), e
		}
		archiveNode = resp.GetNode()
	}

	format := jobs.EvaluateFieldStr(ctx, input, ex.format)
	if format == "" || format == detectFormat {
		format = strings.ToLower(strings.TrimLeft(ext, "."))
		if format != zipFormat && format != tarFormat && format != tarGzFormat {
			e := fmt.Errorf("could not extract format from file extension %s", ext)
			return input.WithError(e), e
		}
	}
	targetName := jobs.EvaluateFieldStr(ctx, input, ex.targetName)
	if targetName == "" {
		base := strings.TrimSuffix(path.Base(archiveNode.Path), ext)
		targetName = computeTargetName(ctx, handler, path.Dir(archiveNode.Path), base)
	}
	targetNode := &tree.Node{Path: targetName, Type: tree.NodeType_COLLECTION}
	_, e := handler.CreateNode(ctx, &tree.CreateNodeRequest{Node: targetNode})
	if e != nil {
		return input.WithError(e), e
	}

	reader := &archive.Reader{
		Router: handler,
	}
	var err error
	switch format {
	case "zip":
		err = reader.ExtractAllZip(ctx, archiveNode, targetNode, channels.StatusMsg)
	case "tar":
		err = reader.ExtractAllTar(ctx, false, archiveNode, targetNode, channels.StatusMsg)
	case "tar.gz":
		err = reader.ExtractAllTar(ctx, true, archiveNode, targetNode, channels.StatusMsg)
	default:
		err = errors.WithMessage(errors.InvalidParameters, "unsupported archive format:"+format)
	}
	if err != nil {
		// Remove failed extraction folder ?
		// ex.Router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: targetNode})
		return input.WithError(err), err
	}

	log.TasksLogger(ctx).Info(fmt.Sprintf("Archive %s was extracted in %s", path.Base(archiveNode.Path), targetNode.GetPath()))
	log.Auditer(ctx).Info(
		fmt.Sprintf("Archive [%s] extracted to [%s]", archiveNode.GetPath(), targetNode.GetPath()),
		log.GetAuditId(common.AuditNodeCreate),
		archiveNode.Zap("archive"),
		targetNode.Zap("target"),
		archiveNode.ZapSize(),
	)

	output := input.WithNode(targetNode)

	return output, nil
}
