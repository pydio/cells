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
	"net/http"
	"net/url"
	"path"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"golang.org/x/net/webdav"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

type ValidUser struct {
	Hash      string
	Connexion time.Time
	Claims    claim.Claims
}

func logRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := servicecontext.WithServiceName(r.Context(), common.ServiceGatewayDav)
		r = r.WithContext(c)
		log.Logger(c).Debug("-- DAV ENTER", zap.String("Method", r.Method), zap.String("path", r.URL.Path))
		handler.ServeHTTP(w, r)
	})
}

func newHandler(ctx context.Context, prefix string, router nodes.Handler, withBasicRealm ...string) http.Handler {

	fs := &FileSystem{
		Router: router,
		Debug:  true,
		mu:     &sync.Mutex{},
	}

	memLs := NewMemLS()

	dav := &webdav.Handler{
		FileSystem: fs,
		Prefix:     prefix,
		LockSystem: memLs,
		Logger: func(r *http.Request, err error) {
			if strings.HasPrefix(path.Base(r.URL.Path), ".") {
				// Ignore dot files
				return
			}
			switch r.Method {
			case "COPY", "MOVE": // add relevant destination param when loggin an error
				dst := ""
				if u, err2 := url.Parse(r.Header.Get("Destination")); err2 == nil {
					dst = u.Path
				}
				if err == nil {
					clean := memLs.(*memLS).Delete(time.Now(), strings.TrimPrefix(r.URL.Path, "/dav"))
					if clean {
						log.Logger(ctx).Info("| - DAV END | Cleaned lock Copy or Move", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.String("destination", dst))
					} else {
						log.Logger(ctx).Debug("|- DAV END", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.String("destination", dst))
					}

				} else {
					log.Logger(ctx).Error("|- DAV END", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.String("destination", dst), zap.Error(err))
				}
			case "DELETE":
				if err != nil {
					log.Logger(ctx).Error("|- DAV END", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.Error(err))
				} else {
					clean := memLs.(*memLS).Delete(time.Now(), strings.TrimPrefix(r.URL.Path, "/dav"))
					if clean {
						log.Logger(ctx).Info("| - DAV END | Cleaned lock after DELETE", zap.String("method", r.Method), zap.String("path", r.URL.Path))
					} else {
						log.Logger(ctx).Debug("|- DAV END", zap.String("method", r.Method), zap.String("path", r.URL.Path))
					}
				}
			default:
				if err == nil || (r.Method == "PROPFIND" && err.Error() == "file does not exist") {
					log.Logger(ctx).Debug("|- DAV END", zap.String("method", r.Method), zap.String("path", r.URL.Path))
				} else {
					log.Logger(ctx).Error("|- DAV END", zap.String("method", r.Method), zap.String("path", r.URL.Path), zap.Error(err))
				}
			}
		},
	}

	h := logRequest(dav)
	if len(withBasicRealm) > 0 {
		basicAuthenticator := auth.NewBasicAuthenticator(withBasicRealm[0], 10*time.Minute)
		h = basicAuthenticator.Wrap(h)
	}
	return servicecontext.HttpWrapperMeta(ctx, h)
}
