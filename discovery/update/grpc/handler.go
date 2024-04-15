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
	"fmt"
	"math"
	"net/url"
	"strconv"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/update"
	runtimecontext "github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
	update2 "github.com/pydio/cells/v4/discovery/update"
)

type Handler struct {
	update.UnimplementedUpdateServiceServer
}

func (h *Handler) Name() string {
	return ServiceName
}

func (h *Handler) UpdateRequired(ctx context.Context, request *update.UpdateRequest) (*update.UpdateResponse, error) {

	configs := config.GetUpdatesConfigs()
	binaries, e := update2.LoadUpdates(ctx, configs, request)
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return nil, e
	}
	response := &update.UpdateResponse{
		Channel:           configs.Val("channel").String(),
		AvailableBinaries: binaries,
	}

	return response, nil
}

func (h *Handler) ApplyUpdate(ctx context.Context, request *update.ApplyUpdateRequest) (*update.ApplyUpdateResponse, error) {

	configs := config.GetUpdatesConfigs()
	binaries, e := update2.LoadUpdates(ctx, configs, &update.UpdateRequest{
		PackageName: request.PackageName,
	})
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return nil, e
	}
	var apply *update.Package
	for _, binary := range binaries {
		if binary.Version == request.TargetVersion {
			apply = binary
		}
	}
	if apply == nil {
		return nil, fmt.Errorf("cannot find the requested version")
	}

	log.Logger(ctx).Info("Updating binary now", zap.String("PackageName", apply.PackageName), zap.String("Version", apply.Version), zap.String("URL", apply.BinaryURL))
	uName, _ := permissions.FindUserNameInContext(ctx)

	// Defining new Context
	newCtx := context.Background()
	pgChan := make(chan float64)
	errorChan := make(chan error)
	doneChan := make(chan bool)

	response := &update.ApplyUpdateResponse{
		Success: true,
		Message: uuid.New(),
	}
	task := &jobs.Task{
		ID:            response.Message,
		JobID:         response.Message,
		Status:        jobs.TaskStatus_Running,
		HasProgress:   true,
		StartTime:     int32(time.Now().Unix()),
		StatusMessage: "Upgrading Binary",
		TriggerOwner:  uName,
	}
	job := &jobs.Job{
		ID:    response.Message,
		Label: "Upgrading Binary",
		Owner: uName,
		Tasks: []*jobs.Task{task},
	}
	event := &jobs.TaskChangeEvent{
		TaskUpdated: task,
		Job:         job,
	}
	broker.MustPublish(ctx, common.TopicJobTaskEvent, event)
	ct := runtimecontext.ForkContext(context.Background(), ctx)
	go func() {
		defer close(pgChan)
		defer close(errorChan)
		//defer close(doneChan)
		for {
			select {
			case pg := <-pgChan:
				task.Progress = float32(pg)
				if pg < 1 {
					task.StatusMessage = fmt.Sprintf("Downloading Binary %v%%...", math.Floor(pg*100))
				} else {
					task.StatusMessage = "Download finished, now verifying package..."
				}
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
			case e := <-errorChan:
				task.Status = jobs.TaskStatus_Error
				task.StatusMessage = e.Error()
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
				return
			case <-doneChan:
				task.Status = jobs.TaskStatus_Finished
				task.StatusMessage = "Binary package has been successfully verified, you can now restart Cells.\n"
				// Double check if we are on a protected port and log a hint in such case.
				hasProtectedPort := false
				sites, _ := config.LoadSites()
				for _, si := range sites {
					for _, a := range si.GetBindURLs() {
						u, _ := url.Parse(a)
						if port, err := strconv.Atoi(u.Port()); err == nil && port < 1024 {
							hasProtectedPort = true
							break
						}
					}
				}
				if hasProtectedPort {
					task.StatusMessage += "--------- \n"
					task.StatusMessage += "WARNING: you are using a reserved port on one your binding url.\n"
					task.StatusMessage += "You must execute following command to authorize the new binary to use this port *before* restarting your instance:\n"
					task.StatusMessage += "$ sudo setcap 'cap_net_bind_service=+ep' <path to your binary>\n"
				}
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
				return
			}
		}
	}()

	go update2.ApplyUpdate(newCtx, apply, configs, false, pgChan, doneChan, errorChan)

	return response, nil
}
