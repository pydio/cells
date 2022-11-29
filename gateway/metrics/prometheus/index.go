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
	"fmt"
	"github.com/pydio/cells/v4/common/config"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"net/http"
	"net/url"
)

func NewIndex(c context.Context) http.Handler {
	return &indexHandler{ctx: c}
}

type indexHandler struct {
	ctx context.Context
}

func (p *indexHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	reg := servercontext.GetRegistry(p.ctx)

	externalURL := config.GetDefaultSiteURL()
	u, _ := url.Parse(externalURL)
	targets := ProcessesAsTargets(p.ctx, reg, true)
	for _, g := range targets.groups {
		g.Targets = []string{u.Host}
		g.Labels["__metrics_path__"] = fmt.Sprintf("/metrics/%s", g.Labels["pid"])
	}
	writer.Header().Set("Content-Type", "application/json")
	jj, _ := targets.ToJson()
	writer.Write(jj)
	writer.WriteHeader(200)
	return

}
