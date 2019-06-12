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

package web

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

		router.
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
		"/oauth2/",
		index,
	},

	route{
		"Authorize",
		"GET",
		"/oauth2/auth",
		auth(authorizeHandlerFunc),
	},

	route{
		"Authorize",
		"POST",
		"/oauth2/auth",
		auth(authorizeHandlerFunc),
	},

	route{
		"Token",
		"POST",
		"/oauth2/token",
		tokenHandlerFunc,
	},

	route{
		"JWKS",
		"GET",
		"/oauth2/jwks",
		jwksHandlerFunc,
	},
}
