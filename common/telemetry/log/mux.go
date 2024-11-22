/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package log

import (
	"context"
	"io"
	"net/url"

	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common/telemetry/otel"
	"github.com/pydio/cells/v5/common/utils/openurl"
)

type CoreCloser interface {
	zapcore.Core
	io.Closer
}

type WriteSyncerCloser interface {
	zapcore.WriteSyncer
	io.Closer
}

// CoreURLOpener represents types than can open Registries based on a URL.
type CoreURLOpener interface {
	OpenCore(ctx context.Context, u *url.URL, level zapcore.LevelEnabler, svc otel.Service) (CoreCloser, error)
}

// SyncURLOpener implements WriteSyncerCloser opener
type SyncURLOpener interface {
	OpenSync(ctx context.Context, u *url.URL) (WriteSyncerCloser, error)
}

// URLMux is a URL opener multiplexer. It matches the scheme of the URLs
// against a set of registered schemes and calls the opener that matches the
// URL's scheme.
// See https://gocloud.dev/concepts/urls/ for more information.
//
// The zero value is a multiplexer with no registered schemes.
type URLMux struct {
	core openurl.SchemeMap
	sync openurl.SchemeMap
}

// RegisterCore registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (mux *URLMux) RegisterCore(scheme string, opener CoreURLOpener) {
	mux.core.Register("log", "Log", scheme, opener)
}

// OpenCore calls OpenURL with the URL parsed from urlstr.
// OpenStore is safe to call from multiple goroutines.
func (mux *URLMux) OpenCore(ctx context.Context, rawURL string, level zapcore.LevelEnabler, svc otel.Service) (CoreCloser, error) {
	opener, u, err := mux.core.FromString("Log", rawURL)
	if err != nil {
		return nil, err
	}
	return opener.(CoreURLOpener).OpenCore(ctx, u, level, svc)
}

// RegisterSync register an opener for a WriteSyncer
func (mux *URLMux) RegisterSync(scheme string, opener SyncURLOpener) {
	mux.sync.Register("sync", "Sync", scheme, opener)
}

// OpenSync calls OpenURL with the URL parsed from urlstr.
// OpenStore is safe to call from multiple goroutines.
func (mux *URLMux) OpenSync(ctx context.Context, rawURL string) (WriteSyncerCloser, error) {
	opener, u, err := mux.sync.FromString("Sync", rawURL)
	if err != nil {
		return nil, err
	}
	return opener.(SyncURLOpener).OpenSync(ctx, u)
}

var defaultURLMux = &URLMux{}

// DefaultURLMux returns the URLMux used by OpenTopic and OpenSubscription.
//
// Driver packages can use this to register their TopicURLOpener and/or
// SubscriptionURLOpener on the mux.
func DefaultURLMux() *URLMux {
	return defaultURLMux
}
