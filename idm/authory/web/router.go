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
		// handler = auth(handler)

		router.
			Methods(route.method).
			PathPrefix("/auth/dex").
			Path(route.pattern).
			Name(route.name).
			Handler(handler)
	}

	return router
}

var myRoutes = routes{
	route{
		"Login",
		"POST",
		"/login",
		login,
	},

	route{
		"Login callback",
		"GET",
		"/login",
		loginCallback,
	},

	route{
		"Consent callback",
		"GET",
		"/consent",
		consentCallback,
	},

	route{
		"Login Connector",
		"GET",
		"/login/{connector}",
		loginConnector,
	},

	route{
		"Login Connector callback",
		"GET",
		"/login/{connector}/callback",
		loginConnectorCallback,
	},

	route{
		"Login Connector callback",
		"POST",
		"/login/{connector}/callback",
		loginConnectorCallback,
	},

	route{
		"Consent",
		"GET",
		"/callback",
		callback,
	},

	route{
		"Logout",
		"GET",
		"/logout",
		logout,
	},
}
