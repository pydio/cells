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
	"context"

	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
)

var (
	Drivers = service.StorageDrivers{}
)

type DAO interface {
	PutDocument(ctx context.Context, storeID string, doc *docstore.Document) error
	GetDocument(ctx context.Context, storeID string, docId string) (*docstore.Document, error)
	DeleteDocument(ctx context.Context, storeID string, docID string) error
	DeleteDocuments(ctx context.Context, storeID string, query *docstore.DocumentQuery) (int, error)
	QueryDocuments(ctx context.Context, storeID string, query *docstore.DocumentQuery) (chan *docstore.Document, error)
	CountDocuments(ctx context.Context, storeID string, query *docstore.DocumentQuery) (int, error)
	ListStores(ctx context.Context) ([]string, error)
	CloseAndDrop(ctx context.Context) error
	Reset() error
}

func Migrate(ctx, fromCtx, toCtx context.Context, dryRun bool, status chan service.MigratorStatus) (map[string]int, error) {

	out := map[string]int{
		"Stores":    0,
		"Documents": 0,
	}
	var from, to DAO
	var e error
	if from, e = manager.Resolve[DAO](fromCtx); e != nil {
		return nil, e
	}
	if to, e = manager.Resolve[DAO](toCtx); e != nil {
		return nil, e
	}
	ss, e := from.ListStores(ctx)
	if e != nil {
		return nil, e
	}
	for _, store := range ss {
		docs, e := from.QueryDocuments(ctx, store, nil)
		if e != nil {
			return nil, e
		}
		for doc := range docs {
			if dryRun {
				out["Documents"]++
			} else if er := to.PutDocument(ctx, store, doc); er == nil {
				out["Documents"]++
			} else {
				continue
			}
		}
		out["Stores"]++
	}
	return out, nil
}
