package jobs

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/log"
	rt "github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/otel"
)

var (
	closers []io.Closer
)

func init() {
	rt.RegisterEnvVariable("CELLS_JOBS_LOG_LEVEL", "info", "Log level used for scheduler jobs - to be used carefully as it may produce a large volume of logs.")
	log.SetTasksLoggerInit(initTasksLogger, func(ctx context.Context) {})
}

func initTasksLogger() *zap.Logger {

	level := "info"
	if os.Getenv("CELLS_JOBS_LOG_LEVEL") == "debug" {
		level = "debug"
	}
	logDir := rt.ApplicationWorkingDir(rt.ApplicationDirLogs)

	for _, cl := range closers {
		if er := cl.Close(); er != nil {
			fmt.Println("Error while closing", er.Error())
		}
	}

	cfg := []log.LoggerConfig{
		{
			Level:    level,
			Encoding: "json",
			Outputs: []string{
				"file://" + filepath.Join(logDir, "tasks.log"),
				"service:///?service=pydio.grpc.jobs",
			},
		},
	}
	var cores []zapcore.Core
	cores, closers, _ = log.LoadCores(context.Background(), otel.Service{}, cfg)
	return zap.New(zapcore.NewTee(cores...))
}
