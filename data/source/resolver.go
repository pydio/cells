package source

import (
	"context"

	"go.uber.org/multierr"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/cache/gocache"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

const (
	DatasourceHeader = "datasource"
)

type contextKey struct{}

var DatasourceContextKey = contextKey{}

func init() {
	// GRPC OUTGOING
	middleware.RegisterModifier(propagator.OutgoingContextModifier(func(ctx context.Context) context.Context {
		var ds string
		if propagator.Get[string](ctx, DatasourceContextKey, &ds) {
			ctx = metadata.AppendToOutgoingContext(ctx, DatasourceHeader, ds)
		}
		return ctx
	}))
	// GRPC INCOMING
	middleware.RegisterModifier(propagator.IncomingContextModifier(func(ctx context.Context) (context.Context, bool, error) {
		var ds string
		// Make sure to check meta first if IncomingContext is not set
		if ca, ok := propagator.CanonicalMeta(ctx, DatasourceHeader); ok {
			ds = ca
		} else if md, ok2 := metadata.FromIncomingContext(ctx); ok2 {
			if t := md.Get(DatasourceHeader); len(t) > 0 {
				ds = t[0]
			}
		}
		if ds != "" {
			ctx = propagator.With(ctx, DatasourceContextKey, ds)
			return ctx, true, nil
		} else {
			return ctx, false, nil
		}
	}))

	// DAO TEMPLATE
	openurl.RegisterTemplateInjector(func(ctx context.Context, m map[string]interface{}) error {
		m["DataSource"] = ""
		if ds, ok := DatasourceFromContext(ctx); ok {
			m["DataSource"] = ds
		}
		return nil
	})

}

// DatasourceFromContext resolves current datasource from context
func DatasourceFromContext(ctx context.Context) (string, bool) {
	var dsName string
	ok := propagator.Get[string](ctx, DatasourceContextKey, &dsName)
	return dsName, ok
}

// ListSources is a SourcesProvider returning *object.Datasource list
func ListSources(ctx context.Context) (sources []string) {
	for _, s := range config.ListSourcesFromConfig(ctx) {
		sources = append(sources, s.GetName())
	}
	return
}

// ListObjects is a SourcesProvider returning *object.MinioConfig list
func ListObjects(ctx context.Context) (objects []string) {
	for _, s := range config.ListMinioConfigsFromConfig(ctx) {
		objects = append(objects, s.GetName())
	}
	return
}

// SourcesProvider generates a source of keys based on context
type SourcesProvider func(ctx context.Context) []string

// Resolver is a util for iterating/resolving datasource injected in context
type Resolver[T any] struct {
	cachePool       *openurl.Pool[cache.Cache]
	sourcesProvider SourcesProvider
	loader          func(context.Context, string) (T, error)
}

// NewResolver creates a new resolver with a SourcesProvider
func NewResolver[T any](provider SourcesProvider) *Resolver[T] {
	return &Resolver[T]{
		cachePool:       gocache.MustOpenNonExpirableMemory(),
		sourcesProvider: provider,
	}
}

// SetLoader provides the initializer for a given source
func (r *Resolver[T]) SetLoader(loader func(context.Context, string) (T, error)) {
	r.loader = loader
}

// Register sets data in cache
func (r *Resolver[T]) cache(ctx context.Context, source string, data T) error {
	ka, er := r.cachePool.Get(ctx)
	if er != nil {
		return errors.WithMessage(errors.StatusInternalServerError, er.Error())
	}
	return ka.Set(source, data)
}

// Resolve tries to load from cache or using loader
func (r *Resolver[T]) Resolve(ctx context.Context) (T, error) {
	var t T
	s, ok := DatasourceFromContext(ctx)
	if !ok {
		return t, errors.WithMessage(errors.StatusInternalServerError, "cannot find source in context")
	}
	ka, er := r.cachePool.Get(ctx)
	if er != nil {
		return t, errors.WithMessage(errors.StatusInternalServerError, er.Error())
	}
	if ka.Get(s, &t) {
		return t, nil
	}
	if r.loader != nil {
		if t, er = r.loader(ctx, s); er == nil {
			_ = ka.Set(s, t)
		}
		return t, er
	}
	return t, errors.WithMessage(errors.StatusInternalServerError, "cannot find data for source "+s+" in cache")
}

// HeatCache use internal loader and SourcesProvider to put all data in cache
func (r *Resolver[T]) HeatCache(ctx context.Context) error {
	if r.loader == nil {
		return errors.WithMessage(errors.StatusInternalServerError, "cannot pre heat without a loader")
	}
	var errs []error
	for _, s := range r.sourcesProvider(ctx) {
		ctx = propagator.With(ctx, DatasourceContextKey, s)
		t, er := r.loader(ctx, s)
		if er != nil {
			errs = append(errs, er)
			continue
		}
		er = r.cache(ctx, s, t)
		if er != nil {
			errs = append(errs, er)
		}
	}
	return multierr.Combine(errs...)
}
