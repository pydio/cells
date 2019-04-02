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
	"fmt"
	"strings"
	"time"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/document"
	"github.com/blevesearch/bleve/search/query"
	"github.com/rs/xid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/log"
	servicecontext "github.com/pydio/cells/common/service/context"
)

// IndexableLog extends default log.LogMessage struct to add index specific methods
type IndexableLog struct {
	log.LogMessage
}

// BlevePutLog stores a new log msg in a bleve index. It expects a map[string]string
// retrieved from a deserialized proto log message.
func BlevePutLog(idx bleve.Index, line map[string]string) error {

	msg, err := MarshallLogMsg(line)
	if err != nil {
		return err
	}

	err = idx.Index(xid.New().String(), msg)
	if err != nil {
		return err
	}
	return nil
}

// BleveListLogs queries the bleve index, based on the passed query string.
// It returns the results as a stream of log.ListLogResponse with the values of the indexed fields
// for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func BleveListLogs(idx bleve.Index, str string, page int32, size int32) (chan log.ListLogResponse, error) {

	//fmt.Printf("## [DEBUG] ## Query [%s] should execute \n", str)

	var q query.Query
	if str == "" {
		q = bleve.NewMatchAllQuery()
	} else {
		// re := regexp.MustCompile("\\+msg\\:")
		// str = re.ReplaceAllString(str, "")
		q = bleve.NewQueryStringQuery(str)
	}
	req := bleve.NewSearchRequest(q)
	req.SortBy([]string{"-" + common.KEY_TS})
	req.Size = int(size)
	req.From = int(page * size)

	sr, err := idx.Search(req)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	res := make(chan log.ListLogResponse)

	go func() {
		defer close(res)

		//fmt.Printf("## [DEBUG] ## Query [%s] successfully executed: found %d matches in %s\n", str, sr.Total, sr.Took)

		for _, hit := range sr.Hits {
			// fmt.Printf("## Hit#%d:\n", i)
			// fmt.Printf("%v\n", *hit)

			doc, err := idx.Document(hit.ID)
			if err != nil {
				continue
			}

			// create and populate a ListLogResult
			currMsg := &log.LogMessage{}
			UnmarshallLogMsgFromDoc(doc, currMsg)

			res <- log.ListLogResponse{LogMessage: currMsg}
		}
	}()
	return res, nil
}

// BleveDeleteLogs queries the bleve index, based on the passed query string and deletes the results
func BleveDeleteLogs(idx bleve.Index, str string) (int64, error) {

	//fmt.Printf("## [DEBUG] ## Delete Query [%s] should execute \n", str)

	var q query.Query
	if str == "" {
		return 0, fmt.Errorf("cannot pass an empty query for deletion")
	}
	q = bleve.NewQueryStringQuery(str)
	req := bleve.NewSearchRequest(q)
	req.Size = 30

	sr, err := idx.Search(req)
	if err != nil {
		fmt.Println(err)
		return 0, err
	}
	//fmt.Printf("Switching to a request of %d size \n", sr.Total)
	if sr.Total > 30 {
		req.Size = int(sr.Total)
		sr, _ = idx.Search(req)
	}
	var count int64
	b := idx.NewBatch()
	for _, hit := range sr.Hits {
		b.Delete(hit.ID)
		count++
	}

	return count, idx.Batch(b)
}

// MarshallLogMsg creates an IndexableLog object and populates the inner LogMessage with known fields of the passed JSON line.
func MarshallLogMsg(line map[string]string) (*IndexableLog, error) {

	msg := &IndexableLog{}

	for k, val := range line {
		switch k {
		case "ts":
			t, err := time.Parse(time.RFC3339, val)
			if err != nil {
				return nil, err
			}
			msg.Ts = convertTimeToTs(t)
		case "level":
			msg.Level = val
		case common.KEY_MSG_ID:
			msg.MsgId = val
		case "logger": // name of the service that is currently logging.
			msg.Logger = val
		// Node specific info
		case common.KEY_NODE_UUID:
			msg.NodeUuid = val
		case common.KEY_NODE_PATH:
			msg.NodePath = val
		case common.KEY_WORKSPACE_UUID:
			msg.WsUuid = val
		case common.KEY_WORKSPACE_SCOPE:
			msg.WsScope = val
		// User specific info
		case common.KEY_USERNAME:
			msg.UserName = val
		case common.KEY_USER_UUID:
			msg.UserUuid = val
		case common.KEY_GROUP_PATH:
			msg.GroupPath = val
		case common.KEY_ROLES:
			msg.RoleUuids = strings.Split(val, ",")
		case common.KEY_PROFILE:
			msg.Profile = val
		// Session and remote client info
		case servicecontext.HttpMetaRemoteAddress:
			msg.RemoteAddress = val
		case servicecontext.HttpMetaUserAgent:
			msg.UserAgent = val
		case servicecontext.HttpMetaProtocol:
			msg.HttpProtocol = val
		// Span enable following a given request between the various services
		case common.KEY_SPAN_UUID:
			msg.SpanUuid = val
		case common.KEY_SPAN_PARENT_UUID:
			msg.SpanParentUuid = val
		case common.KEY_SPAN_ROOT_UUID:
			msg.SpanRootUuid = val
		// Group messages for a given high level operation
		case common.KEY_OPERATION_UUID:
			msg.OperationUuid = val
		case common.KEY_OPERATION_LABEL:
			msg.OperationLabel = val
		default:
			break
		}
	}

	// Concatenate msg and error in the full text msg field.
	text := ""
	if m, ok := line["msg"]; ok {
		text = m
	}
	if m, ok := line["error"]; ok {
		text += " - " + m
	}
	msg.Msg = text

	return msg, nil
}

// UnmarshallLogMsgFromDoc populates the LogMessage from the passed bleve document.
func UnmarshallLogMsgFromDoc(doc *document.Document, msg *log.LogMessage) {
	// fmt.Printf("## [DEBUG] ## unmarshalling index document \n")
	m := make(map[string]interface{})
	fromBleveDocToMap(doc, m)

	if val, ok := m["Ts"]; ok {
		msg.Ts = val.(int32)
	}

	if val, ok := m["Level"]; ok {
		msg.Level = val.(string)
	}

	if val, ok := m["Logger"]; ok {
		msg.Logger = val.(string)
	}

	if val, ok := m["Msg"]; ok {
		msg.Msg = val.(string)
	}

	if val, ok := m["MsgId"]; ok {
		msg.MsgId = val.(string)
	}

	if val, ok := m["UserName"]; ok {
		msg.UserName = val.(string)
	}

	if val, ok := m["UserUuid"]; ok {
		msg.UserUuid = val.(string)
	}

	if val, ok := m["GroupPath"]; ok {
		msg.GroupPath = val.(string)
	}

	if val, ok := m["RemoteAddress"]; ok {
		msg.RemoteAddress = val.(string)
	}

	if val, ok := m["UserAgent"]; ok {
		msg.UserAgent = val.(string)
	}

	if val, ok := m["HttpProtocol"]; ok {
		msg.HttpProtocol = val.(string)
	}

	if val, ok := m["NodeUuid"]; ok {
		msg.NodeUuid = val.(string)
	}

	if val, ok := m["NodePath"]; ok {
		msg.NodePath = val.(string)
	}

	if val, ok := m["WsUuid"]; ok {
		msg.WsUuid = val.(string)
	}

	if val, ok := m[common.KEY_SPAN_UUID]; ok {
		msg.SpanUuid = val.(string)
	}
	if val, ok := m[common.KEY_SPAN_ROOT_UUID]; ok {
		msg.SpanRootUuid = val.(string)
	}
	if val, ok := m[common.KEY_SPAN_PARENT_UUID]; ok {
		msg.SpanParentUuid = val.(string)
	}
	if val, ok := m[common.KEY_OPERATION_UUID]; ok {
		msg.OperationUuid = val.(string)
	}
	if val, ok := m[common.KEY_OPERATION_LABEL]; ok {
		msg.OperationLabel = val.(string)
	}

}

func fromBleveDocToMap(doc *document.Document, m map[string]interface{}) {
	for _, field := range doc.Fields {
		// fmt.Printf("Mapping %s of type %s\n", field.Name(), reflect.TypeOf(field))
		switch field := field.(type) {
		case *document.TextField:
			m[field.Name()] = string(field.Value())
		case *document.NumericField:
			fNb, err := field.Number()
			iNb := int32(fNb)
			if err == nil {
				m[field.Name()] = iNb // fmt.Sprintf("%f", n)
			}
		case *document.DateTimeField:
			d, err := field.DateTime()
			if err == nil {
				m[field.Name()] = d.Format(time.RFC3339)
			}
		}
	}
}
