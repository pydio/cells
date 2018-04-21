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

package servicecontext

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/micro/go-micro/metadata"
)

const (
	HttpMetaExtracted      = "HttpMetaExtracted"
	HttpMetaRemoteAddress  = "RemoteAddress"
	HttpMetaRequestMethod  = "RequestMethod"
	HttpMetaRequestURI     = "RequestURI"
	HttpMetaProtocol       = "HttpProtocol"
	HttpMetaUserAgent      = "UserAgent"
	HttpMetaContentType    = "ContentType"
	HttpMetaCoookiesString = "CookiesString"
	ClientTime             = "ClientTime"
	ServerTime             = "ServerTime"
)

// Try to extract as much HTTP metadata as possible and store it in context metadata
func HttpRequestInfoToMetadata(ctx context.Context, req *http.Request) context.Context {

	meta := metadata.Metadata{}
	if existing, ok := metadata.FromContext(ctx); ok {
		if _, already := existing[HttpMetaExtracted]; already {
			return ctx
		}
		for k, v := range existing {
			meta[k] = v
		}
	}
	meta[HttpMetaExtracted] = HttpMetaExtracted

	if req.RemoteAddr != "" {
		meta[HttpMetaRemoteAddress] = req.RemoteAddr
	}

	// TODO add client time and locale via JS on the client side and retrieve it here
	layout := "2006-01-02T15:04-0700"
	t := time.Now()
	meta[ServerTime] = t.Format(layout)
	meta[ClientTime] = t.Format(layout)

	if h, ok := req.Header["X-Forwarded-For"]; ok {
		forwarded := strings.Join(h, "")
		meta[HttpMetaRemoteAddress] = forwarded
	}
	// Override RemoteAddr if set by the php frontend
	if h, ok := req.Header["X-Pydio-Front-Client"]; ok {
		meta[HttpMetaRemoteAddress] = strings.Join(h, "")
	}
	if h, ok := req.Header["User-Agent"]; ok {
		meta[HttpMetaUserAgent] = strings.Join(h, "")
	}
	if h, ok := req.Header["Content-Type"]; ok {
		meta[HttpMetaContentType] = strings.Join(h, "")
	}
	if h, ok := req.Header["X-Pydio-Span-Id"]; ok {
		meta[SpanMetadataId] = strings.Join(h, "")
	}
	if h, ok := req.Header["X-Pydio-Session"]; ok && len(h) > 0 {
		meta["X-Pydio-Session"] = h[0]
	}
	if req.RequestURI != "" {
		meta[HttpMetaRequestURI] = req.RequestURI
	}
	if req.Method != "" {
		meta[HttpMetaRequestMethod] = req.Method
	}
	if req.Proto != "" {
		meta[HttpMetaProtocol] = req.Proto
	}
	if len(req.Cookies()) > 0 {
		var cString []string
		for _, c := range req.Cookies() {
			if c.String() != "" {
				cString = append(cString, c.String())
			}
		}
		meta[HttpMetaCoookiesString] = strings.Join(cString, "//")
	}

	return metadata.NewContext(ctx, meta)
}

// Extract data from request and put it in context Metadata field
func HttpMetaExtractorWrapper(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r = r.WithContext(HttpRequestInfoToMetadata(r.Context(), r))
		h.ServeHTTP(w, r)
	})
}
