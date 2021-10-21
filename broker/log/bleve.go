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
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/search/query"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/log"
	servicecontext "github.com/pydio/cells/common/service/context"
)

// IndexableLog extends default log.LogMessage struct to add index specific methods
type IndexableLog struct {
	Nano int
	log.LogMessage
}

// BlevePutLog stores a new log msg in a bleve index. It expects a map[string]string
// retrieved from a deserialized proto log message.
/*
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
*/

func BleveDuplicateIndex(from bleve.Index, inserts chan interface{}, logger func(string)) error {

	var q query.Query
	q = bleve.NewMatchAllQuery()
	req := bleve.NewSearchRequest(q)
	req.Size = 5000
	page := 0

	for {

		logger(fmt.Sprintf("Reindexing logs from page %d\n", page))
		req.From = page * req.Size
		req.Fields = []string{"*"}
		sr, err := from.Search(req)
		if err != nil {
			fmt.Println(err)
			return err
		}
		for _, hit := range sr.Hits {
			currMsg := &log.LogMessage{}
			UnmarshallLogMsgFromFields(hit.Fields, currMsg)
			inserts <- &IndexableLog{LogMessage: *currMsg}
		}
		if sr.Total <= uint64((page+1)*req.Size) {
			break
		}
		page++

	}

	return nil
}

// BleveListLogs queries the bleve index, based on the passed query string.
// It returns the results as a stream of log.ListLogResponse with the values of the indexed fields
// for each corresponding hit.
// Results are ordered by descending timestamp rather than by score.
func BleveListLogs(idx bleve.Index, str string, page int32, size int32) (chan log.ListLogResponse, error) {

	var q query.Query
	if str == "" {
		q = bleve.NewMatchAllQuery()
	} else {
		qs := bleve.NewQueryStringQuery(str)
		q = qs
		if parsed, e := qs.Parse(); e == nil {
			var changed bool
			if bQ, o := parsed.(*query.BooleanQuery); o {
				if cj, o2 := bQ.Must.(*query.ConjunctionQuery); o2 {
					for i, m := range cj.Conjuncts {
						if mp, o3 := m.(*query.MatchPhraseQuery); o3 {
							phrase := mp.MatchPhrase
							if strings.Contains(phrase, " ") {
								match := query.NewMatchQuery(mp.MatchPhrase)
								match.SetField(match.FieldVal)
								match.SetBoost(mp.Boost())
								cj.Conjuncts[i] = match
							} else {
								match := query.NewWildcardQuery("*" + mp.MatchPhrase + "*")
								match.SetField(match.FieldVal)
								match.SetBoost(mp.Boost())
								cj.Conjuncts[i] = match
							}
							changed = true
						}
					}
				}
			}
			if changed {
				q = parsed
			}
		}
	}
	req := bleve.NewSearchRequest(q)
	req.SortBy([]string{"-" + common.KeyTs, "-" + common.KeyNano})
	req.Size = int(size)
	req.Fields = []string{"*"}
	req.From = int(page * size)

	sr, err := idx.Search(req)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	res := make(chan log.ListLogResponse)

	go func() {
		defer close(res)

		for _, hit := range sr.Hits {
			// create and populate a ListLogResult
			currMsg := &log.LogMessage{}
			UnmarshallLogMsgFromFields(hit.Fields, currMsg)
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
	req.Size = 1000
	var count int64

	for {
		sr, err := idx.Search(req)
		if err != nil {
			fmt.Println(err)
			return 0, err
		}
		b := idx.NewBatch()
		for _, hit := range sr.Hits {
			b.Delete(hit.ID)
			count++
		}
		if err := idx.Batch(b); err != nil {
			return count, err
		}
		if sr.Total <= uint64(req.Size) {
			break
		}
	}

	return count, nil
}

// MarshallLogMsg creates an IndexableLog object and populates the inner LogMessage with known fields of the passed JSON line.
func MarshallLogMsg(line *log.Log) (*IndexableLog, error) {

	msg := &IndexableLog{}
	zaps := make(map[string]interface{})
	var data map[string]interface{}
	e := json.Unmarshal(line.Message, &data)
	if e != nil {
		return nil, e
	}

	for k, v := range data {
		val, _ := v.(string)
		switch k {
		case "ts":
			t, err := time.Parse(time.RFC3339, val)
			if err != nil {
				return nil, err
			}
			msg.Ts = convertTimeToTs(t)
		case "level":
			msg.Level = val
		case common.KeyMsgId:
			msg.MsgId = val
		case "logger": // name of the service that is currently logging.
			msg.Logger = val
		// Node specific info
		case common.KeyNodeUuid:
			msg.NodeUuid = val
		case common.KeyNodePath:
			msg.NodePath = val
		case common.KeyWorkspaceUuid:
			msg.WsUuid = val
		case common.KeyWorkspaceScope:
			msg.WsScope = val
		// User specific info
		case common.KeyUsername:
			msg.UserName = val
		case common.KeyUserUuid:
			msg.UserUuid = val
		case common.KeyGroupPath:
			msg.GroupPath = val
		case common.KeyRoles:
			msg.RoleUuids = strings.Split(val, ",")
		case common.KeyProfile:
			msg.Profile = val
		// Session and remote client info
		case servicecontext.HttpMetaRemoteAddress:
			msg.RemoteAddress = val
		case servicecontext.HttpMetaUserAgent:
			msg.UserAgent = val
		case servicecontext.HttpMetaProtocol:
			msg.HttpProtocol = val
		// Span enable following a given request between the various services
		case common.KeySpanUuid:
			msg.SpanUuid = val
		case common.KeySpanParentUuid:
			msg.SpanParentUuid = val
		case common.KeySpanRootUuid:
			msg.SpanRootUuid = val
		// Group messages for a given high level operation
		case common.KeyOperationUuid:
			msg.OperationUuid = val
		case common.KeyOperationLabel:
			msg.OperationLabel = val
		case common.KeySchedulerJobId:
			msg.SchedulerJobUuid = val
		case common.KeySchedulerTaskId:
			msg.SchedulerTaskUuid = val
		case common.KeySchedulerActionPath:
			msg.SchedulerTaskActionPath = val
		case "msg", "error":
			break
		default:
			zaps[k] = v
			break
		}
	}

	// Concatenate msg and error in the full text msg field.
	text := ""
	if m, ok := data["msg"]; ok {
		text = m.(string)
	}
	if m, ok := data["error"]; ok {
		text += " - " + m.(string)
	}
	msg.Msg = text
	msg.Nano = int(line.Nano)

	if len(zaps) > 0 {
		data, _ := json.Marshal(zaps)
		msg.JsonZaps = string(data)
	}

	return msg, nil
}

func UnmarshallLogMsgFromFields(m map[string]interface{}, msg *log.LogMessage) {

	if val, ok := m["Ts"]; ok {
		ts := val.(float64)
		msg.Ts = int32(ts)
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

	if val, ok := m["MsgId"]; ok && val.(string) != "" {
		msg.MsgId = val.(string)
	}

	if val, ok := m["UserName"]; ok && val.(string) != "" {
		msg.UserName = val.(string)
	}

	if val, ok := m["UserUuid"]; ok && val.(string) != "" {
		msg.UserUuid = val.(string)
	}

	if val, ok := m["GroupPath"]; ok && val.(string) != "" {
		msg.GroupPath = val.(string)
	}

	if val, ok := m["RemoteAddress"]; ok && val.(string) != "" {
		msg.RemoteAddress = val.(string)
	}

	if val, ok := m["UserAgent"]; ok && val.(string) != "" {
		msg.UserAgent = val.(string)
	}

	if val, ok := m["HttpProtocol"]; ok && val.(string) != "" {
		msg.HttpProtocol = val.(string)
	}

	if val, ok := m["NodeUuid"]; ok && val.(string) != "" {
		msg.NodeUuid = val.(string)
	}

	if val, ok := m["NodePath"]; ok && val.(string) != "" {
		msg.NodePath = val.(string)
	}

	if val, ok := m["WsUuid"]; ok && val.(string) != "" {
		msg.WsUuid = val.(string)
	}

	if val, ok := m[common.KeySpanUuid]; ok && val.(string) != "" {
		msg.SpanUuid = val.(string)
	}
	if val, ok := m[common.KeySpanRootUuid]; ok && val.(string) != "" {
		msg.SpanRootUuid = val.(string)
	}
	if val, ok := m[common.KeySpanParentUuid]; ok && val.(string) != "" {
		msg.SpanParentUuid = val.(string)
	}
	if val, ok := m[common.KeyOperationUuid]; ok && val.(string) != "" {
		msg.OperationUuid = val.(string)
	}
	if val, ok := m[common.KeyOperationLabel]; ok && val.(string) != "" {
		msg.OperationLabel = val.(string)
	}
	if val, ok := m[common.KeySchedulerJobId]; ok && val.(string) != "" {
		msg.SchedulerJobUuid = val.(string)
	}
	if val, ok := m[common.KeySchedulerTaskId]; ok && val.(string) != "" {
		msg.SchedulerTaskUuid = val.(string)
	}
	if val, ok := m[common.KeySchedulerActionPath]; ok && val.(string) != "" {
		msg.SchedulerTaskActionPath = val.(string)
	}
	if val, ok := m["JsonZaps"]; ok && val.(string) != "" {
		msg.JsonZaps = val.(string)
	}

}
