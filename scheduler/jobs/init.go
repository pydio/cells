package jobs

import (
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/common"
	config2 "github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
)

func init() {
	log.TasksLoggerImpl = initTasksLogger()
}

func initTasksLogger() *zap.Logger {
	if log.TasksLoggerImpl != nil {
		return log.TasksLoggerImpl
	}

	// Logger that forwards the messages to a bleve DB via gRPC
	serverSync := zapcore.AddSync(log.NewLogSyncer(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_JOBS))

	pydioDir := config2.ApplicationDataDir()
	os.MkdirAll(filepath.Join(pydioDir, "logs"), 0755)

	// Additional Logger: stores messages in local file
	rotaterSync := zapcore.AddSync(&lumberjack.Logger{
		Filename:   filepath.Join(pydioDir, "logs", "tasks.log"),
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

	return zap.New(core)
}
