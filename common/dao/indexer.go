package dao

import (
	"context"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type IndexCodex interface {
	// Marshal prepares an document for storing in index
	Marshal(input interface{}) (interface{}, error)
	// Unmarshal decodes a document found in index
	Unmarshal(indexed interface{}) (interface{}, error)
	// BuildQuery prepares a query to be executed. It returns a request object and optionnaly an aggregationRequest object
	BuildQuery(query interface{}, offset, limit int32) (interface{}, interface{}, error)
	// GetModel reads initialization schema to be loaded
	GetModel(sc configx.Values) (interface{}, bool)
}

type FacetParser interface {
	UnmarshalFacet(data interface{}, facets chan interface{})
	FlushCustomFacets() []interface{}
}

type QueryOptionsProvider interface {
	BuildQueryOptions(query interface{}, offset, limit int32) (interface{}, error)
}

type IndexIDProvider interface {
	IndexID() string
}

type IndexDAO interface {
	DAO
	InsertOne(ctx context.Context, data interface{}) error
	DeleteOne(ctx context.Context, data interface{}) error
	Flush()
	DeleteMany(ctx context.Context, query interface{}) (int32, error)
	FindMany(ctx context.Context, query interface{}, offset, limit int32, customCodec IndexCodex) (chan interface{}, error)
	Resync(logger func(string)) error
	Truncate(max int64, logger func(string)) error
	Close() error

	SetCodex(c IndexCodex)
}
