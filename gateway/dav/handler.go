/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package dav

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"go.uber.org/zap"
	"golang.org/x/net/webdav"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/views"
)

type ValidUser struct {
	Hash      string
	Connexion time.Time
	Claims    claim.Claims
}

func logRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Logger(r.Context()).Debug("DAV LOGGER", zap.String("Method", r.Method), zap.String("path", r.URL.Path))
		handler.ServeHTTP(w, r)
	})
}

func startHttpServer(ctx context.Context, port int) {

	router := views.NewStandardRouter(views.RouterOptions{WatchRegistry: true, AuditEvent: true})
	basicAuthenticator := auth.NewBasicAuthenticator("Pydio WebDAV", time.Duration(20*time.Minute))

	fs := &FileSystem{
		Router: router,
		Debug:  true,
		mu:     sync.Mutex{},
	}

	dav := &webdav.Handler{
		FileSystem: fs,
		Prefix:     "/dav",
		LockSystem: webdav.NewMemLS(),
		Logger: func(r *http.Request, err error) {
			switch r.Method {
			case "COPY", "MOVE": // add relevant destination param when loggin an error
				dst := ""
				if u, err2 := url.Parse(r.Header.Get("Destination")); err2 == nil {
					dst = u.Path
				}
				if err == nil {
					log.Logger(ctx).Debug("DAV HANDLER", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.String("destination", dst))
				} else {
					log.Logger(ctx).Error("DAV HANDLER", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.String("destination", dst), zap.Error(err))
				}
			default:
				if err == nil {
					log.Logger(ctx).Debug("DAV HANDLER", zap.String("method", r.Method), zap.String("path", r.URL.Path))
				} else {
					log.Logger(ctx).Error("DAV HANDLER", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.Error(err))
				}
			}
		},
	}

	handler := basicAuthenticator.Wrap(logRequest(dav))
	http.ListenAndServe(fmt.Sprintf(":%d", port), handler)
}
