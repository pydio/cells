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

package storage

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"text/template"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

// URLOpener represents types than can open Registries based on a URL.
// The opener must not modify the URL argument. OpenURL must be safe to
// call from multiple goroutines.
//
// This interface is generally implemented by types in driver packages.
type URLOpener interface {
	OpenURL(ctx context.Context, u *url.URL) (Storage, error)
}

// URLMux is a URL opener multiplexer. It matches the scheme of the URLs
// against a set of registered schemes and calls the opener that matches the
// URL's scheme.
// See https://gocloud.dev/concepts/urls/ for more information.
//
// The zero value is a multiplexer with no registered schemes.
type URLMux struct {
	schemes openurl.SchemeMap
	tmpl    template.Template
}

// Schemes returns a sorted slice of the registered schemes.
func (mux *URLMux) Schemes() []string { return mux.schemes.Schemes() }

// ValidScheme returns true if scheme has been registered.
func (mux *URLMux) ValidScheme(scheme string) bool { return mux.schemes.ValidScheme(scheme) }

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (mux *URLMux) Register(scheme string, opener URLOpener) {
	mux.schemes.Register("storage", "Storage", scheme, opener)
}

var _ Storage = (*wrappedStorage)(nil)

type wrappedStorage struct {
	Options
	Storage
}

type Options struct {
	id                 string
	name               string
	contextualizedKeys []string
	meta               map[string]string
}

func (w wrappedStorage) ID() string {
	return w.id
}

func (w wrappedStorage) Name() string {
	return w.name
}

func (w wrappedStorage) Metadata() map[string]string {
	return w.meta
}

type Option func(*Options)

func WithID(id string) Option {
	return func(o *Options) {
		o.id = id
	}
}

func WithName(name string) Option {
	return func(o *Options) {
		o.name = name
	}
}

func WithContextualizedKeys(key ...string) Option {
	return func(o *Options) {
		o.contextualizedKeys = append(o.contextualizedKeys, key...)
	}
}

// OpenStorage calls OpenURL with the URL parsed from urlstr.
// It is safe to call from multiple goroutines.
func (mux *URLMux) OpenStorage(ctx context.Context, urlstr string, opt ...Option) (Storage, error) {
	opts := Options{}
	for _, o := range opt {
		o(&opts)
	}

	for _, contextualizedKey := range opts.contextualizedKeys {
		if v := ctx.Value(contextualizedKey); v != nil {
			if vv, ok := v.(string); ok {
				opts.meta[contextualizedKey] = vv
			}
		}
	}

	b := strings.Builder{}
	tmpl, err := mux.tmpl.Clone()
	if err != nil {
		return nil, err
	}
	if _, err := tmpl.Parse(urlstr); err != nil {
		return nil, err
	}
	tmpl.Execute(&b, nil)
	fmt.Println(b.String())

	opener, u, err := mux.schemes.FromString("Storage", urlstr)
	if err != nil {
		return nil, err
	}

	st, err := opener.(URLOpener).OpenURL(ctx, u)
	if err != nil {
		return nil, err
	}

	return wrappedStorage{
		Options: opts,
		Storage: st,
	}, nil
}

var defaultURLMux = &URLMux{}

// DefaultURLMux returns the URLMux used by OpenTopic and OpenSubscription.
//
// Driver packages can use this to register their TopicURLOpener and/or
// SubscriptionURLOpener on the mux.
func DefaultURLMux() *URLMux {
	return defaultURLMux
}

// OpenStorage opens the Registry identified by the URL given.
// See the URLOpener documentation in driver subpackages for
// details on supported URL formats, and https://gocloud.dev/concepts/urls
// for more information.
func OpenStorage(ctx context.Context, urlstr string, opt ...Option) (Storage, error) {
	return defaultURLMux.OpenStorage(ctx, urlstr, opt...)
}
