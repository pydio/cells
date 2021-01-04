package log

import (
	"context"
	"fmt"
	"log"
	"testing"
	"time"

	// . "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/utils/mtree"
)

func TestLogMassiveObject(t *testing.T) {

	ctx := context.Background()

	// Forwards logs to the pydio.grpc.logs service to store them
	var syncers []zapcore.WriteSyncer
	syncers = append(syncers, zapcore.AddSync(log.Writer()))
	syncers = append(syncers, zapcore.AddSync(&lumberjack.Logger{
		Filename:   "/tmp/pydio.log",
		MaxSize:    10, // megabytes
		MaxBackups: 100,
		MaxAge:     28, // days
	}))
	syncers = append(syncers, zapcore.AddSync(NewLogSyncer(ctx, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_LOG)))

	config := zap.NewProductionEncoderConfig()
	config.EncodeTime = RFC3369TimeEncoder

	w := zapcore.NewMultiWriteSyncer(syncers...)
	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(config),
		w,
		zapcore.DebugLevel,
	)

	logger := zap.New(core)
	zap.RedirectStdLog(logger)

	defer logger.Sync()

	var nodes []*mtree.TreeNode
	for i := 0; i < 10000; i++ {
		node := mtree.NewTreeNode()
		node.Node.Uuid = fmt.Sprintf("testnode_%d", i)
		node.Node.Path = fmt.Sprintf("path/testnode_%d", i)

		nodes = append(nodes, node)
	}

	go logger.Info("The list of nodes is ", zap.Any("nodes", nodes))

	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And now the list is ")
	logger.Info("And the list after that ")

	//logger.Sync()

	<-time.After(10 * time.Second)

	fmt.Println("This is done")
}
