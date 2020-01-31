package jobs

import (
	"context"
	"path/filepath"
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/common"
	config2 "github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
)

var (
	once   = &sync.Once{}
	logger *zap.Logger
)

func init() {
	log.SetTasksLoggerInit(initTasksLogger)
}

func initTasksLogger() *zap.Logger {
	// Logger that forwards the messages to a bleve DB via gRPC
	serverSync := zapcore.AddSync(log.NewLogSyncer(context.Background(), common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS))

	logDir := config2.ApplicationWorkingDir(config2.ApplicationDirLogs)

	// Additional Logger: stores messages in local file
	rotaterSync := zapcore.AddSync(&lumberjack.Logger{
		Filename:   filepath.Join(logDir, "tasks.log"),
		MaxSize:    500, // megabytes
		MaxBackups: 3,
		MaxAge:     28, // days
	})

	w := zapcore.NewMultiWriteSyncer(
		serverSync,
		rotaterSync,
	)

	config := zap.NewProductionEncoderConfig()

	// This is important: rather use a standard format that is correctly handled by our gRPC layer as string
	// otherwise the Unix seconds float64 format triggers some glitches upon deserialization
	config.EncodeTime = log.RFC3369TimeEncoder

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(config),
		w,
		zap.InfoLevel,
	)

	logger = zap.New(core)

	return logger
}
