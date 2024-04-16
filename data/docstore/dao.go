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

// Package docstore provides an indexed JSON document store.
//
// It is used by various services to store their data instead of implementing yet-another persistence layer.
// It uses a combination of Bolt for storage and Bleve for indexation.
package docstore

import (
	bleve "github.com/blevesearch/bleve/v2"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/pydio/cells/v4/common/proto/docstore"
)

type DAO interface {
	// dao.DAO
	PutDocument(storeID string, doc *docstore.Document) error
	GetDocument(storeID string, docId string) (*docstore.Document, error)
	DeleteDocument(storeID string, docID string) error
	DeleteDocuments(storeID string, query *docstore.DocumentQuery) (int, error)
	QueryDocuments(storeID string, query *docstore.DocumentQuery) (chan *docstore.Document, error)
	CountDocuments(storeID string, query *docstore.DocumentQuery) (int, error)
	ListStores() ([]string, error)
	Reset() error
}

var _ DAO = (*BleveServer)(nil)

func NewBleveDAO(db bleve.Index) DAO {
	//return NewBleveEngine(boltdb, bleveIndex)
}

func NewMongoDAO(db *mongo.Database) DAO {
	return &mongoImpl{Database: db}
}

//func Migrate(f dao.DAO, t dao.DAO, dryRun bool, status chan dao.MigratorStatus) (map[string]int, error) {
//	ctx := context.Background()
//	out := map[string]int{
//		"Stores":    0,
//		"Documents": 0,
//	}
//	var from, to DAO
//	if df, e := NewDAO(ctx, f); e == nil {
//		from = df.(DAO)
//	} else {
//		return out, e
//	}
//	if dt, e := NewDAO(ctx, t); e == nil {
//		to = dt.(DAO)
//	} else {
//		return out, e
//	}
//	ss, e := from.ListStores()
//	if e != nil {
//		return nil, e
//	}
//	for _, store := range ss {
//		docs, e := from.QueryDocuments(store, nil)
//		if e != nil {
//			return nil, e
//		}
//		for doc := range docs {
//			if dryRun {
//				out["Documents"]++
//			} else if er := to.PutDocument(store, doc); er == nil {
//				out["Documents"]++
//			} else {
//				continue
//			}
//		}
//		out["Stores"]++
//	}
//	return out, nil
//}
