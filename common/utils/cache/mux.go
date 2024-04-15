/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package cache

import (
	"context"
	"fmt"
	"net/url"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

// URLOpener represents types than can open Registries based on a URL.
// The opener must not modify the URL argument. OpenURL must be safe to
// call from multiple goroutines.
//
// This interface is generally implemented by types in driver packages.
type URLOpener interface {
	OpenURL(ctx context.Context, u *url.URL) (Cache, error)
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
	mux.schemes.Register("cache", "Cache", scheme, opener)
}

// OpenCache calls OpenURL with the URL parsed from urlstr.
// OpenTopic is safe to call from multiple goroutines.
func (mux *URLMux) OpenCache(ctx context.Context, urlstr string) (Cache, error) {
	opener, u, err := mux.schemes.FromString("Cache", urlstr)
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

// OpenCache opens a Cache identified by the URL given.
// See the URLOpener documentation in driver subpackages for
// details on supported URL formats, and https://gocloud.dev/concepts/urls
// for more information.
func OpenCache(ctx context.Context, urlstr string) (Cache, error) {
	return defaultURLMux.OpenCache(ctx, urlstr)
}

// OpenPool opens a Pool[Cache] using OpenCache as opener
func OpenPool(u string) (*openurl.Pool[Cache], error) {
	return openurl.OpenPool[Cache]([]string{u}, OpenCache)
}

// MustOpenPool opens a Pool[Cache] using OpenCache as opener, returns a discard:// cache on fail
func MustOpenPool(u string) *openurl.Pool[Cache] {
	p, e := openurl.OpenPool[Cache]([]string{u}, OpenCache)
	if e == nil {
		return p
	} else {
		fmt.Println("[WARN] cache.MustOpenPool failed with URL", u, "using a discard:// cache instead")
		p, _ = openurl.OpenPool[Cache]([]string{"discard://"}, OpenCache)
		return p
	}
}
