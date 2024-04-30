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
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "github.com/pydio/cells/v4/common/storage/bleve"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		{[]string{"bleve://" + filepath.Join(os.TempDir(), "logtest_"+uuid.New()+".bleve?mapping=log")}, true, NewBleveDAO},
		{[]string{os.Getenv("CELLS_TEST_MONGODB_DSN") + "?collection=logs_test"}, os.Getenv("CELLS_TEST_MONGODB_DSN") != "", NewMongoDAO},
	}
)

func TestMessageRepository(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context) {
		bg := context.Background()

		Convey("Test all property indexation:\n", t, func() {
			server, err := manager.Resolve[MessageRepository](ctx)
			So(err, ShouldBeNil)
			So(server, ShouldNotBeNil)

			err = server.PutLog(bg, &log.Log{Message: []byte(sampleSyslog), Nano: int32(time.Now().UnixNano())})
			So(err, ShouldBeNil)
			// Wait for batch to be processed
			<-time.After(4 * time.Second)

			results, err := server.ListLogs(bg, fmt.Sprintf(`+%s:info`, common.KeyLevel), 0, 1000)
			So(err, ShouldBeNil)
			var msg log.LogMessage

			// Insure the log has been indexed
			count := 0
			for currResp := range results {
				count++
				msg = *currResp.GetLogMessage()
			}
			So(count, ShouldEqual, 1)

			// Check indexed values
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
			server, err := manager.Resolve[MessageRepository](ctx)
			So(err, ShouldBeNil)
			So(server, ShouldNotBeNil)

			err = server.PutLog(bg, log2map("INFO", "this is the first test"))
			So(err, ShouldBeNil)

			err2 := server.PutLog(bg, log2map("INFO", "this is another test 2"))
			So(err2, ShouldBeNil)

			err3 := server.PutLog(bg, log2map("INFO", "this is random"))
			So(err3, ShouldBeNil)

			err4 := server.PutLog(bg, log2map("ERROR", "this is yet another test"))
			So(err4, ShouldBeNil)

			<-time.After(4 * time.Second)
		})

		Convey("Search a result", t, func() {
			server, err := manager.Resolve[MessageRepository](ctx)
			So(err, ShouldBeNil)
			So(server, ShouldNotBeNil)

			results, err := server.ListLogs(bg, fmt.Sprintf(
				`+%s:*test* +%s:INFO +%s:>1142080000`, // ~01.01.2006
				common.KeyMsg,
				common.KeyLevel,
				common.KeyTs,
			), 0, 1000)
			So(err, ShouldBeNil)

			count := 0
			// 	for _ = range results {
			for range results {
				count++
			}
			So(count, ShouldEqual, 2)
		})
	})
}

// TODO
/*
func TestSizeRotation(t *testing.T) {
	bleve.UnitTestEnv = true
	ctx := context.Background()
	Convey("Test Rotation", t, func() {
		p := filepath.Join(os.TempDir(), uuid.New(), "syslog.bleve")
		_ = os.MkdirAll(filepath.Dir(p), 0777)
		fmt.Println("Storing temporary index in", p)
		dsn := p + fmt.Sprintf("?mapping=log&batchSize=2500&rotationSize=%d", 1*1024*1024)

		dao, _ := bleve.NewDAO(ctx, "bleve", dsn, "")
		idx, _ := bleve.NewIndexer(ctx, dao)
		idx.SetCodex(&BleveCodec{})
		So(idx.Init(ctx, configx.New()), ShouldBeNil)
		s := NewIndexRepository(idx)

		So(e, ShouldBeNil)
		var i, k int
		for i = 0; i < 10000; i++ {
			line := map[string]string{
				"level":  "info",
				"ts":     time.Now().Format(time.RFC3339),
				"logger": "pydio.grpc.log",
				"MsgId":  "1",
				"msg":    fmt.Sprintf("Message number %d", i),
			}
			data, _ := json.Marshal(line)
			So(s.PutLog(ctx, &log.Log{Message: data, Nano: int32(time.Now().UnixNano())}), ShouldBeNil)
		}
		fmt.Println("Inserted 10000 logs")
		<-time.After(5 * time.Second)
		for k = i; k < i+10020; k++ {
			line := map[string]string{
				"level":  "info",
				"ts":     time.Now().Format(time.RFC3339),
				"logger": "pydio.grpc.log",
				"MsgId":  "1",
				"msg":    fmt.Sprintf("Message number %d", k),
			}
			data, _ := json.Marshal(line)
			So(s.PutLog(ctx, &log.Log{Message: data, Nano: int32(time.Now().UnixNano())}), ShouldBeNil)
		}
		fmt.Println("Inserted 10020 other logs")

		<-time.After(5 * time.Second)

		m := idx.Stats()
		So(m, ShouldNotBeNil)
		So(m["docsCount"], ShouldEqual, uint64(20020))
		So(m["indexes"], ShouldHaveLength, 9)

		s.Close(ctx)
		<-time.After(5 * time.Second)

		// Re-open with same data and carry one feeding with logs

		dao, _ = bleve.NewDAO(ctx, "bleve", dsn, "")
		idx, _ = bleve.NewIndexer(ctx, dao)
		idx.SetCodex(&BleveCodec{})
		_ = idx.Init(ctx, configx.New())
		s = NewIndexRepository(idx)
		So(e, ShouldBeNil)
		for i = 0; i < 10000; i++ {
			line := map[string]string{
				"level":  "info",
				"ts":     time.Now().Format(time.RFC3339),
				"logger": "pydio.grpc.log",
				"MsgId":  "1",
				"msg":    fmt.Sprintf("Message number %d", i),
			}
			data, _ := json.Marshal(line)
			_ = s.PutLog(ctx, &log.Log{Message: data, Nano: int32(time.Now().UnixNano())})
		}
		fmt.Println("Inserted 10000 logs")
		<-time.After(5 * time.Second)
		fmt.Println("Inserting 10020 other logs")
		for k = i; k < i+10020; k++ {
			line := map[string]string{
				"level":  "info",
				"ts":     time.Now().Format(time.RFC3339),
				"logger": "pydio.grpc.log",
				"MsgId":  "1",
				"msg":    fmt.Sprintf("Message number %d", k),
			}
			data, _ := json.Marshal(line)
			_ = s.PutLog(ctx, &log.Log{Message: data, Nano: int32(time.Now().UnixNano())})
		}

		<-time.After(5 * time.Second)

		m = idx.Stats()
		So(m, ShouldNotBeNil)
		So(m["docsCount"], ShouldEqual, uint64(40040))

		So(s.Resync(context.Background(), nil), ShouldBeNil)
		<-time.After(5 * time.Second)

		m = idx.Stats()
		So(m, ShouldNotBeNil)
		So(m["docsCount"], ShouldEqual, uint64(40040))
		parts := m["indexes"].([]string)
		So(len(parts), ShouldBeGreaterThan, 5)

		So(s.Truncate(context.Background(), 15*1024*1024, nil), ShouldBeNil)
		m = idx.Stats()
		newParts := m["indexes"].([]string)
		So(len(newParts), ShouldBeLessThan, len(parts))

		// Close and Clean
		_ = s.Close(ctx)
		<-time.After(5 * time.Second)
		_ = os.RemoveAll(filepath.Dir(p))

	})
}
*/
func log2map(level string, msg string) *log.Log {

	str := fmt.Sprintf(`{"ts": "%s", "level": "%s", "msg": "%s"}`, time.Now().Format(time.RFC3339), level, msg)
	return &log.Log{
		Message: []byte(str),
		Nano:    int32(time.Now().UnixNano()),
	}
}

const (
	sampleSyslog = `{"level":"info","ts":"2018-03-08T13:32:18+01:00","logger":"pydio.grpc.auth","msg":"Login", "RemoteAddress":"::1","UserAgent":"Mozilla/5.0","HttpProtocol":"HTTP/1.1","MsgId":"1","UserName":"jenny"}`
)
