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

package wopi

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

type route struct {
	name        string
	method      string
	pattern     string
	handlerFunc http.HandlerFunc
}

type routes []route

// NewRouter creates and configures a new mux router to serve wopi REST requests and enable integration with WOPI clients.
func NewRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range myRoutes {
		var handler http.Handler
		handler = route.handlerFunc
		handler = logger(handler, route.name)
		handler = auth(handler)

		router.
			PathPrefix("/wopi").
			Methods(route.method).
			Path(route.pattern).
			Name(route.name).
			Handler(handler)
	}

	return router
}

func index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Not accessible")
}

var myRoutes = routes{
	route{
		"Index",
		"GET",
		"/",
		index,
	},

	// The CheckFileInfo operation is one of the most important WOPI operations.
	// This operation must be implemented for all WOPI actions. CheckFileInfo returns
	// information about a file, a user’s permissions on that file, and general information
	// about the capabilities that the WOPI host has on the file.
	// In addition, some CheckFileInfo properties can influence the appearance and behavior of WOPI clients.
	// See https://wopirest.readthedocs.io/en/latest/files/CheckFileInfo.html#checkfileinfo
	route{
		"GetNodeInfos",
		"GET",
		"/files/{uuid}",
		getNodeInfos,
	},

	route{
		"Download",
		"GET",
		"/files/{uuid}/contents",
		download,
	},

	route{
		"UploadStream",
		"POST",
		"/files/{uuid}/contents",
		uploadStream,
	},
}
