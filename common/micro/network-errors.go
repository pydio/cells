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

package defaults

import (
	"context"
	"fmt"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
)

type networkClientWrapper struct {
	client.Client
}

func NetworkClientWrapper(c client.Client) client.Client {
	wrapped := &networkClientWrapper{}
	wrapped.Client = c
	return wrapped
}

func (c *networkClientWrapper) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	e := c.Client.Call(ctx, req, rsp, opts...)
	if e != nil {
		er := errors.Parse(e.Error())
		if er.Id == "go.micro.client" || strings.Contains(er.Detail, "all SubConns are in TransientFailure") {
			// Add details about current services status.
			srv := req.Service()
			method := req.Method()
			er.Detail += " - Request was " + method + " on " + srv
			ss, _ := Registry().GetService(srv)
			var nodes []string
			for _, s := range ss {
				for _, n := range s.Nodes {
					nodes = append(nodes, fmt.Sprintf("%s:%d", n.Address, n.Port))
				}
			}
			er.Detail += fmt.Sprintf(" - Micro-registry had node(s) : [%s]", strings.Join(nodes, ","))
			return er
		} else {
			return e
		}
	}
	return nil
}
