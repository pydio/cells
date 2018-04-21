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

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

func NewRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range routes {
		var handler http.Handler
		handler = route.HandlerFunc
		handler = Logger(handler, route.Name)
		handler = Auth(handler)

		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(handler)
	}

	return router
}

func Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Not accessible")
}

var routes = Routes{
	Route{
		"Index",
		"GET",
		"/wopi/",
		Index,
	},

	// The CheckFileInfo operation is one of the most important WOPI operations.
	// This operation must be implemented for all WOPI actions. CheckFileInfo returns
	// information about a file, a user’s permissions on that file, and general information
	// about the capabilities that the WOPI host has on the file.
	// In addition, some CheckFileInfo properties can influence the appearance and behavior of WOPI clients.
	// See https://wopirest.readthedocs.io/en/latest/files/CheckFileInfo.html#checkfileinfo
	Route{
		"GetNodeInfos",
		"GET",
		"/wopi/files/{uuid}",
		GetNodeInfos,
	},

	Route{
		"Download",
		"GET",
		"/wopi/files/{uuid}/contents",
		Download,
	},

	Route{
		"UploadStream",
		"POST",
		"/wopi/files/{uuid}/contents",
		UploadStream,
	},
}
