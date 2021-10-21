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

package storage

import (
	"io/ioutil"
	"log"
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

// NewRouter creates and configures a new mux router to serve the config storage.
func NewRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range myRoutes {
		handler := route.handlerFunc
		router.
			Methods(route.method).
			Path(route.pattern).
			Name(route.name).
			Handler(handler)
	}

	return router
}

func lookup(w http.ResponseWriter, r *http.Request) {
	key := r.RequestURI
	if v, ok := store.Lookup(key); ok {
		w.Write([]byte(v))
	} else {
		http.Error(w, "Failed to GET", http.StatusNotFound)
	}
}

func propose(w http.ResponseWriter, r *http.Request) {
	key := r.RequestURI

	v, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("Failed to read on PUT (%v)\n", err)
		http.Error(w, "Failed on PUT", http.StatusBadRequest)
		return
	}

	store.Propose(key, string(v))

	// Optimistic-- no waiting for ack from raft. Value is not yet
	// committed so a subsequent GET on the key may return old value
	w.WriteHeader(http.StatusNoContent)
}

var myRoutes = routes{
	route{
		"Lookup",
		"GET",
		"/config",
		lookup,
	},
	route{
		"Propose",
		"PUT",
		"/config",
		propose,
	},
}
