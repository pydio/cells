package source

import (
	"context"
	"regexp"
	"strings"

	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/cache/gocache"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/std"
)

const (
	dataSourceServiceHeader = "datasource-srv"
	objectServiceHeader     = "object-srv"
	DatasourceTplKey        = "DataSource"
	ObjectServiceTplKey     = "Object"
)

type dsContextKey struct{}

type objContextKey struct{}

var (
	DataSourceContextKey    = dsContextKey{}
	ObjectServiceContextKey = objContextKey{}

	escIdx  = strings.ReplaceAll(common.ServiceDataIndexGRPC_, ".", "\\.")
	escObj  = strings.ReplaceAll(common.ServiceDataObjectsGRPC_, ".", "\\.")
	escSync = strings.ReplaceAll(common.ServiceDataSyncGRPC_, ".", "\\.")
	parser  = regexp.MustCompile(`^(` + escIdx + `|` + escObj + `|` + escSync + `)(.*)`)
)

func init() {

	// GRPC OUTGOING Modifier - directly injected in the ClientConn resolution
	grpc.RegisterServiceTransformer(func(ctx context.Context, serviceName string) (string, []string, bool) {
		matches := parser.FindStringSubmatch(serviceName)
		if len(matches) < 3 {
			return serviceName, nil, false
		}

		var hh []string
		prefix := matches[1]
		suffix := matches[2]
		switch prefix {
		case common.ServiceDataIndexGRPC_:
			hh = append(hh, dataSourceServiceHeader, suffix)
			serviceName = common.ServiceDataIndexGRPC
		case common.ServiceDataSyncGRPC_:
			hh = append(hh, dataSourceServiceHeader, suffix)
			serviceName = common.ServiceDataSyncGRPC
		case common.ServiceDataObjectsGRPC_:
			hh = append(hh, objectServiceHeader, suffix)
			serviceName = common.ServiceDataObjectsPeerGRPC
		}
		return serviceName, hh, true
	})

	// GRPC INCOMING - no need to add outgoing the OutgoingContext is directly patched in the CC resolution (see above)
	middleware.RegisterModifier(propagator.IncomingContextModifier(func(ctx context.Context) (context.Context, bool, error) {
		// Make sure to check meta first if IncomingContext is not set
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return ctx, false, nil
		}
		var update bool
		if t := md.Get(dataSourceServiceHeader); len(t) > 0 {
			update = true
			ds := t[len(t)-1]
			ctx = propagator.With(ctx, DataSourceContextKey, ds)
		}
		if t := md.Get(objectServiceHeader); len(t) > 0 {
			update = true
			ob := t[len(t)-1]
			ctx = propagator.With(ctx, ObjectServiceContextKey, ob)
		}
		return ctx, update, nil
	}))

	// DAO TEMPLATE
	openurl.RegisterTemplateInjector(func(ctx context.Context, m map[string]interface{}) error {
		m[DatasourceTplKey] = ""
		m[ObjectServiceTplKey] = ""
		var s, o string
		if ok := propagator.Get[string](ctx, DataSourceContextKey, &s); ok {
			m[DatasourceTplKey] = s
		}
		if ok := propagator.Get[string](ctx, ObjectServiceContextKey, &o); ok {
			m[ObjectServiceTplKey] = o
		}
		return nil
	})

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
	cleaner         func(context.Context, string, T) error
	contextKey      any
	servicePrefix   string
}

// NewResolver creates a new resolver with a SourcesProvider
func NewResolver[T any](ctxKey any, srvPrefix string, provider SourcesProvider) *Resolver[T] {
	return &Resolver[T]{
		cachePool:       gocache.MustOpenNonExpirableMemory(),
		sourcesProvider: provider,
		contextKey:      ctxKey,
		servicePrefix:   srvPrefix,
	}
}

// SetLoader provides the initializer for a given source
func (r *Resolver[T]) SetLoader(loader func(context.Context, string) (T, error)) {
	r.loader = loader
}

// SetCleaner registers a clean function to be called when a source is removed
func (r *Resolver[T]) SetCleaner(cleaner func(context.Context, string, T) error) {
	r.cleaner = cleaner
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
	var s string
	ok := propagator.Get[string](ctx, r.contextKey, &s)
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

// HeatCacheAndWatch use internal loader and SourcesProvider to put all data in cache. WatchOptions are used to start a watch on config
func (r *Resolver[T]) HeatCacheAndWatch(ctx context.Context, watchOpts ...configx.WatchOption) error {
	if r.loader == nil {
		return errors.WithMessage(errors.StatusInternalServerError, "cannot pre heat without a loader")
	}
	var errs []error
	for _, s := range r.sourcesProvider(ctx) {
		ctx = runtime.WithServiceName(ctx, r.servicePrefix+s)
		ctx = propagator.With(ctx, r.contextKey, s)
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
	if len(watchOpts) > 0 {
		go r.WatchConfig(ctx, watchOpts...)
	}
	return multierr.Combine(errs...)
}

// WatchConfig watches sources and triggers loader/cleaner for new/removed sources
func (r *Resolver[T]) WatchConfig(ctx context.Context, opts ...configx.WatchOption) {
	w, e := config.Watch(ctx, opts...)
	if e != nil {
		return
	}
	for {
		_, er := w.Next()
		if er != nil {
			break
		}
		newSources := r.sourcesProvider(ctx)
		ka, er := r.cachePool.Get(ctx)
		if er != nil {
			continue
		}
		var oldSources []string
		_ = ka.Iterate(func(key string, _ interface{}) {
			oldSources = append(oldSources, key)
		})
		add, remove := std.DiffSlices(oldSources, newSources)
		// Heat newly added values
		for _, a := range add {
			ctx = runtime.WithServiceName(ctx, r.servicePrefix+a)
			ctx = propagator.With(ctx, r.contextKey, a)
			log.Logger(ctx).Info("Config changed, heating and adding to cache " + a)
			if t, er := r.loader(ctx, a); er == nil {
				_ = ka.Set(a, t)
			}
		}
		// Clean and delete from cache removed values
		for _, rem := range remove {
			if r.cleaner == nil {
				_ = ka.Delete(rem)
				log.Logger(ctx).Info("Config changed, removed from cache " + rem)
				continue
			}
			var t T
			if ka.Get(rem, &t) {
				virtualService := r.servicePrefix + rem
				ctx = runtime.WithServiceName(ctx, virtualService)
				ctx = propagator.With(ctx, r.contextKey, rem)
				if ce := r.cleaner(ctx, rem, t); ce != nil {
					log.Logger(ctx).Error("Config changed, cannot clean resources for "+rem, zap.Error(ce))
					continue
				}
				// Remove versions key
				config.Del(ctx, "versions", virtualService)
				_ = config.Save(ctx, common.PydioSystemUsername, "Remove service version for "+virtualService)
				_ = ka.Delete(rem)
				log.Logger(ctx).Info("Config changed, cleaned and removed from cache " + rem)
			}
		}
	}
}
