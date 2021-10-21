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

package rest

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"sort"
	"strings"

	"github.com/golang/protobuf/jsonpb"
	"github.com/gorilla/mux"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/ctl"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	cnet "github.com/pydio/cells/common/utils/net"
)

type route struct {
	name        string
	method      string
	pattern     string
	handlerFunc http.HandlerFunc
}

type routes []route

// NewRouter creates and configures a new mux router to serve the healthcheck.
func NewRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range myRoutes {
		var handler http.Handler
		handler = route.handlerFunc
		handler = logger(handler, route.name)
		handler = auth(config.Get("services", common.ServiceGrpcNamespace_+common.ServiceHealthCheck), "Please enter your username and password", handler)

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
	global := params.Get("global")

	all, err := registry.ListServices(global != "")
	if err != nil {
		return
	}

	running, err := registry.ListRunningServices()
	if err != nil {
		return
	}

	excluded := strings.Split(params.Get("excluded"), ",")

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

	// Filtering non-local (by default host only)
	if global == "" {
		var services []registry.Service

		for _, service := range running {
			for _, node := range service.RunningNodes() {
				ips, err := cnet.GetAvailableIPs()
				if err != nil {
					http.Error(w, "could not retrieve ip", http.StatusInternalServerError)
					return
				}

				found := false
				for _, ip := range ips {
					if node.Address == ip.String() {
						found = true
						break
					}
				}

				if found {
					services = append(services, service)
					break
				}
			}
		}

		running = services
	}

	// Filtering non-local by hostname
	hostname, _ := os.Hostname()
	if global != "" {
		hostname = params.Get("hostname")
	}

	if hostname != "" {
		var services []registry.Service

		for _, service := range running {
			for _, node := range service.RunningNodes() {
				meta := node.Metadata
				if h, ok := meta["hostname"]; ok && h == hostname {
					services = append(services, service)
					break
				}
			}
		}

		running = services
	}

	// Filtering PID
	pids := []string{fmt.Sprintf("%d", os.Getpid())}
	if global != "" {
		pids = strings.Split(params.Get("pid"), ",")
	}

	if len(pids) > 0 && pids[0] != "" {
		var services []registry.Service

		for _, service := range running {
			for _, node := range service.RunningNodes() {
				meta := node.Metadata
				found := false
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

		running = services
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

	for _, service := range output.Services {
		// We don't display that information
		service.RunningPeers = nil

		if service.Status == ctl.ServiceStatus_STOPPED {
			w.WriteHeader(http.StatusInternalServerError)
		}
	}

	// Checking statuses
	output.Total = int32(len(output.Services))

	w.Header().Set("Content-Type", "application/json")
	(&jsonpb.Marshaler{}).Marshal(w, output)
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
		if node.Port > 0 {
			if _, err := net.Dial("tcp", fmt.Sprintf("%s:%d", node.Address, node.Port)); err != nil {
				continue
			}
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
