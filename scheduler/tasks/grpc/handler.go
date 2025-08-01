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

package grpc

import (
	"context"

	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/scheduler/tasks"
)

// TaskHandler implements the TaskService API
type TaskHandler struct {
	jobs.UnimplementedTaskServiceServer
}

// Control publishes the passed command
func (h *TaskHandler) Control(ctx context.Context, command *jobs.CtrlCommand) (*jobs.CtrlCommandResponse, error) {

	tasks.GetBus(ctx).Pub(command, tasks.PubSubTopicControl)
	return &jobs.CtrlCommandResponse{Msg: "Published"}, nil

}

// GetRegisteredMiddlewares can serve the currently stored middlewares
func (h *TaskHandler) GetRegisteredMiddlewares(ctx context.Context, _ *jobs.RegisteredMiddlewaresRequest) (*jobs.RegisteredMiddlewaresResponse, error) {
	dd := tasks.ListJobsMiddlewares(ctx)
	return &jobs.RegisteredMiddlewaresResponse{
		Descriptors: dd,
	}, nil
}
