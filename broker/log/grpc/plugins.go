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
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"path/filepath"
	"time"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/broker/log"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/bleve"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	proto "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
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
			service.WithIndexer(log.NewDAO,
				service.WithStoragePrefix("syslog"),
				service.WithStorageMigrator(log.Migrate),
				service.WithStorageSupport(bleve.Driver, mongodb.Driver),
				service.WithStorageDefaultDriver(func() (string, string) {
					return bleve.Driver, filepath.Join(runtime.MustServiceDataDir(ServiceName), "syslog.bleve?mapping=log")
				}),
			),
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {
				indexDAO := servicecontext.GetIndexer(c).(dao.IndexDAO)
				repo, err := log.NewIndexService(indexDAO)
				if err != nil {
					return err
				}

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
				_ = repo.PutLog(c, &proto.Log{
					Nano:    int32(time.Now().UnixNano()),
					Message: data,
				})

				handler := &Handler{
					Repo:        repo,
					HandlerName: common.ServiceGrpcNamespace_ + common.ServiceLog,
				}
				proto.RegisterLogRecorderEnhancedServer(server, handler)
				sync.RegisterSyncEndpointEnhancedServer(server, handler)

				go func() {
					<-c.Done()
					repo.Close(c)
				}()

				return nil
			}),
		)
	})
}
