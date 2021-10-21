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

package grpc

import (
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/transport/grpc"
	defaults "github.com/pydio/cells/common/micro"
)

var t = grpc.NewTransport()

func Enable() {
	// tls := config.GetTLSClientConfig("proxy")

	defaults.InitServer(func() server.Option {
		return server.Transport(t)
	})

	defaults.InitClient(func() client.Option {
		return client.Transport(t)
	})

	// transport.DefaultTransport = t
	//
	// // The default client is used by dex so no choice
	// http.DefaultClient.Transport = &http.Transport{
	// 	TLSClientConfig: tls,
	// }
}
