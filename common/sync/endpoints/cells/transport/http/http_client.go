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

package http

import (
	"crypto/tls"
	"net/http"

	"github.com/pydio/cells/common/sync/endpoints/cells/transport"
)

// GetHttpClient provides an option to rather use an http client that ignore SSL certificate issues.
func GetHttpClient(sdkConfig *transport.SdkConfig) *http.Client {

	t := http.DefaultTransport
	if sdkConfig.SkipVerify {
		t = &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired SSL certificates
		}
	}
	if sdkConfig.CustomHeaders != nil && len(sdkConfig.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{
			rt:      t,
			Headers: sdkConfig.CustomHeaders,
		}
	}
	return &http.Client{Transport: t}
}

type customHeaderRoundTripper struct {
	rt      http.RoundTripper
	Headers map[string]string
}

func (c customHeaderRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	for k, v := range c.Headers {
		req.Header.Set(k, v)
	}
	return c.rt.RoundTrip(req)
}
