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
	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/mapping"
	"github.com/blevesearch/bleve/v2/search"
	"github.com/blevesearch/bleve/v2/search/query"
	"github.com/pydio/cells/v4/common/utils/configx"
	"strings"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/log"
)

type BleveCodec struct {
	baseCodec
}

func (b *BleveCodec) Unmarshal(indexed interface{}) (interface{}, error) {
	data, ok := indexed.(*search.DocumentMatch)
	if !ok {
		return nil, fmt.Errorf("unexpected format for unmarshalling")
	}
	currMsg := &log.LogMessage{}
	b.unmarshallLogMsgFromFields(data.Fields, currMsg)
	return currMsg, nil
}

func (b *BleveCodec) BuildQuery(qu interface{}, offset, limit int32) (interface{}, interface{}, error) {
	queryString, ok := qu.(string)
	if !ok {
		return nil, nil, fmt.Errorf("unsupported query format")
	}
	var q query.Query
	if queryString == "" {
		q = bleve.NewMatchAllQuery()
	} else {
		qs := bleve.NewQueryStringQuery(queryString)
		q = qs
		// For +Msg field, transform MatchPhraseQuery to Wildcard query
		if parsed, e := qs.Parse(); e == nil {
			var changed bool
			if bQ, o := parsed.(*query.BooleanQuery); o {
				if cj, o2 := bQ.Must.(*query.ConjunctionQuery); o2 {
					for i, m := range cj.Conjuncts {
						if mp, o3 := m.(*query.MatchPhraseQuery); o3 && mp.Field() == "Msg" {
							phrase := mp.MatchPhrase
							if strings.Contains(phrase, " ") {
								match := query.NewMatchQuery(mp.MatchPhrase)
								match.SetField(mp.Field())
								match.SetBoost(mp.Boost())
								cj.Conjuncts[i] = match
							} else {
								match := query.NewWildcardQuery("*" + strings.ToLower(mp.MatchPhrase) + "*")
								match.SetField(mp.Field())
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
	req.From = int(offset)
	req.Size = int(limit)
	req.Fields = []string{"*"}

	return req, nil, nil
}

func (b *BleveCodec) GetModel(_ configx.Values) (interface{}, bool) {
	// Exclude JSONZaps from indexing
	logMapping := bleve.NewDocumentMapping()
	logMapping.AddFieldMapping(&mapping.FieldMapping{
		Type:  "text",
		Name:  "JsonZaps",
		Index: false,
		Store: true,
	})
	return logMapping, true
}

func (b *BleveCodec) unmarshallLogMsgFromFields(m map[string]interface{}, msg *log.LogMessage) {

	if val, ok := m["Ts"]; ok {
		ts := val.(float64)
		msg.Ts = int32(ts)
	}

	if val, ok := m["Level"]; ok {
		msg.Level = val.(string)
	}

	if val, ok := m["TransferSize"]; ok {
		if f, o := val.(float64); o {
			msg.TransferSize = int64(f)
		} else if i, o2 := val.(int64); o2 {
			msg.TransferSize = i
		}
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
