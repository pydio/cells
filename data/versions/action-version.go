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

package versions

import (
	"context"

	"github.com/golang/protobuf/ptypes"
	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/golang/protobuf/proto"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/data/versions/lang"
	"github.com/pydio/cells/scheduler/actions"
)

type VersionAction struct {
	Handler views.Handler
	Pool    *views.ClientsPool
}

var (
	versionActionName = "actions.versioning.create"
)

// GetName returns the Unique identifier for this VersionAction
func (c *VersionAction) GetName() string {
	return versionActionName
}

// Init sets this VersionAction parameters.
func (c *VersionAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	router := views.NewStandardRouter(views.RouterOptions{AdminView: true})
	c.Pool = router.GetClientsPool()
	c.Handler = router
	return nil
}

// Run processes the actual action code
func (c *VersionAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}
	node := input.Nodes[0]

	if node.Etag == common.NODE_FLAG_ETAG_TEMPORARY || utils.IgnoreNodeForOutput(ctx, node) {
		return input.WithIgnore(), nil // Ignore
	}
	T := lang.Bundle().GetTranslationFunc(i18n.GetDefaultLanguage(config.Default()))
	var hasPolicy bool
	if nodeSource, e := c.Pool.GetDataSourceInfo(node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)); e == nil {
		if nodeSource.VersioningPolicyName != "" {
			hasPolicy = true
		}
	}
	if !hasPolicy {
		return input.WithIgnore(), nil
	}

	// TODO: find clients from pool so that they are considered the same by the CopyObject request

	source, e := c.Pool.GetDataSourceInfo(common.PYDIO_VERSIONS_NAMESPACE)
	if e != nil {
		return input.WithError(e), e
	}
	// Prepare ctx with info about the target branch
	ctx = views.WithBranchInfo(ctx, "to", views.BranchInfo{LoadedSource: source})

	versionClient := tree.NewNodeVersionerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_VERSIONS, defaults.NewClient())
	request := &tree.CreateVersionRequest{Node: node}
	var ce tree.NodeChangeEvent
	if input.Event != nil {
		if err := ptypes.UnmarshalAny(input.Event, &ce); err == nil {
			request.TriggerEvent = &ce
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

	targetNode := &tree.Node{
		Path: node.Uuid + "__" + resp.Version.Uuid,
	}
	targetNode.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, targetNode.Path)
	sourceNode := proto.Clone(node).(*tree.Node)
	written, err := c.Handler.CopyObject(ctx, sourceNode, targetNode, &views.CopyRequestData{})

	output := input
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: T("Job.Version.StatusFile", resp.Version),
	})

	if err == nil && written > 0 {
		response, err2 := versionClient.StoreVersion(ctx, &tree.StoreVersionRequest{Node: node, Version: resp.Version})
		if err2 != nil {
			return input.WithError(err2), err2
		}
		output.AppendOutput(&jobs.ActionOutput{
			Success:    true,
			StringBody: T("Job.Version.StatusMeta", resp.Version),
		})
		for _, version := range response.PruneVersions {
			ctx = views.WithBranchInfo(ctx, "in", views.BranchInfo{LoadedSource: source})
			deleteNode := &tree.Node{Path: node.Uuid + "__" + version.Uuid}
			deleteNode.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, deleteNode.Path)
			_, errDel := c.Handler.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: deleteNode})
			if errDel != nil {
				return input.WithError(errDel), errDel
			}
		}
		if len(response.PruneVersions) > 0 {
			output.AppendOutput(&jobs.ActionOutput{
				Success:    true,
				StringBody: T("Job.Version.StatusPrune", struct{ Count int }{Count: len(response.PruneVersions)}),
			})
		}
	}

	log.Logger(ctx).Debug("[VERSIONING] End", zap.Error(err), zap.Int64("written", written))

	return output, nil
}
