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
	"github.com/pydio/cells/common/proto/docstore"
)

type Store interface {
	PutDocument(storeID string, doc *docstore.Document) error
	GetDocument(storeID string, docId string) (*docstore.Document, error)
	DeleteDocument(storeID string, docID string) error
	ListDocuments(storeID string, query *docstore.DocumentQuery) (chan *docstore.Document, chan bool, error)
	ListStores() ([]string, error)
	Close() error
}

type Indexer interface {
	IndexDocument(storeID string, doc *docstore.Document) error
	DeleteDocument(storeID string, docID string) error
	SearchDocuments(storeID string, query *docstore.DocumentQuery, countOnly bool) ([]string, int64, error)
	Reset() error
	Close() error
}
