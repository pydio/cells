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

package net

import (
	net_http "net/http"
	"net/url"
	"strings"
)

// ExternalDomainFromRequest finds external URL based on request fields or headers
func ExternalDomainFromRequest(r *net_http.Request) *url.URL {

	u := &url.URL{}
	if h := r.Header.Get("X-Forwarded-Proto"); len(h) > 0 {
		u.Scheme = h
	} else if r.URL.Scheme != "" {
		u.Scheme = r.URL.Scheme
	} else {
		u.Scheme = "http"
	}

	if h := r.Header.Get("Host"); len(h) > 0 {
		u.Host = h
	} else if r.Host != "" {
		u.Host = r.Host
	} else if r.URL.Host != "" {
		u.Host = r.URL.Host
	} else if h := r.Header.Get("X-Forwarded-For"); len(h) > 0 {
		u.Host = strings.Split(h, ",")[0]
	}

	return u
}
