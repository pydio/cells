package http

import (
	"context"
	"net/http"
)

// IncomingContextModifier modifies context and returns a new context, true if context was modified, or an error
type IncomingContextModifier func(ctx context.Context) (context.Context, bool, error)

func ContextMiddlewareHandler(modifier IncomingContextModifier) func(http.Handler) http.Handler {
	return func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ct, _, err := modifier(r.Context())
			if err != nil {
				return
			}

			handler.ServeHTTP(w, r.WithContext(ct))
		})
	}
}
