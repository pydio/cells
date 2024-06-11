package openurl

import (
	"context"
	"net/url"
	"strings"
)

// URLOpener represents types than can open Registries based on a URL.
// The opener must not modify the URL argument. OpenURL must be safe to
// call from multiple goroutines.
//
// This interface is generally implemented by types in driver packages.
type URLOpener[T any] interface {
	Open(ctx context.Context, u *url.URL) (T, error)
}

// URLMux is a URL opener multiplexer. It matches the scheme of the URLs
// against a set of registered schemes and calls the opener that matches the
// URL's scheme.
// See https://gocloud.dev/concepts/urls/ for more information.
//
// The zero value is a multiplexer with no registered schemes.
type URLMux[T any] struct {
	api string

	schemes SchemeMap
}

// Schemes returns a sorted slice of the registered schemes.
func (mux *URLMux[T]) Schemes() []string { return mux.schemes.Schemes() }

// ValidScheme returns true if scheme has been registered.
func (mux *URLMux[T]) ValidScheme(scheme string) bool { return mux.schemes.ValidScheme(scheme) }

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (mux *URLMux[T]) Register(scheme string, opener URLOpener[T]) {
	mux.schemes.Register(mux.api, strings.ToTitle(mux.api), scheme, opener)
}

// OpenStore calls OpenURL with the URL parsed from urlstr.
// OpenStore is safe to call from multiple goroutines.
func (mux *URLMux[T]) Open(ctx context.Context, urlstr string) (T, error) {
	var t T
	opener, u, err := mux.schemes.FromString(mux.api, urlstr)
	if err != nil {
		return t, err
	}
	return opener.(URLOpener[T]).Open(ctx, u)
}

// Driver packages can use this to register their TopicURLOpener and/or
// SubscriptionURLOpener on the mux.
func NewURLMux[T any](api string) *URLMux[T] {
	return &URLMux[T]{api: api}
}
