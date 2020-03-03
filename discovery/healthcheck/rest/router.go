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

package rest

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"sort"
	"strings"

	"github.com/gorilla/mux"
	"github.com/pydio/cells/common/proto/ctl"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
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
			Methods(route.method).
			Path(route.pattern).
			Name(route.name).
			Handler(handler)
	}

	return router
}

func index(w http.ResponseWriter, r *http.Request) {

	params := r.URL.Query()
	excluded := strings.Split(params.Get("excluded"), ",")

	all, err := registry.ListServices(true)
	if err != nil {
		return
	}

	running, err := registry.ListRunningServices()
	if err != nil {
		return
	}

	// Filtering excluded services
	for _, x := range excluded {
		for i, a := range all {
			if a.Name() == x {
				all = append(all[0:i], all[i+1:]...)
			}
		}

		for i, r := range running {
			if r.Name() == x {
				running = append(running[0:i], running[i+1:]...)
			}
		}
	}

	output := &rest.ServiceCollection{
		Services: []*ctl.Service{},
	}
	for _, s := range running {
		output.Services = append(output.Services, serviceToRest(s, true))
	}

	for _, s := range all {
		runningFound := false
		for _, k := range running {
			if k.Name() == s.Name() {
				runningFound = true
				break
			}
		}
		if !runningFound {
			output.Services = append(output.Services, serviceToRest(s, false))
		}
	}

	// Filtering non-local
	hostname := params.Get("hostname")
	if hostname != "" {
		var services []*ctl.Service

		for _, service := range output.Services {
			for _, node := range service.RunningPeers {
				meta := node.GetMetadata()
				if h, ok := meta["hostname"]; ok && h == hostname {
					services = append(services, service)
					break
				}
			}
		}

		output.Services = services
	}

	// Filtering PID
	pids := strings.Split(params.Get("pid"), ",")
	if len(pids) > 0 && pids[0] != "" {
		var services []*ctl.Service

		for _, service := range output.Services {
			found := false
			for _, node := range service.RunningPeers {
				meta := node.GetMetadata()

				for _, pid := range pids {
					p, ok := meta["PID"]
					pp, okk := meta["parentPID"]

					if ok && (p == pid) || (okk && pp == pid) {
						found = true
						services = append(services, service)
						break
					}

					if found {
						break
					}
				}
			}
		}

		output.Services = services
	}

	for _, service := range output.Services {
		service.RunningPeers = nil
	}

	output.Total = int32(len(output.Services))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(output)
}

// serviceToRest transforms a service object to a proto message.
func serviceToRest(srv registry.Service, running bool) *ctl.Service {
	status := ctl.ServiceStatus_STOPPED
	if running {
		status = ctl.ServiceStatus_STARTED
	}

	protoSrv := &ctl.Service{
		Name:    srv.Name(),
		Status:  status,
		Version: srv.Version(),
	}
	for _, node := range srv.RunningNodes() {
		// Double check that node is really running
		if _, err := net.Dial("tcp", fmt.Sprintf("%s:%d", node.Address, node.Port)); err != nil {
			continue
		}
		p := int32(node.Port)
		a := node.Address
		protoSrv.RunningPeers = append(protoSrv.RunningPeers, &ctl.Peer{
			Id:       node.Id,
			Port:     p,
			Address:  a,
			Metadata: node.Metadata,
		})
	}
	sort.Slice(protoSrv.RunningPeers, func(i, j int) bool {
		return protoSrv.RunningPeers[i].Id > protoSrv.RunningPeers[j].Id
	})
	if len(protoSrv.RunningPeers) == 0 {
		protoSrv.Status = ctl.ServiceStatus_STOPPED
	}
	return protoSrv
}

var myRoutes = routes{
	route{
		"Index",
		"GET",
		"/healthcheck",
		index,
	},
}
