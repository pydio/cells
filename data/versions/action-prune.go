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

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

type PruneVersionsAction struct {
	Handler views.Handler
	Pool    *views.ClientsPool
}

var (
	pruneVersionsActionName = "actions.versioning.prune"
)

// GetName returns the Unique identifier.
func (c *PruneVersionsAction) GetName() string {
	return pruneVersionsActionName
}

// Init passes the parameters to a newly created PruneVersionsAction.
func (c *PruneVersionsAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {

	router := views.NewStandardRouter(views.RouterOptions{AdminView: true})
	c.Pool = router.GetClientsPool()
	c.Handler = router
	return nil
}

// Run processes the actual action code.
func (c *PruneVersionsAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	source, e := c.Pool.GetDataSourceInfo(common.PYDIO_VERSIONS_NAMESPACE)
	if e != nil {
		return input.WithError(e), e
	}
	// Prepare ctx with info about the target branch
	ctx = views.WithBranchInfo(ctx, "to", views.BranchInfo{LoadedSource: source})
	if meta, mOk := views.MinioMetaFromContext(ctx); mOk {
		source.Client.PrepareMetadata(meta)
		defer source.Client.ClearMetadata()
	}

	versionClient := tree.NewNodeVersionerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_VERSIONS, defaults.NewClient())
	if response, err := versionClient.PruneVersions(ctx, &tree.PruneVersionsRequest{AllDeletedNodes: true}); err == nil {
		log.Logger(ctx).Debug("Client responded", zap.Any("resp", response))
		for _, versionFileId := range response.DeletedVersions {
			err := source.Client.RemoveObject(source.ObjectsBucket, versionFileId)
			if err != nil {
				log.Logger(ctx).Error("Error while trying to remove file", zap.String("fileId", versionFileId), zap.Error(err))
			} else {
				log.Logger(ctx).Info("[Prune Versions Task] Removed file from versions bucket", zap.String("fileId", versionFileId))
			}
		}
	} else {
		return input.WithError(err), err
	}

	output := input
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Finished pruning deleted versions",
	})

	return output, nil
}
