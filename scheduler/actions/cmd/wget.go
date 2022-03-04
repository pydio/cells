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
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var (
	wgetActionName = "actions.cmd.wget"
)

// WGetAction performs a wget command with the provided URL
type WGetAction struct {
	common.RuntimeHolder
	Router     nodes.Client
	SourceUrl  string
	targetPath string
}

// GetDescription returns action description
func (w *WGetAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              wgetActionName,
		Category:        actions.ActionCategoryPutGet,
		Label:           "Http Get",
		Icon:            "download",
		Description:     "Download a remote file or binary, equivalent to wget command",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

// GetParametersForm returns a UX form
func (w *WGetAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "url",
					Type:        forms.ParamString,
					Label:       "url",
					Description: "Source URL to download from",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "targetPath",
					Type:        forms.ParamString,
					Label:       "targetPath",
					Description: "TargetPath to download in",
					Mandatory:   true,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName returns the unique identifier of this action
func (w *WGetAction) GetName() string {
	return wgetActionName
}

// Init passes parameters
func (w *WGetAction) Init(job *jobs.Job, action *jobs.Action) error {
	if action.Parameters["targetPath"] != "" {
		w.targetPath = action.Parameters["targetPath"]
	}
	if urlParam, ok := action.Parameters["url"]; ok {
		w.SourceUrl = urlParam
	} else {
		return errors.BadRequest(common.ServiceTasks, "missing parameter url in Action")
	}
	w.Router = compose.PathClientAdmin(w.GetRuntimeContext())
	return nil
}

// Run the actual action code
func (w *WGetAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	var e error
	sourceUrl, e := url.Parse(jobs.EvaluateFieldStr(ctx, input, w.SourceUrl))
	if e != nil {
		return input.WithError(e), e
	}

	var targetNode *tree.Node
	targetNode = new(tree.Node)
	if w.targetPath != "" {
		basename := path.Base(sourceUrl.Path)
		targetNode.Path = path.Join(jobs.EvaluateFieldStr(ctx, input, w.targetPath), basename)
	} else {
		targetNode = input.Nodes[0]
	}

	cli := http.DefaultClient
	if targetNode.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder) != "" {
		// This is a unit test, skipVerify
		transCfg := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired SSL certificates
		}
		cli = &http.Client{Transport: transCfg}
	}
	log.TasksLogger(ctx).Info(fmt.Sprintf("Downloading file to %s from URL %s", targetNode.GetPath(), sourceUrl.String()))
	httpResponse, err := cli.Get(sourceUrl.String())
	if err != nil {
		return input.WithError(err), err
	}
	start := time.Now()
	defer httpResponse.Body.Close()
	var written int64
	var er error
	if localFolder := targetNode.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder); localFolder != "" {
		var localFile *os.File
		localFile, er = os.OpenFile(filepath.Join(localFolder, targetNode.Uuid), os.O_CREATE|os.O_WRONLY, 0755)
		if er == nil {
			written, er = io.Copy(localFile, httpResponse.Body)
		}
	} else {
		written, er = w.Router.PutObject(ctx, targetNode, httpResponse.Body, &models.PutRequestData{Size: httpResponse.ContentLength})
	}
	log.Logger(ctx).Debug("After PUT Object", zap.Int64("Written Bytes", written), zap.Error(er), zap.Any("ctx", ctx))
	if er != nil {
		return input.WithError(er), err
	}
	last := time.Since(start)
	jsonBody, _ := json.Marshal(map[string]interface{}{
		"Size": written,
		"Time": last,
	})
	log.TasksLogger(ctx).Info(fmt.Sprintf("Downloaded %d bytes in %s", written, last.String()))
	request := &tree.ReadNodeRequest{Node: &tree.Node{Path: targetNode.Path}}
	resp, err := w.Router.ReadNode(ctx, request)
	if err != nil {
		log.Logger(ctx).Error("Cannot read node", zap.Error(err))
	} else {
		input.Nodes = append(input.Nodes, resp.Node)
	}

	input.AppendOutput(&jobs.ActionOutput{
		Success:  true,
		JsonBody: jsonBody,
	})
	return input, nil
}
