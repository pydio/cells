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

package docstore

import (
	"context"
	"os"
	"strings"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/index/scorch"
	"github.com/blevesearch/bleve/index/store/boltdb"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/docstore"
)

type BleveServer struct {
	// Internal Bleve database
	Engine bleve.Index
	// For Testing purpose : delete file after closing
	DeleteOnClose bool
	// Path to the DB file
	IndexPath string
}

func NewBleveEngine(bleveIndexPath string, deleteOnClose ...bool) (*BleveServer, error) {

	_, e := os.Stat(bleveIndexPath)
	var index bleve.Index
	var err error
	if e == nil {
		index, err = bleve.Open(bleveIndexPath)
	} else {
		index, err = bleve.NewUsing(bleveIndexPath, bleve.NewIndexMapping(), scorch.Name, boltdb.Name, nil)
	}
	if err != nil {
		return nil, err
	}
	del := false
	if len(deleteOnClose) > 0 && deleteOnClose[0] {
		del = true
	}
	return &BleveServer{
		Engine:        index,
		IndexPath:     bleveIndexPath,
		DeleteOnClose: del,
	}, nil

}

func (s *BleveServer) Close() error {

	err := s.Engine.Close()
	if s.DeleteOnClose {
		err = os.RemoveAll(s.IndexPath)
	}
	return err

}

func (s *BleveServer) IndexDocument(storeID string, doc *docstore.Document) error {

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

func (s *BleveServer) DeleteDocument(storeID string, docID string) error {

	return s.Engine.Delete(docID)

}

func (s *BleveServer) Reset() error {

	// List all nodes and remove them
	s.Engine.Close()
	if e := os.RemoveAll(s.IndexPath); e != nil {
		return e
	}
	var err error
	s.Engine, err = bleve.NewUsing(s.IndexPath, bleve.NewIndexMapping(), scorch.Name, boltdb.Name, nil)
	return err

}

func (s *BleveServer) SearchDocuments(storeID string, query *docstore.DocumentQuery, countOnly bool) ([]string, int64, error) {

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

	// TODO PASS CURSOR INFOS?
	if !countOnly {
		searchRequest.Size = int(100)
		searchRequest.From = int(0)
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
		if docErr != nil || doc == nil || doc.ID == "" {
			log.Logger(context.Background()).Debug("Skipping Document", zap.Any("doc", doc), zap.Error(docErr))
			continue
		}
		log.Logger(context.Background()).Debug("Sending Document", zap.Any("doc", doc))
		docs = append(docs, doc.ID)
	}

	return docs, int64(searchResult.Total), nil

}

func (s *BleveServer) escapeMetaValue(value string) string {

	r := strings.NewReplacer("-", "\\-", "~", "\\~", "*", "\\*", ":", "\\:", "/", "\\/", " ", "\\ ")
	return r.Replace(value)

}
