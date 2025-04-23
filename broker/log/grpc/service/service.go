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

// Package service provides a Pydio GRPC service for querying the logs
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/broker/log"
	grpc2 "github.com/pydio/cells/v5/broker/log/grpc"
	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	proto "github.com/pydio/cells/v5/common/proto/log"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
)

const (
	Name = common.ServiceGrpcNamespace_ + common.ServiceLog
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Syslog index store"),
			service.WithStorageDrivers(log.Drivers),
			// TODO - Recheck - This does NOT triggering telemetry reload
			// TODO - PLUS it does not feel right to have this default config set by the service
			service.Migrations([]*service.Migration{{
				TargetVersion: service.FirstRun(),
				Up: func(ctx context.Context) error {
					if err := config.Get(ctx, "defaults/telemetry/loggers").Set([]map[string]any{{
						"encoding": "console",
						"level":    "info",
						"outputs":  []string{"stdout:///"},
					}, {
						"encoding": "json",
						"level":    "info",
						"outputs": []string{
							"file://" + runtime.ApplicationWorkingDir(runtime.ApplicationDirLogs) + "/pydio.log",
							"service:///?service=pydio.grpc.log",
						},
					}}); err != nil {
						return err
					}

					return config.Save(ctx, "migration", "migration")
				},
			}}),
			service.WithStorageMigrator(log.Migrate),
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {

				handler := &grpc2.Handler{
					HandlerName: common.ServiceGrpcNamespace_ + common.ServiceLog,
				}

				// TODO - should be in migrations directly (multi context handled)
				/*
					_ = runtime.MultiContextManager().Iterate(c, func(ctx context.Context, _ string) error {
						cv := common.MakeCellsVersion()
						m := map[string]string{
							"logger":       common.ServiceGrpcNamespace_ + common.ServiceLog,
							"msg":          "build-info | " + cv.PackageLabel + " - " + cv.Version + " - " + cv.BuildTime,
							"level":        "info",
							"ts":           time.Now().Format(time.RFC3339),
							"PackageLabel": cv.PackageLabel,
							"Version":      cv.Version,
							"BuildTime":    cv.BuildTime,
							"GitCommit":    cv.GitCommit,
							"OS":           cv.OS,
							"Arch":         cv.Arch,
							"GoVersion":    cv.GoVersion,
						}
						data, _ := json.Marshal(m)
						if er := handler.OneLog(ctx, &proto.Log{
							Nano:    int32(time.Now().UnixNano()),
							Message: data,
						}); er != nil {
							log2.Logger(ctx).Warn("cannot insert first line in logs", zap.Error(er))
						}
						return nil
					})

				*/

				proto.RegisterLogRecorderServer(server, handler)
				sync.RegisterSyncEndpointServer(server, handler)

				return nil
			}),
		)
	})
}
