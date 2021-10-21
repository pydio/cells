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
	"context"
	"path"
	"sort"
	"strings"

	restful "github.com/emicklei/go-restful"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/ctl"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
)

/*********************
SERVICES MANAGEMENT
*********************/

// ListServices lists all services with their status
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

	disabledDss := map[string]struct{}{}
	if dss, e := h.getDataSources(req.Request.Context()); e == nil {
		for _, ds := range dss {
			if ds.Disabled {
				disabledDss[common.ServiceGrpcNamespace_+common.ServiceDataIndex_+ds.Name] = struct{}{}
				disabledDss[common.ServiceGrpcNamespace_+common.ServiceDataSync_+ds.Name] = struct{}{}
				disabledDss[common.ServiceGrpcNamespace_+common.ServiceDataObjects_+ds.Name] = struct{}{}
			}
		}
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
			// Ignore disabled services
			if _, has := disabledDss[s.Name()]; has {
				continue
			}
			output.Services = append(output.Services, h.serviceToRest(s, false))
		}
	}

	output.Total = int32(len(output.Services))

	resp.WriteEntity(output)
}

// ListPeersAddresses lists all Peers (servers) on which any pydio service is running
func (h *Handler) ListPeersAddresses(req *restful.Request, resp *restful.Response) {

	response := &rest.ListPeersAddressesResponse{}
	accu := make(map[string]string)

	for _, p := range registry.GetPeers() {
		accu[p.GetAddress()] = p.GetAddress()
		if h := p.GetHostname(); h != "" {
			// Replace value with "HostName|IP"
			accu[p.GetAddress()] = h + "|" + p.GetAddress()
		}
	}

	for _, v := range accu {
		response.PeerAddresses = append(response.PeerAddresses, v)
	}

	resp.WriteEntity(response)

}

// ListPeerFolders lists folders on a given peer to configure a local folder datasource.
func (h *Handler) ListPeerFolders(req *restful.Request, resp *restful.Response) {

	var listReq rest.ListPeerFoldersRequest
	if e := req.ReadEntity(&listReq); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataObjects
	cl := tree.NewNodeProviderClient(srvName, defaults.NewClient())
	var opts []client.CallOption
	if listReq.PeerAddress != "" {
		selectorOption := client.WithSelectOption(registry.PeerClientSelector(srvName, listReq.PeerAddress))
		opts = append(opts, selectorOption)
	}

	// Use a selector to make sure to we call the service that is running on the specific node
	streamer, e := cl.ListNodes(req.Request.Context(), &tree.ListNodesRequest{
		Node: &tree.Node{Path: listReq.Path},
	}, opts...)
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

// CreatePeerFolder forwards folder creation call to specific peer
func (h *Handler) CreatePeerFolder(req *restful.Request, resp *restful.Response) {

	var createReq rest.CreatePeerFolderRequest
	if e := req.ReadEntity(&createReq); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataObjects
	cl := tree.NewNodeReceiverClient(srvName, defaults.NewClient())
	var opts []client.CallOption
	if createReq.PeerAddress != "" {
		selectorOption := client.WithSelectOption(registry.PeerClientSelector(srvName, createReq.PeerAddress))
		opts = append(opts, selectorOption)
	}
	cr, e := cl.CreateNode(req.Request.Context(), &tree.CreateNodeRequest{Node: &tree.Node{Path: createReq.Path}}, opts...)
	if e != nil {
		service.RestErrorDetect(req, resp, e)
		return
	}
	resp.WriteEntity(&rest.CreatePeerFolderResponse{Success: true, Node: cr.Node})

}

// ListProcesses lists running Processes from registry, with option PeerId or ServiceName filter.
func (h *Handler) ListProcesses(req *restful.Request, resp *restful.Response) {

	var listReq rest.ListProcessesRequest
	if e := req.ReadEntity(&listReq); e != nil {
		service.RestError500(req, resp, e)
		return
	}

	out := &rest.ListProcessesResponse{}
	for _, p := range registry.GetProcesses() {
		// Filter by PeerId
		if listReq.PeerId != "" && p.PeerId != listReq.PeerId {
			continue
		}
		// Filter by Service
		if listReq.ServiceName != "" {
			var found bool
			for _, s := range p.Services {
				if s == listReq.ServiceName {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}
		var services []string
		for _, s := range p.Services {
			services = append(services, s)
		}
		out.Processes = append(out.Processes, &rest.Process{
			ID:          p.Id,
			PeerId:      p.PeerId,
			ParentID:    p.ParentId,
			PeerAddress: p.PeerAddress,
			MetricsPort: int32(p.MetricsPort),
			StartTag:    p.StartTag,
			Services:    services,
		})
	}

	resp.WriteEntity(out)

}

// ValidateLocalDSFolderOnPeer sends a couple of stat/create requests to the target Peer to make sure folder is valid
func (h *Handler) ValidateLocalDSFolderOnPeer(ctx context.Context, newSource *object.DataSource) error {

	folder := newSource.StorageConfiguration[object.StorageKeyFolder]
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataObjects
	var opts []client.CallOption
	if newSource.PeerAddress != "" && newSource.PeerAddress != "0.0.0.0" {
		selectorOption := client.WithSelectOption(registry.PeerClientSelector(srvName, newSource.PeerAddress))
		opts = append(opts, selectorOption)
	}
	defClient := defaults.NewClient()

	cl := tree.NewNodeProviderClient(srvName, defClient)
	wCl := tree.NewNodeReceiverClient(srvName, defClient)

	// Check it's two level deep
	parentName := path.Dir(folder)
	if strings.Trim(parentName, "/") == "" {
		return errors.BadRequest("ds.folder.invalid", "please use at least a two-levels deep folder")
	}

	// Stat node to make sure it exists - Create it otherwise
	_, e := cl.ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{Path: folder},
	}, opts...)

	if e != nil {
		if create, ok := newSource.StorageConfiguration[object.StorageKeyFolderCreate]; ok && create == "true" {
			// Create Node Now
			if _, err := wCl.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
				Type: tree.NodeType_COLLECTION,
				Path: folder,
			}}, opts...); err != nil {
				return errors.Forbidden("ds.folder.cannot.create", err.Error())
			}
		} else {
			return errors.NotFound("ds.folder.cannot.stat", e.Error())
		}
	}

	log.Logger(ctx).Info("Checking parent folder is writable before creating datasource", zap.Any("ds", newSource))
	// Finally try to write a tmp file inside parent folder to make sure it's writable, then remove it
	touchFile := &tree.Node{
		Type: tree.NodeType_LEAF,
		Path: path.Join(parentName, uuid.New()),
	}
	touched, e := wCl.CreateNode(ctx, &tree.CreateNodeRequest{Node: touchFile}, opts...)
	if e != nil {
		return errors.Forbidden("ds.folder.parent.not.writable", "Please make sure that parent folder (%s) is writeable by the application", parentName)
	} else {
		if _, er := wCl.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: touched.Node}, opts...); er != nil {
			log.Logger(ctx).Error("Could not delete tmp file written when creating datasource on peer " + newSource.PeerAddress)
		}
	}

	return nil
}

// ControlService is sends a command to a specific service - Not used for the moment.
func (h *Handler) ControlService(req *restful.Request, resp *restful.Response) {

	var ctrlRequest rest.ControlServiceRequest
	if err := req.ReadEntity(&ctrlRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	serviceName := ctrlRequest.ServiceName
	cmd := ctrlRequest.Command
	node := ctrlRequest.NodeName

	log.Logger(req.Request.Context()).Debug("Received command " + cmd.String() + " for service " + serviceName + " on node " + node)

}

// serviceToRest transforms a service object to a proto message.
func (h *Handler) serviceToRest(srv registry.Service, running bool) *ctl.Service {
	status := ctl.ServiceStatus_STOPPED
	if running {
		status = ctl.ServiceStatus_STARTED
	}
	controllable := true
	if !strings.HasPrefix(srv.Name(), "pydio") || srv.Name() == "pydio.grpc.config" {
		controllable = false
	}
	//configAddress := ""
	//c := config.Default().Get("defaults", "url").String("")
	//if srv.Name() == common.ServiceGatewayProxy && c != "" {
	//	configAddress = c
	//}
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
		// Double check that node is really running
		// addr := fmt.Sprintf("%s:%d", node.Address, node.Port)
		// if _, err := net.Dial("tcp", addr); err != nil {
		// 	log.Warn("Failed to check", zap.String("service", srv.Name()), zap.String("address", addr))
		// 	continue
		// }
		p := int32(node.Port)
		a := node.Address
		//if configAddress != "" {
		//	a = configAddress
		//	p = 0
		//}
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
