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
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/bleve"
	"github.com/pydio/cells/v4/common/dao/test"
	"github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func TestMessageRepository(t *testing.T) {

	idx, closer, err := test.OnFileTestDAO("bleve", filepath.Join(os.TempDir(), "logtest-"+uuid.New()+".bleve?mapping=log"), "", "logs_tests", true, NewDAO)
	if err != nil {
		panic(err)
	}
	server, err := NewIndexService(idx.(dao.IndexDAO))
	if err != nil {
		panic(err)
	}
	defer closer()

	Convey("Test all property indexation:\n", t, func() {
		err := server.PutLog(&log.Log{Message: []byte(sampleSyslog), Nano: int32(time.Now().UnixNano())})
		So(err, ShouldBeNil)
		// Wait for batch to be processed
		<-time.After(4 * time.Second)

		results, err := server.ListLogs(fmt.Sprintf(`+%s:info`, common.KeyLevel), 0, 1000)
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
		err := server.PutLog(log2map("INFO", "this is the first test"))
		So(err, ShouldBeNil)

		err2 := server.PutLog(log2map("INFO", "this is another test 2"))
		So(err2, ShouldBeNil)

		err3 := server.PutLog(log2map("INFO", "this is random"))
		So(err3, ShouldBeNil)

		err4 := server.PutLog(log2map("ERROR", "this is yet another test"))
		So(err4, ShouldBeNil)

		<-time.After(4 * time.Second)
	})

	Convey("Search a result", t, func() {
		results, err := server.ListLogs(
			fmt.Sprintf(
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

		// for result := range results {
		// 	count++
		// 	fmt.Printf("***** log record #%d\n ", count)
		// 	for k, v := range result {
		// 		fmt.Printf("key[%s] value[%s]\n", k, v)
		// 	}
		// }
		So(count, ShouldEqual, 2)
	})
}

func TestSizeRotation(t *testing.T) {
	bleve.UnitTestEnv = true
	Convey("Test Rotation", t, func() {
		p := filepath.Join(os.TempDir(), uuid.New(), "syslog.bleve")
		os.MkdirAll(filepath.Dir(p), 0777)
		fmt.Println("Storing temporary index in", p)

		dao, _ := bleve.NewDAO("bleve", p, "")
		idx, _ := bleve.NewIndexer(dao)
		idx.SetCodex(&BleveCodec{})
		idx.Init(configx.New())
		s, e := NewIndexService(idx)

		//s, e := bleve.NewSyslogServer(p, "sysLog", 1*1024*1024)
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
			s.PutLog(&log.Log{Message: data, Nano: int32(time.Now().UnixNano())})
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
			s.PutLog(&log.Log{Message: data, Nano: int32(time.Now().UnixNano())})
		}
		fmt.Println("Inserted 10020 other logs")

		<-time.After(5 * time.Second)

		/*
			TODO - Stats() endpoint on DAO ?
			indexPaths := s.listIndexes()
			So(indexPaths, ShouldHaveLength, 5)
			fmt.Println(indexPaths)

			dd, e := s.SearchIndex.DocCount()
			So(e, ShouldBeNil)
			So(dd, ShouldEqual, 20020)
		*/

		s.Close()
		<-time.After(5 * time.Second)

		// Re-open with same data and carry one feeding with logs

		dao, _ = bleve.NewDAO("bleve", p, "")
		idx, _ = bleve.NewIndexer(dao)
		idx.SetCodex(&BleveCodec{})
		idx.Init(configx.New())
		s, e = NewIndexService(idx)
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
			s.PutLog(&log.Log{Message: data, Nano: int32(time.Now().UnixNano())})
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
			s.PutLog(&log.Log{Message: data, Nano: int32(time.Now().UnixNano())})
		}

		<-time.After(5 * time.Second)
		/*
			// TODO V4 - DAO.Stats() ?
			dd, e = s.SearchIndex.DocCount()
			So(e, ShouldBeNil)
			So(dd, ShouldEqual, 40040)

			indexPaths = s.listIndexes()
			So(indexPaths, ShouldHaveLength, 9)
			fmt.Println(indexPaths)

			s.Resync(nil)
			<-time.After(5 * time.Second)

			indexPaths = s.listIndexes()
			So(indexPaths, ShouldHaveLength, 9)
			fmt.Println(indexPaths)
			dd, e = s.SearchIndex.DocCount()
			So(e, ShouldBeNil)
			So(dd, ShouldEqual, 40040)
		*/

		// Close and Clean
		s.Close()
		<-time.After(5 * time.Second)
		os.RemoveAll(filepath.Dir(p))

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
	sampleSyslog = `{"level":"info","ts":"2018-03-08T13:32:18+01:00","logger":"pydio.grpc.auth","msg":"Login", "RemoteAddress":"::1","UserAgent":"Mozilla/5.0","HttpProtocol":"HTTP/1.1","MsgId":"1","UserName":"jenny"}`
)
