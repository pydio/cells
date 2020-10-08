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
	"strconv"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/registry"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	archiveActionName = "actions.changes.archive"
)

// ArchiveAction implements archiving.
type ArchiveAction struct {
	RemainingRows uint64
}

func (a *ArchiveAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              archiveActionName,
		IsInternal:      true,
		Label:           "Archive Changes",
		Icon:            "zip-box",
		Description:     "Archive all changes into an alternative table (legacy action)",
		Category:        actions.ActionCategoryScheduler,
		SummaryTemplate: "",
		HasForm:         false,
	}
}

func (a *ArchiveAction) GetParametersForm() *forms.Form {
	return nil
}

// GetName returns this action unique identifier
func (a *ArchiveAction) GetName() string {
	return archiveActionName
}

// Init passes parameters to the action
func (a *ArchiveAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if remainingRows, ok := action.Parameters["remainingRows"]; ok {
		u, err := strconv.ParseUint(remainingRows, 10, 64)
		if err != nil {
			return err
		}

		a.RemainingRows = u
	} else {
		a.RemainingRows = 1
	}
	return nil
}

// Run the actual action code
func (a *ArchiveAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	c := service.NewArchiverService(registry.GetClient(common.SERVICE_CHANGES))

	log.TasksLogger(ctx).Info(fmt.Sprintf("Launching archive action with param RemainingRows=%d", a.RemainingRows))

	query, err := ptypes.MarshalAny(&service.ChangesArchiveQuery{RemainingRows: a.RemainingRows})
	if err != nil {
		return input.WithError(err), err
	}

	req := &service.Query{
		SubQueries: []*any.Any{query},
	}

	resp, err := c.Archive(ctx, req)
	if err != nil {
		log.TasksLogger(ctx).Info("could not archive", zap.Any("ArchiveRequest", req), zap.Error(err))
		return input.WithError(err), err
	}

	if resp.GetOK() {
		input.AppendOutput(&jobs.ActionOutput{
			Success:    true,
			StringBody: "Archived latest changes",
		})
	}

	return input, nil
}
