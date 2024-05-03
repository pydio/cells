/*
 * Copyright (c) 2018-2022. Abstrium SAS <team (at) pydio.com>
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

package prometheus

import (
	"context"
	"net/http"
	"net/url"

	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
)

func NewIndex(c context.Context) http.Handler {
	return &indexHandler{ctx: c}
}

type indexHandler struct {
	ctx context.Context
}

func (p *indexHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	var reg registry.Registry
	runtimecontext.Get(p.ctx, registry.ContextKey, &reg)

	externalURL := routing.GetDefaultSiteURL()
	u, _ := url.Parse(externalURL)
	targets := ProcessesAsTargets(p.ctx, reg, true, u.Host)
	writer.Header().Set("Content-Type", "application/json")
	jj, _ := targets.ToJson()
	writer.Write(jj)
	writer.WriteHeader(200)
	return

}
