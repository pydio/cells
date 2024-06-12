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

package bleve

import (
	"context"
	"fmt"
	"strings"

	bleve "github.com/blevesearch/bleve/v2"
	"go.uber.org/zap"

	proto "github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/storage/boltdb"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/data/docstore"
)

var _ docstore.DAO = (*BleveServer)(nil)

func init() {
	docstore.Drivers.Register(NewBleveDAO)
}

func NewBleveDAO(boltDB boltdb.DB, bleveIndex bleve.Index) docstore.DAO {
	return NewBleveEngine(boltDB, bleveIndex)
}

type BleveServer struct {
	// Internal Bolt
	*BoltStore
	// Internal Bleve database
	Engine bleve.Index
}

func NewBleveEngine(db boltdb.DB, index bleve.Index) *BleveServer {
	bStore := &BoltStore{db: db}

	return &BleveServer{
		BoltStore: bStore,
		Engine:    index,
	}
}

func (s *BleveServer) PutDocument(ctx context.Context, storeID string, doc *proto.Document) error {

	if er := s.BoltStore.PutDocument(ctx, storeID, doc); er != nil {
		return er
	}

	if doc.IndexableMeta == "" {
		return nil
	}
	toIndex := make(map[string]interface{})
	err := json.Unmarshal([]byte(doc.IndexableMeta), &toIndex)
	if err != nil {
		return nil
	}
	toIndex["DOCSTORE_STORE_ID"] = storeID
	toIndex["DOCSTORE_DOC_ID"] = doc.GetID()
	if doc.GetOwner() != "" {
		toIndex["DOCSTORE_OWNER"] = doc.GetOwner()
	}
	log.Logger(context.Background()).Debug("IndexDocument", zap.Any("data", toIndex))
	err = s.Engine.Index(doc.GetID(), toIndex)
	if err != nil {
		return err
	}
	return nil
}

func (s *BleveServer) DeleteDocument(ctx context.Context, storeID string, docID string) error {

	if er := s.BoltStore.DeleteDocument(storeID, docID); er != nil {
		return er
	}

	return s.Engine.Delete(docID)

}

func (s *BleveServer) DeleteDocuments(ctx context.Context, storeID string, query *proto.DocumentQuery) (int, error) {
	var count int
	dd, _, e := s.search(storeID, query, false)
	if e != nil {
		return 0, e
	}
	for _, d := range dd {
		if e := s.DeleteDocument(ctx, storeID, d); e != nil {
			return 0, e
		}
		count++
	}
	return count, nil

}

func (s *BleveServer) Reset() error {

	//// List all nodes and remove them
	//s.Engine.Close()
	//if e := os.RemoveAll(s.IndexPath); e != nil {
	//	return e
	//}
	//var err error
	//s.Engine, err = bleve.NewUsing(s.IndexPath, bleve.NewIndexMapping(), scorch.Name, boltdb.Name, nil)
	//return err

	return nil
}

func (s *BleveServer) CountDocuments(ctx context.Context, storeID string, query *proto.DocumentQuery) (int, error) {
	if query == nil || query.MetaQuery == "" {
		return 0, fmt.Errorf("Provide a query for count")
	}
	docIds, _, err := s.search(storeID, query, true)
	if err != nil {
		return 0, err
	}
	return len(docIds), nil

}

func (s *BleveServer) QueryDocuments(ctx context.Context, storeID string, query *proto.DocumentQuery) (chan *proto.Document, error) {

	if query != nil && query.MetaQuery != "" {

		docIds, _, err := s.search(storeID, query, false)
		if err != nil {
			return nil, err
		}
		res := make(chan *proto.Document)
		go func() {
			for _, docId := range docIds {
				if doc, e := s.BoltStore.GetDocument(ctx, storeID, docId); e == nil && doc != nil {
					doc.ID = docId
					res <- doc
				}
			}
			close(res)
		}()
		return res, nil

	} else {

		return s.BoltStore.ListDocuments(storeID, query)

	}

}

func (s *BleveServer) search(storeID string, query *proto.DocumentQuery, countOnly bool) ([]string, int64, error) {

	parts := strings.Split(query.MetaQuery, " ")
	for i, p := range parts {
		if !strings.HasPrefix(p, "+") && !strings.HasPrefix(p, "-") {
			parts[i] = "+" + p
		}
	}

	parts = append(parts, " +DOCSTORE_STORE_ID:"+s.escapeMetaValue(storeID))
	if len(query.Owner) > 0 {
		parts = append(parts, " +DOCSTORE_OWNER:"+s.escapeMetaValue(query.Owner))
	}
	qStringQuery := bleve.NewQueryStringQuery(strings.Join(parts, " "))

	log.Logger(context.Background()).Debug("SearchDocuments", zap.Any("query", qStringQuery))
	searchRequest := bleve.NewSearchRequest(qStringQuery)

	if !countOnly {
		searchRequest.From = 0
		searchRequest.Size = 100
		if query.Offset > 0 {
			searchRequest.From = int(query.Offset)
		}
		if query.Limit > 0 {
			searchRequest.Size = int(query.Limit)
		}
	}

	docs := []string{}
	searchResult, err := s.Engine.Search(searchRequest)
	if err != nil {
		return docs, 0, err
	}
	log.Logger(context.Background()).Debug("SearchDocuments", zap.Any("result", searchResult))

	if countOnly {
		return nil, int64(searchResult.Total), nil
	}
	for _, hit := range searchResult.Hits {
		doc, docErr := s.Engine.Document(hit.ID)
		if docErr != nil || doc == nil || doc.ID() == "" {
			log.Logger(context.Background()).Debug("Skipping Document", zap.Any("doc", doc), zap.Error(docErr))
			continue
		}
		log.Logger(context.Background()).Debug("Sending Document", zap.Any("doc", doc))
		docs = append(docs, doc.ID())
	}

	return docs, int64(searchResult.Total), nil

}

func (s *BleveServer) escapeMetaValue(value string) string {

	r := strings.NewReplacer("-", "\\-", "~", "\\~", "*", "\\*", ":", "\\:", "/", "\\/", " ", "\\ ")
	return r.Replace(value)

}
