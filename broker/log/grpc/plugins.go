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

// Package grpc provides a Pydio GRPC service for querying the logs
package grpc

import (
	"context"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/broker/log"
	"github.com/pydio/cells/v4/common"
	log2 "github.com/pydio/cells/v4/common/log"
	proto "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/service"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

const (
	ServiceName = common.ServiceGrpcNamespace_ + common.ServiceLog
)

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Syslog index store"),
			/*
				service.WithStorage(
					service.WithName("logs"),
					service.WithDriver(log.NewBleveDAO),
					service.WithDriver(log.NewMongoDAO),
					service.WithMigrator(log.Migrate),
				),
			*/
			service.WithStorageDrivers(log.NewBleveDAO, log.NewMongoDAO),
			service.WithStorageMigrator(log.Migrate),
			/*
				service.WithIndexer(log.NewDAO,
					service.WithStoragePrefix("syslog"),
					service.WithStorageMigrator(log.Migrate),
					service.WithStorageSupport(bleve.Driver, mongodb.Driver),
					service.WithStorageDefaultDriver(func() (string, string) {
						return bleve.Driver, filepath.Join(runtime.MustServiceDataDir(ServiceName), "syslog.bleve?mapping=log")
					}),
				),

			*/
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {

				handler := &Handler{
					HandlerName: common.ServiceGrpcNamespace_ + common.ServiceLog,
				}

				_ = tenant.GetManager().Iterate(c, func(ctx context.Context, t tenant.Tenant) error {
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

				proto.RegisterLogRecorderServer(server, handler)
				sync.RegisterSyncEndpointServer(server, handler)

				return nil
			}),
		)
	})
}
