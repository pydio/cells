package indexer

import (
	"context"

	"github.com/pydio/cells/v4/common/utils/configx"
)

// DAO is a rich DAO with ready-to-use inserts + search capacities.
// It must be initialised with a proper DAO and a proper IndexCodex.
type DAO interface {
	// InsertOne stores one document. Write operations may be batched underneath.
	InsertOne(ctx context.Context, data interface{}) error
	// DeleteOne deletes one document. It can only be used if documents are providing IDs.
	DeleteOne(ctx context.Context, data interface{}) error
	// Flush triggers internal buffers to be written to storage
	Flush(ctx context.Context) error
	// DeleteMany deletes documents by a search query.
	DeleteMany(ctx context.Context, query interface{}) (int32, error)
	// FindMany sends a search query to indexer. A custom IndexCodex can be used to accumulate some information during results parsing.
	FindMany(ctx context.Context, query interface{}, offset, limit int32, customCodex IndexCodex) (chan interface{}, error)

	// TODO - this is bad
	Resync(ctx context.Context, logger func(string)) error
	Truncate(ctx context.Context, max int64, logger func(string)) error
}

// IndexCodex is the coder/decoder used by an Indexer.
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
	InsertOne(data interface{}) error
	DeleteOne(data interface{}) error
	Flush() error
	DeleteMany(ctx context.Context, query interface{}) (int32, error)
	FindMany(ctx context.Context, query interface{}, offset, limit int32, customCodex IndexCodex) (chan interface{}, error)

	// SetCodex sets the IndexCodex to be used for marshalling/unmarshalling data. Can be locally overriden during FindMany requests.
	SetCodex(c IndexCodex)
	GetCodex() IndexCodex

	// Resync should clear the index and rewrite it from scratch. Used by bolt implementations for defragmentation.
	Resync(ctx context.Context, logger func(string)) error
	// Truncate should free some disk space. Used by bleve implementation in conjunction with rotationSize parameter.
	Truncate(ctx context.Context, max int64, logger func(string)) error

	Open(ctx context.Context) error
	// Close closes the index connection
	Close(ctx context.Context) error
}

var _ DAO = (*dao)(nil)

type dao struct {
	Indexer
}

func NewDAO(db Indexer) DAO {
	return &dao{Indexer: db}
}

func (s *dao) InsertOne(ctx context.Context, data interface{}) error {
	return s.Indexer.InsertOne(data)
}

func (s *dao) DeleteOne(ctx context.Context, data interface{}) error {
	return s.Indexer.DeleteOne(data)
}

func (s *dao) Flush(c context.Context) error {
	return s.Indexer.Flush()
}

func (s *dao) DeleteMany(ctx context.Context, qu interface{}) (int32, error) {
	return s.Indexer.DeleteMany(ctx, qu)
}

func (s *dao) FindMany(ctx context.Context, query interface{}, offset, limit int32, customCodec IndexCodex) (chan interface{}, error) {
	return s.Indexer.FindMany(ctx, query, offset, limit, customCodec)
}

func (s *dao) Resync(ctx context.Context, logger func(string)) error {
	return s.Indexer.Resync(ctx, logger)
}

func (s *dao) Truncate(ctx context.Context, max int64, logger func(string)) error {
	return s.Indexer.Truncate(ctx, max, logger)
}
