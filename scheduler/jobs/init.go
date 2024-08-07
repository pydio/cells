package jobs

import (
	"context"
	"io"
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	rt "github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/telemetry/otel"
)

func init() {
	rt.RegisterEnvVariable("CELLS_JOBS_LOG_LEVEL", "info", "Log level used for scheduler jobs - to be used carefully as it may produce a large volume of logs.")
	log.SetTasksLoggerInit(initTasksLogger, func(ctx context.Context) {})
}

func initTasksLogger(ctx context.Context) (*zap.Logger, []io.Closer) {

	level := "info"
	if os.Getenv("CELLS_JOBS_LOG_LEVEL") == "debug" {
		level = "debug"
	}
	logDir := rt.ApplicationWorkingDir(rt.ApplicationDirLogs)
	logDir += "{{ tenantPathWithBlank .Tenant \"default\" }}"

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
	cores, closers, _ := log.LoadCores(ctx, otel.Service{}, cfg)
	return zap.New(zapcore.NewTee(cores...)), closers
}
