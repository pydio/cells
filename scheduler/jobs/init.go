package jobs

import (
	"context"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/v4/common"
	config2 "github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
)

var (
	logger    *zap.Logger
	logSyncer *log.LogSyncer
)

func init() {
	log.SetTasksLoggerInit(initTasksLogger, func(ctx context.Context) {
		logSyncer = log.NewLogSyncer(ctx, common.ServiceJobs)
	})
}

func initTasksLogger() *zap.Logger {

	var syncers []zapcore.WriteSyncer

	if logSyncer != nil {
		// Logger that forwards the messages to a bleve DB via gRPC
		serverSync := zapcore.AddSync(logSyncer)
		syncers = append(syncers, serverSync)
	}

	logDir := config2.ApplicationWorkingDir(config2.ApplicationDirLogs)

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

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(config),
		w,
		zap.InfoLevel,
	)

	logger = zap.New(core)

	return logger
}
