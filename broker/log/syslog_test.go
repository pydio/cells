/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/log"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	server *SyslogServer
)

func init() {
	var err error

	server, err = NewSyslogServer("", "sysLog")
	if err != nil {
		panic("Failed to create Syslog server")
	}

}

func TestNewBleveEngine(t *testing.T) {

	Convey("Test all property indexation:\n", t, func() {
		logAsMap := json2map(sampleSyslog)
		err := server.PutLog(logAsMap)
		So(err, ShouldBeNil)

		results, err := server.ListLogs(fmt.Sprintf(`+%s:info`, common.KEY_LEVEL), 0, 1000)
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
	})

	Convey("Search a result", t, func() {
		results, err := server.ListLogs(
			fmt.Sprintf(
				`+%s:test +%s:INFO +%s:>1142080000`, // ~01.01.2006
				common.KEY_MSG,
				common.KEY_LEVEL,
				common.KEY_TS,
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

func log2json(level string, msg string) string {
	str := fmt.Sprintf(`{"ts": "%s", "level": "%s", "msg": "%s"}`, time.Now().Format(time.RFC3339), level, msg)
	return str
}

func log2map(level string, msg string) map[string]string {

	var data map[string]string
	str := fmt.Sprintf(`{"ts": "%s", "level": "%s", "msg": "%s"}`, time.Now().Format(time.RFC3339), level, msg)
	json.Unmarshal([]byte(str), &data)
	return data
}

func json2map(line string) map[string]string {
	var rawdata map[string]interface{}
	// var data map[string]string
	err := json.Unmarshal([]byte(line), &rawdata)
	if err != nil {
		fmt.Println(err)
	}

	data := make(map[string]string)
	for k, v := range rawdata {
		switch v := v.(type) {
		case string:
			data[k] = v
		default:
			fmt.Printf("Cannot unmarshall object for key %s\n", k)
		}
	}

	return data
}

const (
	sampleSyslog = `{"level":"info","ts":"2018-03-08T13:32:18+01:00","logger":"pydio.grpc.auth","msg":"Login", "RemoteAddress":"::1","UserAgent":"Mozilla/5.0","HttpProtocol":"HTTP/1.1","MsgId":"1","UserName":"jenny"}`
)
