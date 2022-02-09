package dao

import (
	"context"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type IndexCodec interface {
	// Marshal prepares an document for storing in index
	Marshal(input interface{}) (interface{}, error)
	// Unmarshal decodes a document found in index
	Unmarshal(indexed interface{}) (interface{}, error)
	// BuildQuery prepares a query to be executed. It returns a request object and optionnaly an aggregationRequest object
	BuildQuery(query interface{}, offset, limit int32, facets ...interface{}) (interface{}, interface{}, error)
	// GetModel reads initialization schema to be loaded
	GetModel(sc configx.Values) (interface{}, bool)
}

type FacetParser interface {
	UnmarshalFacet(data interface{}, facets chan interface{})
	FlushCustomFacets() []interface{}
}

type QueryOptionsProvider interface {
	BuildQueryOptions(query interface{}, offset, limit int32, facets ...interface{}) (interface{}, error)
}

type IndexIDProvider interface {
	IndexID() string
}

type IndexDAO interface {
	DAO
	InsertOne(data interface{}) error
	DeleteOne(data interface{}) error
	Flush()
	DeleteMany(query interface{}) (int32, error)
	FindMany(ctx context.Context, query interface{}, offset, limit int32, customCodec IndexCodec, facets ...interface{}) (chan interface{}, error)
	Resync(logger func(string)) error
	Truncate(max int64, logger func(string)) error
	Close() error

	SetCodec(c IndexCodec)
}
