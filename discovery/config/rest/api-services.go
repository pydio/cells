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
	"strings"

	"github.com/emicklei/go-restful"

	"github.com/micro/go-micro/client"
	registry2 "github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/ctl"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
)

/*********************
SERVICES MANAGEMENT
*********************/
// List all services with their status
func (h *Handler) ListServices(req *restful.Request, resp *restful.Response) {

	all, err := registry.ListServices(true)
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}

	running, err := registry.ListRunningServices()
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}

	output := &rest.ServiceCollection{
		Services: []*ctl.Service{},
	}
	for _, s := range running {
		output.Services = append(output.Services, h.serviceToRest(s, true))
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
			output.Services = append(output.Services, h.serviceToRest(s, false))
		}
	}

	output.Total = int32(len(output.Services))

	resp.WriteEntity(output)

}

// List all Peers (servers) on which any pydio service is running
func (h *Handler) ListPeersAddresses(req *restful.Request, resp *restful.Response) {

	response := &rest.ListPeersAddressesResponse{}
	accu := make(map[string]string)

	running, err := registry.ListRunningServices()
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}

	for _, s := range running {
		for _, n := range s.RunningNodes() {
			accu[n.Address] = n.Address
		}
	}

	for k, _ := range accu {
		response.PeerAddresses = append(response.PeerAddresses, k)
	}

	resp.WriteEntity(response)

}

// List folders on a given peer to configure a local folder datasource
func (h *Handler) ListPeerFolders(req *restful.Request, resp *restful.Response) {

	var listReq rest.ListPeerFoldersRequest
	if e := req.ReadEntity(&listReq); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	srvName := common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_OBJECTS
	cl := tree.NewNodeProviderClient(srvName, defaults.NewClient())

	// Use a selector to make sure to we call the service that is running on the specific node
	streamer, e := cl.ListNodes(req.Request.Context(), &tree.ListNodesRequest{
		Node: &tree.Node{Path: listReq.Path},
	}, client.WithSelectOption(selector.WithFilter(func(services []*registry2.Service) (out []*registry2.Service) {
		peerAddress := listReq.PeerAddress
		for _, srv := range services {
			if srv.Name != srvName {
				continue
			}
			var nodes []*registry2.Node
			for _, n := range srv.Nodes {
				if n.Address == peerAddress {
					nodes = append(nodes, n)
					break
				}
			}
			if len(nodes) > 0 {
				srv.Nodes = nodes
				out = append(out, srv)
			}
		}
		return
	})))
	if e != nil {
		service.RestError500(req, resp, e)
		return
	}
	defer streamer.Close()
	coll := &rest.NodesCollection{}
	for {
		r, e := streamer.Recv()
		if e != nil {
			break
		}
		coll.Children = append(coll.Children, r.Node)
	}

	resp.WriteEntity(coll)

}

// Start Stop services
func (s *Handler) ControlService(req *restful.Request, resp *restful.Response) {

	// var ctrlRequest rest.ControlServiceRequest
	// if err := req.ReadEntity(&ctrlRequest); err != nil {
	// 	service.RestError500(req, resp, err)
	// 	return
	// }
	// serviceName := ctrlRequest.ServiceName
	// cmd := ctrlRequest.Command
	// node := ctrlRequest.NodeName
	//
	// log.Logger(req.Request.Context()).Debug("Received command " + cmd.String() + " for service " + serviceName + " on node " + node)
	//
	// services, err := registry.ListServicesWithDetails()
	// if err != nil {
	// 	service.RestError500(req, resp, err)
	// 	return
	// }
	// for _, srv := range services {
	// 	if srv.Name == serviceName {
	// 		/*
	// 			if srv.Cancel != nil {
	// 				srv.Cancel()
	// 			}
	// 		*/
	// 		respMsg := s.serviceToRest(srv)
	// 		respMsg.Status = rest.ServiceStatus_STOPPING
	// 		resp.WriteEntity(respMsg)
	// 		return
	// 	}
	// }
	// service.RestError404(req, resp, errors.NotFound(Name, "Service "+serviceName+" Not Found"))

}

// Transform a service object to proto message
func (s *Handler) serviceToRest(srv registry.Service, running bool) *ctl.Service {
	status := ctl.ServiceStatus_STOPPED
	if running {
		status = ctl.ServiceStatus_STARTED
	}
	controllable := true
	if !strings.HasPrefix(srv.Name(), "pydio") || srv.Name() == "pydio.grpc.config" {
		controllable = false
	}
	protoSrv := &ctl.Service{
		Name:         srv.Name(),
		Status:       status,
		Tag:          strings.Join(srv.Tags(), ", "),
		Description:  srv.Description(),
		Controllable: controllable,
		Version:      srv.Version(),
		RunningPeers: []*ctl.Peer{},
	}
	for _, node := range srv.RunningNodes() {
		protoSrv.RunningPeers = append(protoSrv.RunningPeers, &ctl.Peer{
			Id:       node.Id,
			Port:     int32(node.Port),
			Address:  node.Address,
			Metadata: node.Metadata,
		})
	}
	return protoSrv
}
