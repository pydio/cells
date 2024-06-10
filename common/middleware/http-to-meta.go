/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

// Package servicecontext performs context values read/write, generally through server or client wrappers
package middleware

import (
	"context"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/middleware/keys"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func init() {
	log.EncoderHttpMetaKeys = append(log.EncoderHttpMetaKeys,
		keys.HttpMetaRemoteAddress,
		keys.HttpMetaUserAgent,
		keys.HttpMetaContentType,
		keys.HttpMetaProtocol,
	)
}

// HttpRequestInfoToMetadata extracts as much HTTP metadata as possible and stores it in the context as metadata.
func HttpRequestInfoToMetadata(ctx context.Context, req *http.Request) context.Context {

	meta := map[string]string{}
	if existing, ok := propagator.FromContextRead(ctx); ok {
		if _, already := existing[keys.HttpMetaExtracted]; already {
			return ctx
		}
		for k, v := range existing {
			meta[k] = v
		}
	}
	meta[keys.HttpMetaExtracted] = keys.HttpMetaExtracted

	layout := "2006-01-02T15:04-0700"
	t := time.Now()
	meta[keys.ServerTime] = t.Format(layout)
	//TODO: Retrieve client time and locale and set it here.
	//Unfortunately this is not sent by HTTP Requests.
	//We currently use server time instead of client time.
	meta[keys.ClientTime] = t.Format(layout)

	meta[keys.HttpMetaHost] = req.Host
	if h, p, e := net.SplitHostPort(req.Host); e == nil {
		meta[keys.HttpMetaHostname] = h
		meta[keys.HttpMetaPort] = p
	}
	// We might want to also support new standard "Forwarded" header.
	if h, ok := req.Header["X-Forwarded-For"]; ok {
		ips := strings.Split(strings.Join(h, ""), ",")
		meta[keys.HttpMetaRemoteAddress] = ips[0]
	} else if req.RemoteAddr != "" {
		meta[keys.HttpMetaRemoteAddress] = req.RemoteAddr
	}

	if h, ok := req.Header["User-Agent"]; ok {
		meta[keys.HttpMetaUserAgent] = strings.Join(h, "")
	}
	if h, ok := req.Header["Content-Type"]; ok {
		meta[keys.HttpMetaContentType] = strings.Join(h, "")
	}
	for _, key := range common.XSpecialPydioHeaders {
		if h, ok := req.Header[key]; ok && len(h) > 0 {
			meta[key] = h[0]
		}
	}
	if req.RequestURI != "" {
		meta[keys.HttpMetaRequestURI] = req.RequestURI
	}
	if req.Method != "" {
		meta[keys.HttpMetaRequestMethod] = req.Method
	}
	if req.Proto != "" {
		meta[keys.HttpMetaProtocol] = req.Proto
	}
	if len(req.Cookies()) > 0 {
		var cString []string
		for _, c := range req.Cookies() {
			if c.String() != "" {
				cString = append(cString, c.String())
			}
		}
		meta[keys.HttpMetaCookiesString] = strings.Join(cString, "//")
	}

	return propagator.NewContext(ctx, meta)
}

// HttpWrapperMeta extracts data from the request and puts it in a context Metadata field.
func HttpWrapperMeta(ctx context.Context, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r = r.WithContext(HttpRequestInfoToMetadata(r.Context(), r))
		h.ServeHTTP(w, r)
	})
}

// HttpMetaFromGrpcContext extracts metadata from context that may have been
// passed along across services (meta name may be lowered cased)
func HttpMetaFromGrpcContext(ctx context.Context, name string) (string, bool) {
	if md, ok := propagator.FromContextRead(ctx); ok {
		if v, o := md[name]; o {
			return v, true
		} else if vs, os := md[strings.ToLower(name)]; os {
			return vs, true
		} else if vc, oc := md[strings.Title(strings.ToLower(name))]; oc {
			return vc, true
		}
	}
	return "", false
}
