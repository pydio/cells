package jobs

import (
	"context"
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	lumberjack "gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/log/service"
	rt "github.com/pydio/cells/v4/common/runtime"
)

var (
	logger    *zap.Logger
	logSyncer *service.LogSyncer
)

func init() {
	rt.RegisterEnvVariable("CELLS_JOBS_LOG_LEVEL", "info", "Log level used for scheduler jobs - to be used carefully as it may produce a large volume of logs.")
	log.SetTasksLoggerInit(initTasksLogger, func(ctx context.Context) {
		logSyncer = service.NewLogSyncer(ctx, common.ServiceJobs)
	})
}

func initTasksLogger() *zap.Logger {

	var syncers []zapcore.WriteSyncer

	if logSyncer != nil {
		// Logger that forwards the messages to a bleve DB via gRPC
		serverSync := zapcore.AddSync(logSyncer)
		syncers = append(syncers, serverSync)
	}

	logDir := rt.ApplicationWorkingDir(rt.ApplicationDirLogs)

	// Additional Logger: stores messages in local file
	rotaterSync := zapcore.AddSync(&lumberjack.Logger{
		Filename:   filepath.Join(logDir, "tasks.log"),
		MaxSize:    10, // megabytes
		MaxBackups: 30,
		MaxAge:     28, // days
	})

	syncers = append(syncers, rotaterSync)

	w := zapcore.NewMultiWriteSyncer(syncers...)
	config := zap.NewProductionEncoderConfig()

	// This is important: rather use a standard format that is correctly handled by our gRPC layer as string
	// otherwise the Unix seconds float64 format triggers some glitches upon deserialization
	config.EncodeTime = log.RFC3369TimeEncoder

	level := zap.InfoLevel
	if os.Getenv("CELLS_JOBS_LOG_LEVEL") == "debug" {
		level = zap.DebugLevel
	}

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(config),
		w,
		level,
	)

	logger = zap.New(core)

	return logger
}
