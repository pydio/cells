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

package log

import (
	"context"
	"fmt"
	"io"
	"log"
	"runtime"
	"testing"
	"time"

	"github.com/go-openapi/errors"
	"github.com/micro/cli"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
	. "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	plog "github.com/pydio/cells/common/proto/log"
)

var (
	r = newMockRegistry()
)

func init() {
	registry.DefaultRegistry = r
	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(func() client.Option {
		return client.Registry(r)
	})

	tick := time.Tick(5 * time.Second)
	timeout := time.After(20 * time.Second)
	running := false
	var cancel context.CancelFunc
	go func() {
		for {
			select {
			case <-tick:
				if !running {
					cancel = run()
					running = true
				} else {
					cancel()
					running = false
				}
				break
			case <-timeout:
				if running {
					cancel()
				}
				return
			}
		}
	}()
}

func run() context.CancelFunc {
	ctx, cancel := context.WithCancel(context.Background())

	service := micro.NewService(
		micro.Context(ctx),
		micro.Cmd(&mockCommand{}),
		micro.Name("pydio.grpc.log"),
		micro.Version("latest"),
		micro.Registry(r),
		micro.Server(defaults.NewServer()),
	)

	service.Init()

	plog.RegisterLogRecorderHandler(service.Server(), &Handler{ctx: ctx})

	go func() {
		// Disabling server from time to time
		if err := service.Run(); err != nil {
			log.Fatal(err)
		}

	}()

	return cancel
}

func TestLogSync(t *testing.T) {

	ctx, cancel := context.WithCancel(context.Background())

	// Forwards logs to the pydio.grpc.logs service to store them
	var syncers []zapcore.WriteSyncer
	syncers = append(syncers, zapcore.AddSync(NewLogSyncer(ctx, common.ServiceGrpcNamespace_+common.ServiceLog)))

	config := zap.NewProductionEncoderConfig()
	config.EncodeTime = RFC3369TimeEncoder

	w := zapcore.NewMultiWriteSyncer(syncers...)
	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(config),
		w,
		zapcore.DebugLevel,
	)

	logger := zap.New(core)

	go func() {
		i := 0
		for {
			i++
			logger.Info(fmt.Sprintf("Testing %d", i))
			<-time.After(1 * time.Millisecond)
		}
	}()

	go func() {
		i := 0
		for {
			i++
			logger.Info(fmt.Sprintf("Parallel Testing %d", i))
			<-time.After(1 * time.Millisecond)
		}
	}()

	Convey("Test goroutine leaks", t, func() {
		<-time.After(20 * time.Second)
		runtime.GC()
		So(runtime.NumGoroutine(), ShouldBeLessThan, 50)

		cancel()

		<-time.After(2 * time.Second)
		So(runtime.NumGoroutine(), ShouldBeLessThanOrEqualTo, 40)
		runtime.GC()
	})
}

type mockRegistry struct {
	services []*registry.Service
}

func newMockRegistry() *mockRegistry {
	m := &mockRegistry{}

	return m
}

func (m *mockRegistry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	m.services = append(m.services, s)

	return nil
}

// Deregister a service node
func (m *mockRegistry) Deregister(s *registry.Service) error {
	m.services = nil

	return nil
}

// Retrieve a service. A slice is returned since we separate Name/Version.
func (m *mockRegistry) GetService(name string) ([]*registry.Service, error) {
	return m.services, nil
}

// List the services. Only returns service names
func (m *mockRegistry) ListServices() ([]*registry.Service, error) {
	return m.services, nil
}

// Watch returns a watcher which allows you to track updates to the registry.
func (m *mockRegistry) Watch(opts ...registry.WatchOption) (registry.Watcher, error) {
	return &mockRegistryWatcher{m}, nil
}

func (m *mockRegistry) String() string {
	return "mock"
}

func (m *mockRegistry) Options() registry.Options {
	return registry.Options{}
}

type mockRegistryWatcher struct {
	m *mockRegistry
}

func (w *mockRegistryWatcher) Next() (*registry.Result, error) {
	return nil, nil
}

func (w *mockRegistryWatcher) Stop() {
}

type Handler struct {
	ctx context.Context
}

// PutLog retrieves the log messages from the proto stream and stores them in the index.
func (h *Handler) PutLog(ctx context.Context, stream plog.LogRecorder_PutLogStream) error {
	for {
		_, err := stream.Recv()
		if err == io.EOF {
			return err
		}

		if err != nil {
			return err
		}

		// fmt.Println("Received ", line.GetMessage())

		// If the service context is done, then we close the stream for the mock grpc
		select {
		case <-h.ctx.Done():
			return stream.Close()
		default:
			continue
		}
	}

	// return nil
}

// ListLogs is a simple gateway from protobuf to the indexer search engine.
func (h *Handler) ListLogs(ctx context.Context, req *plog.ListLogRequest, stream plog.LogRecorder_ListLogsStream) error {
	return nil
}

func (h *Handler) DeleteLogs(ctx context.Context, req *plog.ListLogRequest, resp *plog.DeleteLogsResponse) error {
	return nil
}

// AggregatedLogs retrieves aggregated figures from the indexer to generate charts and reports.
func (h *Handler) AggregatedLogs(ctx context.Context, req *plog.TimeRangeRequest, stream plog.LogRecorder_AggregatedLogsStream) error {
	return errors.NotImplemented("cannot aggregate syslogs")
}

type mockCommand struct{}

func (c *mockCommand) App() *cli.App {
	return nil
}

func (c *mockCommand) Init(opts ...cmd.Option) error {
	return nil
}

func (c *mockCommand) Options() cmd.Options {
	return cmd.Options{}
}
