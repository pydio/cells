/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package versions

import (
	"context"
	"fmt"
	"path"

	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/i18n"
	"github.com/pydio/cells/v4/data/versions/lang"
	"github.com/pydio/cells/v4/scheduler/actions"
)

type VersionAction struct {
	common.RuntimeHolder
}

func (c *VersionAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:               versionActionName,
		Label:            "File versioning",
		Icon:             "content-copy",
		Category:         actions.ActionCategoryTree,
		Description:      "Create a copy of file on each content change",
		SummaryTemplate:  "",
		HasForm:          false,
		InputDescription: "Single node from event",
		IsInternal:       true,
	}
}

func (c *VersionAction) GetParametersForm() *forms.Form {
	return nil
}

var (
	versionActionName = "actions.versioning.create"
	router            nodes.Client
)

func getRouter(runtime context.Context) nodes.Client {
	if router == nil {
		router = compose.PathClient(runtime, nodes.AsAdmin())
	}
	return router
}

// GetName returns the Unique identifier for this VersionAction
func (c *VersionAction) GetName() string {
	return versionActionName
}

// Init sets this VersionAction parameters.
func (c *VersionAction) Init(job *jobs.Job, action *jobs.Action) error {
	return nil
}

// Run processes the actual action code
func (c *VersionAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}
	node := input.Nodes[0]

	if node.Etag == common.NodeFlagEtagTemporary || tree.IgnoreNodeForOutput(ctx, node) {
		return input.WithIgnore(), nil // Ignore
	}
	T := lang.Bundle().GetTranslationFunc(i18n.GetDefaultLanguage(config.Get()))
	policy := PolicyForNode(ctx, node)
	if policy == nil {
		return input.WithIgnore(), nil
	}

	// TODO: find clients from pool so that they are considered the same by the CopyObject request
	source, e := DataSourceForPolicy(c.GetRuntimeContext(), policy) //getRouter().GetClientsPool().GetDataSourceInfo(common.PydioVersionsNamespace)
	if e != nil {
		return input.WithError(e), e
	}

	versionClient := tree.NewNodeVersionerClient(grpc.GetClientConnFromCtx(c.GetRuntimeContext(), common.ServiceVersions))
	request := &tree.CreateVersionRequest{Node: node}
	if input.Event != nil {
		ce := &tree.NodeChangeEvent{}
		if err := anypb.UnmarshalTo(input.Event, ce, proto.UnmarshalOptions{}); err == nil {
			request.TriggerEvent = ce
		}
	}
	resp, err := versionClient.CreateVersion(ctx, request)
	if err != nil {
		return input.WithError(err), err
	}
	if (resp.Version == nil || resp.Version == &tree.ChangeLog{}) {
		// No version returned, means content did not change, do not update
		return input.WithIgnore(), nil
	}

	// Prepare ctx with info about the target branch
	branchInfo := nodes.BranchInfo{LoadedSource: source}
	ctx = nodes.WithBranchInfo(ctx, "to", branchInfo)

	sourceNode := node.Clone()

	vPath := node.Uuid + "__" + resp.Version.Uuid
	targetNode := &tree.Node{
		Uuid: vPath,
		Path: path.Join(source.Name, vPath),
		MetaStore: map[string]string{
			common.MetaNamespaceDatasourceName: `"` + source.Name + `"`,
			common.MetaNamespaceDatasourcePath: `"` + vPath + `"`,
		},
	}

	written, err := getRouter(c.GetRuntimeContext()).CopyObject(ctx, sourceNode, targetNode, &models.CopyRequestData{})
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Copying %s -> %s", sourceNode.GetPath(), targetNode.GetUuid()))
		return input.WithError(err), err
	}

	output := input
	log.TasksLogger(ctx).Info(T("Job.Version.StatusFile", resp.Version))
	output.AppendOutput(&jobs.ActionOutput{Success: true})

	if written > 0 {
		storedVersion := resp.Version
		storedVersion.Location = targetNode
		response, err2 := versionClient.StoreVersion(ctx, &tree.StoreVersionRequest{Node: node, Version: storedVersion})
		if err2 != nil {
			return input.WithError(err2), err2
		}
		log.TasksLogger(ctx).Info(T("Job.Version.StatusMeta", resp.Version))
		output.AppendOutput(&jobs.ActionOutput{Success: true})
		ctx = nodes.WithBranchInfo(ctx, "in", branchInfo)
		for _, version := range response.PruneVersions {
			_, errDel := getRouter(c.GetRuntimeContext()).DeleteNode(ctx, &tree.DeleteNodeRequest{Node: version.GetLocation()})
			if errDel != nil {
				return input.WithError(errDel), errDel
			}
		}
		if len(response.PruneVersions) > 0 {
			log.TasksLogger(ctx).Info(T("Job.Version.StatusPrune", struct{ Count int }{Count: len(response.PruneVersions)}))
			output.AppendOutput(&jobs.ActionOutput{Success: true})
		}
	}

	log.Logger(ctx).Debug("[VERSIONING] End", zap.Error(err), zap.Int64("written", written))

	return output, nil
}
