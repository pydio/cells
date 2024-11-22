/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package indexer

import (
	"context"

	"github.com/pydio/cells/v5/common/utils/configx"
)

// IndexCodex is the coder/decoder used by an Indexer.
type IndexCodex interface {
	// Marshal prepares an document for storing in index
	Marshal(input interface{}) (interface{}, error)
	// Unmarshal decodes a document found in index
	Unmarshal(indexed interface{}) (interface{}, error)
	// BuildQuery prepares a query to be executed. It returns a request object and optionnaly an aggregationRequest object
	BuildQuery(query interface{}, offset, limit int32, sortFields string, sortDesc bool) (interface{}, interface{}, error)
	// GetModel reads initialization schema to be loaded
	GetModel(sc configx.Values) (interface{}, bool)
}

// FacetParser adds additional capacities to IndexCodex for understanding search results Facets
type FacetParser interface {
	UnmarshalFacet(data interface{}, facets chan interface{})
	FlushCustomFacets() []interface{}
}

// QueryOptionsProvider adds additional capacities to IndexCodex for building search Query
type QueryOptionsProvider interface {
	BuildQueryOptions(query interface{}, offset, limit int32, sortFields string, sortDesc bool) (interface{}, error)
}

// IndexIDProvider provides a method to retrieve a document unique ID
type IndexIDProvider interface {
	IndexID() string
}

// Indexer is a generic interface for storages supporting advanced search techniques
type Indexer interface {
	// InsertOne stores one document. Write operations may be batched underneath.
	InsertOne(ctx context.Context, data interface{}) error
	// DeleteOne deletes one document. It can only be used if documents are providing IDs.
	DeleteOne(ctx context.Context, data interface{}) error
	// DeleteMany deletes documents by a search query.
	DeleteMany(ctx context.Context, query interface{}) (int32, error)
	// FindMany sends a search query to indexer. A custom IndexCodex can be used to accumulate some information during results parsing.
	FindMany(ctx context.Context, query interface{}, offset, limit int32, sortFields string, sortDesc bool, customCodex IndexCodex) (chan interface{}, error)

	// Count performs a query and just get the total number of results
	// Count(ctx context.Context, query interface{}) (int, error)
	// Search performs a query
	//	Search(ctx context.Context, in any, out any) error

	// SetCodex sets the IndexCodex to be used for marshalling/unmarshalling data. Can be locally overriden during FindMany requests.
	SetCodex(c IndexCodex)
	GetCodex() IndexCodex

	// Resync should clear the index and rewrite it from scratch. Used by bolt implementations for defragmentation.
	Resync(ctx context.Context, logger func(string)) error
	// Truncate should free some disk space. Used by bleve implementation in conjunction with rotationSize parameter.
	Truncate(ctx context.Context, max int64, logger func(string)) error
	// Stats returns statistics about current indexer
	Stats(ctx context.Context) map[string]interface{}

	// NewBatch creates a batch for inserts/deletes
	NewBatch(ctx context.Context, options ...BatchOption) (Batch, error)

	// Init the underlying model
	Init(ctx context.Context, conf configx.Values) error
	// Close closes the index connection
	Close(ctx context.Context) error
	// CloseAndDrop closes the index and remove all resources
	CloseAndDrop(ctx context.Context) error
}
