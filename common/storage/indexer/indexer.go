package indexer

import (
	"context"

	"github.com/pydio/cells/v4/common/utils/configx"
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
	BuildQueryOptions(query interface{}, offset, limit int32) (interface{}, error)
}

type IndexIDProvider interface {
	IndexID() string
}

type Indexer interface {
	InsertOne(ctx context.Context, data interface{}) error
	DeleteOne(ctx context.Context, data interface{}) error
	DeleteMany(ctx context.Context, query interface{}) (int32, error)
	FindMany(ctx context.Context, query interface{}, offset, limit int32, sortFields string, sortDesc bool, customCodex IndexCodex) (chan interface{}, error)

	// SetCodex sets the IndexCodex to be used for marshalling/unmarshalling data. Can be locally overriden during FindMany requests.
	SetCodex(c IndexCodex)
	GetCodex() IndexCodex

	// Resync should clear the index and rewrite it from scratch. Used by bolt implementations for defragmentation.
	Resync(ctx context.Context, logger func(string)) error
	// Truncate should free some disk space. Used by bleve implementation in conjunction with rotationSize parameter.
	Truncate(ctx context.Context, max int64, logger func(string)) error

	NewBatch(ctx context.Context, options ...BatchOption) (Batch, error)

	// Init the underlying model
	Init(ctx context.Context, conf configx.Values) error
	// Close closes the index connection
	Close(ctx context.Context) error
}
