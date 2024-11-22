//go:build storage

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

package dao

import (
	"context"
	"fmt"
	"testing"
	"time"

	log2 "github.com/pydio/cells/v5/broker/log"
	"github.com/pydio/cells/v5/broker/log/dao/bleve"
	"github.com/pydio/cells/v5/broker/log/dao/mongo"
	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/log"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"

	_ "github.com/pydio/cells/v5/common/storage/bleve"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		test.TemplateBleveWithPrefix(bleve.NewBleveDAO, "logs_test_"),
		test.TemplateMongoEnvWithPrefixAndIndexerCollection(mongo.NewMongoDAO, "test_broker_"+uuid.New()[:6]+"_", "syslog"),
	}
)

func listLogs(ctx context.Context, server log2.MessageRepository, query string, page, size int32) (ll []*log.LogMessage, err error) {
	results, err := server.ListLogs(ctx, query, page, size)
	if err != nil {
		return nil, err
	}
	for currResp := range results {
		ll = append(ll, currResp.GetLogMessage())
	}
	return
}

func TestMessageRepository(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mem, _ := config.OpenStore(ctx, "mem:///")
		ctx = propagator.With(ctx, config.ContextKey, mem)
		Convey("Test all property indexation:\n", t, func() {
			server, err := manager.Resolve[log2.MessageRepository](ctx)
			So(err, ShouldBeNil)
			So(server, ShouldNotBeNil)

			err = server.PutLog(ctx, &log.Log{Message: []byte(sampleSyslog), Nano: int32(time.Now().UnixNano())})
			So(err, ShouldBeNil)
			// Wait for batch to be processed
			<-time.After(4 * time.Second)

			// List All (empty query string)
			results, err := listLogs(ctx, server, "", 0, 100)
			So(err, ShouldBeNil)
			So(len(results), ShouldEqual, 1)

			// List With LogLevel Info
			results, err = listLogs(ctx, server, fmt.Sprintf(`+%s:info`, common.KeyLevel), 0, 100)
			So(err, ShouldBeNil)
			So(len(results), ShouldEqual, 1)

			// Check indexed values
			msg := results[0]
			So(msg.GetMsg(), ShouldEqual, "Login")
			So(msg.GetLevel(), ShouldEqual, "info")
			So(msg.GetLogger(), ShouldEqual, "pydio.grpc.auth")
			So(msg.GetTs(), ShouldEqual, int32(1520512338))
			So(msg.GetMsgId(), ShouldEqual, "1")
			So(msg.GetUserAgent(), ShouldEqual, "Mozilla/5.0")
			So(msg.GetRemoteAddress(), ShouldEqual, "::1")
			So(msg.GetHttpProtocol(), ShouldEqual, "HTTP/1.1")
			So(msg.GetUserName(), ShouldEqual, "jenny")
		})

		Convey("Basic technical log index tests:\n", t, func() {
			server, err := manager.Resolve[log2.MessageRepository](ctx)
			So(err, ShouldBeNil)
			So(server, ShouldNotBeNil)

			err = server.PutLog(ctx, log2map("INFO", "this is the first test"))
			So(err, ShouldBeNil)

			err2 := server.PutLog(ctx, log2map("INFO", "this is another test 2"))
			So(err2, ShouldBeNil)

			err3 := server.PutLog(ctx, log2map("INFO", "this is random"))
			So(err3, ShouldBeNil)

			err4 := server.PutLog(ctx, log2map("ERROR", "this is yet another test"))
			So(err4, ShouldBeNil)

			<-time.After(4 * time.Second)
		})

		Convey("Search a result", t, func() {
			server, err := manager.Resolve[log2.MessageRepository](ctx)
			So(err, ShouldBeNil)
			So(server, ShouldNotBeNil)

			results, err := listLogs(ctx, server, fmt.Sprintf(
				`+%s:*test* +%s:INFO +%s:>1142080000`, // ~01.01.2006
				common.KeyMsg,
				common.KeyLevel,
				common.KeyTs,
			), 0, 100)
			So(err, ShouldBeNil)
			So(len(results), ShouldEqual, 2)

			results, err = listLogs(ctx, server, fmt.Sprintf(
				`+%s:"*another test*" +%s:INFO +%s:>1142080000`,
				common.KeyMsg,
				common.KeyLevel,
				common.KeyTs,
			), 0, 100)
			So(err, ShouldBeNil)
			So(len(results), ShouldEqual, 1)

			// Test cursor
			results, err = listLogs(ctx, server, "", 0, 2)
			So(err, ShouldBeNil)
			So(len(results), ShouldEqual, 2)

			results, err = listLogs(ctx, server, "", 1, 2)
			So(err, ShouldBeNil)
			So(len(results), ShouldEqual, 2)

			results, err = listLogs(ctx, server, "", 2, 2)
			So(err, ShouldBeNil)
			So(len(results), ShouldEqual, 1)

		})
	})
}

func log2map(level string, msg string) *log.Log {

	str := fmt.Sprintf(`{"ts": "%s", "level": "%s", "msg": "%s"}`, time.Now().Format(time.RFC3339), level, msg)
	return &log.Log{
		Message: []byte(str),
		Nano:    int32(time.Now().UnixNano()),
	}
}

const (
	sampleSyslog = `{
	"level":"info",
	"ts":"2018-03-08T13:32:18+01:00",
	"logger":"pydio.grpc.auth",
	"msg":"Login", 
	"RemoteAddress":"::1",
	"UserAgent":"Mozilla/5.0",
	"HttpProtocol":"HTTP/1.1",
	"MsgId":"1",
	"UserName":"jenny",
	"UserUuid": "unique-user-uuid",
	"GroupPath":"/",
	"NodeUuid": "unique-node-uuid",
	"NodePath":"path/to/file.ext",
	"WsUuid": "unique-ws-uuid",
	"OperationUuid": "unique-operation-uuid",
	"OperationLabel": "Job Label",
	"SchedulerJobUuid": "unique-scheduler-job-uuid",
	"SchedulerTaskUuid": "unique-scheduler-task-uuid",
	"JsonZaps":"{\"encodedKey\":\"encodedValue\"}"
}`
)
