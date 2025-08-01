/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/update"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
	"github.com/pydio/cells/v5/common/utils/uuid"
	update2 "github.com/pydio/cells/v5/discovery/update"
	"github.com/pydio/cells/v5/discovery/update/lang"
)

type Handler struct {
	update.UnimplementedUpdateServiceServer
}

func (h *Handler) UpdateRequired(ctx context.Context, request *update.UpdateRequest) (*update.UpdateResponse, error) {

	configs := config.GetUpdatesConfigs(ctx)
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

	crtLang := languages.UserLanguageFromContext(ctx, true)
	T := lang.Bundle().T(crtLang)

	configs := config.GetUpdatesConfigs(ctx)
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
		return nil, errors.New("cannot find the requested version")
	}

	log.Logger(ctx).Info("Updating binary now", zap.String("PackageName", apply.PackageName), zap.String("Version", apply.Version), zap.String("URL", apply.BinaryURL))
	uName := claim.UserNameFromContext(ctx)

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
		StatusMessage: T("Update.Process.Start"),
		TriggerOwner:  uName,
	}
	job := &jobs.Job{
		ID:    response.Message,
		Label: T("Update.Process.Start"),
		Owner: uName,
		Tasks: []*jobs.Task{task},
	}
	event := &jobs.TaskChangeEvent{
		TaskUpdated: task,
		Job:         job,
	}
	broker.MustPublish(ctx, common.TopicJobTaskEvent, event)
	ct := context.WithoutCancel(ctx)
	go func() {
		defer close(pgChan)
		defer close(errorChan)
		//defer close(doneChan)
		for {
			select {
			case pg := <-pgChan:
				task.Progress = float32(pg)
				if pg < 1 {
					stringProgress := fmt.Sprintf("%v", math.Floor(pg*100))
					task.StatusMessage = strings.Replace(T("Update.Process.Progress"), "{progress}", stringProgress, 1)
				} else {
					task.StatusMessage = T("Update.Process.Verify")
				}
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
			case e := <-errorChan:
				task.Status = jobs.TaskStatus_Error
				task.StatusMessage = e.Error()
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
				return
			case <-doneChan:
				task.Status = jobs.TaskStatus_Finished
				task.StatusMessage = T("Update.Process.Finished")
				// Double check if we are on a protected port and log a hint in such case.
				hasProtectedPort := false
				sites, _ := routing.LoadSites(ctx)
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
					task.StatusMessage += strings.Join([]string{
						"",
						"----------------",
						T("Update.SetCapDetected.Warning"),
						T("Update.SetCapDetected.Hint"),
						T("Update.SetCapDetected.Command"),
					}, "\n")
				}
				broker.MustPublish(ct, common.TopicJobTaskEvent, event)
				return
			}
		}
	}()

	go update2.ApplyUpdate(newCtx, apply, configs, false, pgChan, doneChan, errorChan)

	return response, nil
}
