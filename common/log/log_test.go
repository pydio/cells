// +build ignore

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
	"log"
	"testing"
	"time"

	// . "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/utils/mtree"
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
