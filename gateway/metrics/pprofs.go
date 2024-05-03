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

package metrics

import (
	"context"
	"html/template"
	"net/http"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
)

const pprofTpl = `
<html>
<body>
<ul>
Available Profiles:
{{range .Processes}}
	<li><a href="./{{.PID}}/debug/pprof/">{{.PID}}</a> ({{.start}})</li>
{{end}}
</ul>
</body>
</html>
`

type pprofHandler struct {
	ctx context.Context
}

func (p *pprofHandler) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	var reg registry.Registry
	if !runtimecontext.Get(p.ctx, runtimecontext.RegistryKey, &reg) {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	nodes, er := reg.List(registry.WithType(pb.ItemType_NODE))
	if er != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	var processes []map[string]string
	for _, n := range nodes {
		var node registry.Node
		if n.As(&node) {
			if _, ok := node.Metadata()[runtime.NodeMetaPID]; ok {
				processes = append(processes, node.Metadata())
			}
		}
	}
	tpl := template.New("index")
	t, _ := tpl.Parse(pprofTpl)
	_ = t.Execute(writer, map[string]interface{}{"Processes": processes})
}
