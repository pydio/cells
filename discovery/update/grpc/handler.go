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

	"github.com/micro/go-micro/client"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/update"
	"github.com/pydio/cells/common/utils/permissions"
	update2 "github.com/pydio/cells/discovery/update"
)

type Handler struct{}

func (h *Handler) UpdateRequired(ctx context.Context, request *update.UpdateRequest, response *update.UpdateResponse) error {

	configs := config.GetUpdatesConfigs()
	binaries, e := update2.LoadUpdates(ctx, configs, request)
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return e
	}
	response.Channel = configs.Val("channel").String()
	response.AvailableBinaries = binaries

	return nil
}

func (h *Handler) ApplyUpdate(ctx context.Context, request *update.ApplyUpdateRequest, response *update.ApplyUpdateResponse) error {

	configs := config.GetUpdatesConfigs()
	binaries, e := update2.LoadUpdates(ctx, configs, &update.UpdateRequest{
		PackageName: request.PackageName,
	})
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return e
	}
	var apply *update.Package
	for _, binary := range binaries {
		if binary.Version == request.TargetVersion {
			apply = binary
		}
	}
	if apply == nil {
		return fmt.Errorf("cannot find the requested version")
	}

	log.Logger(ctx).Info("Update binary now", zap.Any("package", apply))
	uName, _ := permissions.FindUserNameInContext(ctx)

	// Defining new Context
	newCtx := context.Background()
	pgChan := make(chan float64)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	response.Success = true
	// Create a fake job UUID
	response.Message = uuid.New()
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
	client.Publish(ctx, client.NewPublication(common.TopicJobTaskEvent, event))
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
				client.Publish(ctx, client.NewPublication(common.TopicJobTaskEvent, event))
			case e := <-errorChan:
				task.Status = jobs.TaskStatus_Error
				task.StatusMessage = e.Error()
				client.Publish(ctx, client.NewPublication(common.TopicJobTaskEvent, event))
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
				client.Publish(ctx, client.NewPublication(common.TopicJobTaskEvent, event))
				return
			}
		}
	}()

	go update2.ApplyUpdate(newCtx, apply, configs, false, pgChan, doneChan, errorChan)

	return nil
}
