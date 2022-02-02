package config

import (
	"context"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"net/url"
)

// URLOpener represents types than can open Registries based on a URL.
// The opener must not modify the URL argument. OpenURL must be safe to
// call from multiple goroutines.
//
// This interface is generally implemented by types in driver packages.
type URLOpener interface {
	OpenURL(ctx context.Context, u *url.URL) (Store, error)
}

// URLMux is a URL opener multiplexer. It matches the scheme of the URLs
// against a set of registered schemes and calls the opener that matches the
// URL's scheme.
// See https://gocloud.dev/concepts/urls/ for more information.
//
// The zero value is a multiplexer with no registered schemes.
type URLMux struct {
	schemes openurl.SchemeMap
}

// Schemes returns a sorted slice of the registered schemes.
func (mux *URLMux) Schemes() []string { return mux.schemes.Schemes() }

// ValidScheme returns true if scheme has been registered.
func (mux *URLMux) ValidScheme(scheme string) bool { return mux.schemes.ValidScheme(scheme) }

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (mux *URLMux) Register(scheme string, opener URLOpener) {
	mux.schemes.Register("config", "Config", scheme, opener)
}

// OpenStore calls OpenURL with the URL parsed from urlstr.
// OpenStore is safe to call from multiple goroutines.
func (mux *URLMux) OpenStore(ctx context.Context, urlstr string) (Store, error) {
	opener, u, err := mux.schemes.FromString("Config", urlstr)
	if err != nil {
		return nil, err
	}
	return opener.(URLOpener).OpenURL(ctx, u)
}


var defaultURLMux = &URLMux{}

// DefaultURLMux returns the URLMux used by OpenTopic and OpenSubscription.
//
// Driver packages can use this to register their TopicURLOpener and/or
// SubscriptionURLOpener on the mux.
func DefaultURLMux() *URLMux {
	return defaultURLMux
}

// OpenStore opens the Store identified by the URL given.
// See the URLOpener documentation in driver subpackages for
// details on supported URL formats, and https://gocloud.dev/concepts/urls
// for more information.
func OpenStore(ctx context.Context, urlstr string) (Store, error) {
	return defaultURLMux.OpenStore(ctx, urlstr)
}
