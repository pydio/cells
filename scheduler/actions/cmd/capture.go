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

package cmd

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"path"
	"path/filepath"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/data/source/sync/clients"
	"github.com/pydio/cells/v5/scheduler/actions"
)

var (
	captureActionName = "actions.cmd.capture"
)

type CaptureAction struct {
	common.RuntimeHolder
	target string
	prefix string
	format string
	sides  string
}

// GetDescription returns action description
func (c *CaptureAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              captureActionName,
		Label:           "Capture Datasource",
		Category:        actions.ActionCategoryCmd,
		Icon:            "archive-lock",
		Description:     "Capture datasource index/s3 into JSON or BoltDB for debugging purpose. Warning, this action expects a unique item to be passed in Input.DataSources (use a selector).",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

// GetParametersForm returns a UX form
func (c *CaptureAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "target",
					Type:        forms.ParamString,
					Label:       "Target Folder",
					Description: "Target path where to store the generated snapshot files.",
					Default:     "",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "prefix",
					Type:        forms.ParamString,
					Label:       "File name prefix",
					Description: "Prefix for the snapshots. Resulting name is prefix-dsName-source.format",
					Default:     "snapshot-",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "format",
					Type:        forms.ParamSelect,
					Label:       "Format",
					Description: "Output format, either JSON or BoltDB.",
					Default:     "json",
					Mandatory:   false,
					Editable:    true,
					ChoicePresetList: []map[string]string{
						{"json": "JSON"},
						{"bolt": "BoltDB"},
					},
				},
				&forms.FormField{
					Name:        "sides",
					Type:        forms.ParamSelect,
					Label:       "Capture source/target endpoints",
					Description: "Capture both sides or only of them.",
					Default:     "both",
					Mandatory:   false,
					Editable:    true,
					ChoicePresetList: []map[string]string{
						{"both": "S3 and Index"},
						{"s3": "S3 only"},
						{"index": "Index only"},
					},
				},
			},
		},
	}}
}

// GetName provides unique identifier
func (c *CaptureAction) GetName() string {
	return captureActionName
}

// Init passes parameters
func (c *CaptureAction) Init(job *jobs.Job, action *jobs.Action) error {
	c.target = action.Parameters["target"]
	if c.target == "" {
		return errors.WithMessage(errors.InvalidParameters, "Missing parameter target for Capture Action")
	}
	if format, ok := action.Parameters["format"]; ok {
		c.format = format
	} else {
		c.format = "json"
	}
	if prefix, ok := action.Parameters["prefix"]; ok {
		c.prefix = prefix
	} else {
		c.prefix = "snapshot"
	}
	if sides, ok := action.Parameters["sides"]; ok {
		c.sides = sides
	} else {
		c.sides = "both"
	}
	return nil
}

// Run perform actual action code
func (c *CaptureAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	dd := input.GetDataSources()
	if len(dd) == 0 {
		er := fmt.Errorf("action expects at list one item in Input.DataSources")
		return input.WithError(er), er
	}
	dsName := dd[0].Name

	targetFolder := jobs.EvaluateFieldStr(ctx, input, c.target)
	format := jobs.EvaluateFieldStr(ctx, input, c.format)
	prefix := jobs.EvaluateFieldStr(ctx, input, c.prefix)
	sides := jobs.EvaluateFieldStr(ctx, input, c.sides)

	var syncConfig *object.DataSource
	if err := config.Get(ctx, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+dsName).Scan(&syncConfig); err != nil {
		return input.WithError(err), err
	}
	if sec := config.GetSecret(ctx, syncConfig.ApiSecret).String(); sec != "" {
		syncConfig.ApiSecret = sec
	}
	conn := grpc.ResolveConn(ctx, common.ServiceDataIndexGRPC_+dsName)
	cRead := tree.NewNodeProviderClient(conn)
	cWrite := tree.NewNodeReceiverClient(conn)
	cSess := tree.NewSessionIndexerClient(conn)
	source, target, _, err := clients.InitEndpoints(ctx, syncConfig, cRead, cWrite, cSess)
	if err != nil {
		return input.WithError(err), err
	}
	tl := log.TasksLogger(ctx)
	tl.Info("Endpoints Loaded", zap.String("Source", source.GetEndpointInfo().URI), zap.String("Target", target.GetEndpointInfo().URI))

	infoLogger := func(msg string, ff ...zap.Field) {
		channels.StatusMsg <- msg
		tl.Info(msg, ff...)
	}

	sourceAsSource, _ := model.AsPathSyncSource(source)
	sourceAsSource = &sourceProgressWrapper{PathSyncSource: sourceAsSource, sName: "s3", logger: infoLogger}

	targetAsSource, _ := model.AsPathSyncSource(target)
	targetAsSource = &sourceProgressWrapper{PathSyncSource: targetAsSource, sName: "index", logger: infoLogger}

	router := compose.PathClientAdmin(ctx)

	if format == "json" {

		if sides == "both" || sides == "s3" {
			infoLogger("[s3] Capturing s3 to JSON")
			if bb, e := c.walkSourceToJSON(ctx, sourceAsSource); e != nil {
				return input.WithError(e), e
			} else if er := c.bytesToNode(ctx, bb, path.Join(targetFolder, prefix+dsName+"-source.json"), router); er != nil {
				return input.WithError(er), er
			}
			infoLogger(fmt.Sprintf("[s3] Captured %d items to JSON\n\n", (sourceAsSource.(*sourceProgressWrapper)).i))

		}

		if sides == "both" || sides == "index" {
			infoLogger("[index] Capturing index to JSON")
			if bb, e := c.walkSourceToJSON(ctx, targetAsSource); e != nil {
				return input.WithError(e), e
			} else if er := c.bytesToNode(ctx, bb, path.Join(targetFolder, prefix+dsName+"-target.json"), router); er != nil {
				return input.WithError(er), er
			}
			infoLogger(fmt.Sprintf("[s3] Captured %d items to JSON\n\n", (sourceAsSource.(*sourceProgressWrapper)).i))
		}

	} else {
		boltTmpFolder, _ := os.MkdirTemp("", "*")

		if sides == "both" || sides == "s3" {
			infoLogger("[s3] Capturing s3 to Bolt")
			sb, e := snapshot.NewBoltSnapshot(boltTmpFolder, dsName+"-source.db")
			if e != nil {
				return input.WithError(e), e
			}
			if e := sb.Capture(ctx, sourceAsSource); e != nil {
				sb.Close()
				return input.WithError(e), e
			}
			sb.Close()
			if er := c.boltToNode(ctx, filepath.Join(boltTmpFolder, "snapshot-"+dsName+"-source.db"), path.Join(targetFolder, prefix+dsName+"-source.db"), router); er != nil {
				return input.WithError(er), er
			}
			infoLogger(fmt.Sprintf("[s3] Captured %d items to BoltDB\n\n", (sourceAsSource.(*sourceProgressWrapper)).i))
		}

		if sides == "both" || sides == "index" {
			infoLogger("[index] Capturing index to Bolt")
			tb, e := snapshot.NewBoltSnapshot(boltTmpFolder, dsName+"-target.db")
			if e != nil {
				return input.WithError(e), e
			}
			if e := tb.Capture(ctx, targetAsSource); e != nil {
				tb.Close()
				return input.WithError(e), e
			}
			tb.Close()
			if er := c.boltToNode(ctx, filepath.Join(boltTmpFolder, "snapshot-"+dsName+"-target.db"), path.Join(targetFolder, prefix+dsName+"-target.db"), router); er != nil {
				return input.WithError(er), er
			}
			infoLogger(fmt.Sprintf("[index] Captured %d items to BoltDB\n\n", (sourceAsSource.(*sourceProgressWrapper)).i))
		}

	}

	output := input.Clone()
	output.AppendOutput(&jobs.ActionOutput{
		Success: true,
	})
	return output, nil
}

func (c *CaptureAction) bytesToNode(ctx context.Context, bb []byte, nPath string, router nodes.Handler) error {
	_, er := router.PutObject(ctx, &tree.Node{Path: nPath}, bytes.NewBuffer(bb), &models.PutRequestData{Size: int64(len(bb))})
	return er
}

func (c *CaptureAction) boltToNode(ctx context.Context, boltName, nPath string, router nodes.Handler) error {
	f, er := os.Open(boltName)
	if er != nil {
		return er
	}
	defer f.Close()
	fi, _ := f.Stat()
	_, er = router.PutObject(ctx, &tree.Node{Path: nPath}, f, &models.PutRequestData{Size: fi.Size()})
	return er
}

type sourceProgressWrapper struct {
	model.PathSyncSource
	i      uint32
	sName  string
	logger func(string, ...zap.Field)
}

func (s *sourceProgressWrapper) Walk(ctx context.Context, walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	wrapper := func(path string, node tree.N, err error) error {
		s.i++
		if s.i%1000 == 0 {
			s.logger(fmt.Sprintf("[%s] Analyzed %d items\n", s.sName, s.i))
		}
		return walknFc(path, node, err)
	}
	return s.PathSyncSource.Walk(ctx, wrapper, root, recursive)
}

func (c *CaptureAction) walkSourceToJSON(ctx context.Context, source model.PathSyncSource) ([]byte, error) {

	db := memory.NewMemDB()
	if er := source.Walk(ctx, func(path string, node tree.N, err error) error {
		return db.CreateNode(ctx, node, false)
	}, "/", true); er != nil {
		return nil, er
	}

	return db.ToJSONBytes()

}
