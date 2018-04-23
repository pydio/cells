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

package images

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	cleanThumbTaskName = "actions.images.clean"
)

type CleanThumbsTask struct {
	Client client.Client
}

// GetName returns this action unique identifier.
func (c *CleanThumbsTask) GetName() string {
	return cleanThumbTaskName
}

// Init passes parameters to the action.
func (c *CleanThumbsTask) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	c.Client = cl
	return nil
}

// Run the actual action code
func (c *CleanThumbsTask) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil
	}

	thumbsClient, thumbsBucket, e := views.GetGenericStoreClient(ctx, common.PYDIO_THUMBSTORE_NAMESPACE, c.Client)
	if e != nil {
		log.Logger(ctx).Debug("Cannot get ThumbStoreClient", zap.Error(e), zap.Any("context", ctx))
		return input.WithError(e), e
	}
	if meta, mOk := views.MinioMetaFromContext(ctx); mOk {
		thumbsClient.PrepareMetadata(map[string]string{
			"x-pydio-user": meta["x-pydio-user"],
		})
		defer thumbsClient.ClearMetadata()
	}
	if e != nil {
		log.Logger(ctx).Debug("Cannot get ThumbStoreClient", zap.Error(e), zap.Any("context", ctx))
		return input.WithError(e), e
	}
	nodeUuid := input.Nodes[0].Uuid
	// List all thumbs starting with node Uuid
	listRes, err := thumbsClient.ListObjects(thumbsBucket, nodeUuid+"-", "", "", 0)
	if err != nil {
		log.Logger(ctx).Debug("Cannot get ThumbStoreClient", zap.Error(err), zap.Any("context", ctx))
		return input.WithError(err), err
	}
	logs := []string{"Removing thumbs associated to node " + nodeUuid}
	for _, oi := range listRes.Contents {
		err := thumbsClient.RemoveObject(thumbsBucket, oi.Key)
		if err != nil {
			log.Logger(ctx).Debug("Cannot get ThumbStoreClient", zap.Error(err))
			return input.WithError(err), err
		}
		logs = append(logs, fmt.Sprintf("Successfully removed object %s", oi.Key))
	}
	output := jobs.ActionMessage{}
	output.AppendOutput(&jobs.ActionOutput{
		StringBody: strings.Join(logs, "\n"),
	})
	log.Logger(ctx).Debug("Thumbs Clean Output", zap.Any("logs", logs))
	return output, nil
}
