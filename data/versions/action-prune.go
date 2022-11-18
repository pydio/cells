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

	"github.com/pydio/cells/v4/common/client/grpc"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var (
	pruneVersionsActionName = "actions.versioning.prune"
)

type PruneVersionsAction struct {
	common.RuntimeHolder
	Handler nodes.Handler
	Pool    nodes.SourcesPool
}

func (c *PruneVersionsAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              pruneVersionsActionName,
		Label:           "Prune Versions",
		Icon:            "delete-sweep",
		Category:        actions.ActionCategoryTree,
		Description:     "Apply versioning policies to keep only a limited number of versions.",
		SummaryTemplate: "",
		HasForm:         false,
		IsInternal:      true,
	}
}

func (c *PruneVersionsAction) GetParametersForm() *forms.Form {
	return nil
}

// GetName returns the Unique identifier.
func (c *PruneVersionsAction) GetName() string {
	return pruneVersionsActionName
}

// Init passes the parameters to a newly created PruneVersionsAction.
func (c *PruneVersionsAction) Init(job *jobs.Job, action *jobs.Action) error {

	c.Pool = getRouter(c.GetRuntimeContext()).GetClientsPool()
	c.Handler = getRouter(c.GetRuntimeContext())
	return nil
}

// Run processes the actual action code.
func (c *PruneVersionsAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	// First check if versioning is enabled on any datasource
	sources := config.SourceNamesForDataServices(common.ServiceDataIndex)
	var versioningFound bool
	for _, src := range sources {
		var ds *object.DataSource
		if err := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+src).Scan(&ds); err == nil {
			if ds.VersioningPolicyName != "" {
				versioningFound = true
				break
			}
		}
	}

	if !versioningFound {
		log.TasksLogger(ctx).Info("Ignoring action: no datasources found with versioning enabled.")
		return input.WithIgnore(), nil
	} else {
		log.TasksLogger(ctx).Info("Starting action: one or more datasources found with versioning enabled.")
	}
	versionClient := tree.NewNodeVersionerClient(grpc.GetClientConnFromCtx(c.GetRuntimeContext(), common.ServiceVersions))
	if response, err := versionClient.PruneVersions(ctx, &tree.PruneVersionsRequest{AllDeletedNodes: true}); err == nil {
		for _, version := range response.DeletedVersions {
			deleteNode := version.GetLocation()
			_, err := c.Handler.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: deleteNode}) // source.Handler.RemoveObjectWithContext(ctx, source.ObjectsBucket, versionFileId)
			if err != nil {
				log.TasksLogger(ctx).Error("Error while trying to remove file "+deleteNode.Uuid, zap.String("fileId", deleteNode.Uuid), zap.Error(err))
			} else {
				log.TasksLogger(ctx).Info("[Prune Versions Task] Removed file from versions bucket "+deleteNode.Uuid, zap.String("fileId", deleteNode.Uuid))
			}
		}
	} else {
		return input.WithError(err), err
	}

	output := input
	output.AppendOutput(&jobs.ActionOutput{Success: true})
	log.TasksLogger(ctx).Info("Finished pruning deleted versions")

	return output, nil
}
