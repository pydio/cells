package source

import (
	"context"

	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common/middleware"
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
