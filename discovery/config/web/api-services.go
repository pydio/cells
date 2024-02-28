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
	"net"
	"path"
	"sort"
	"strconv"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/ctl"
	"github.com/pydio/cells/v4/common/proto/object"
	rpb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

/*********************
SERVICES MANAGEMENT
*********************/

// ListServices lists all services with their status
func (h *Handler) ListServices(req *restful.Request, resp *restful.Response) {

	// Create a list of all plugins
	pluginsReg, e := registry.OpenRegistry(context.Background(), runtime.RegistryURL())
	if e != nil {
		service.RestError500(req, resp, e)
		return
	}
	defer pluginsReg.Close()

	services, err := pluginsReg.List(registry.WithType(rpb.ItemType_SERVICE))
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}

	output := &rest.ServiceCollection{
		Services: []*ctl.Service{},
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

	for _, item := range services {
		srv := item.(registry.Service)
		if _, dis := disabledDss[srv.Name()]; dis {
			continue
		}
		nodes := pluginsReg.ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{srv}),
			registry.WithAdjacentTargetOptions(registry.WithType(rpb.ItemType_SERVER)),
		)
		output.Services = append(output.Services, h.serviceToRest(pluginsReg, srv, nodes))
	}

	resp.WriteEntity(output)
}

func (h *Handler) ListRegistry(req *restful.Request, resp *restful.Response) {

	var input rpb.ListRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	}

	pluginsReg, e := registry.OpenRegistry(context.Background(), runtime.RegistryURL())
	if e != nil {
		service.RestError500(req, resp, e)
		return
	}
	defer pluginsReg.Close()

	opts := util.ToOptions(input.Options)
	if input.Options == nil || len(input.Options.Types) == 0 {
		for _, t := range rpb.ItemType_value {
			if t > 0 {
				opts = append(opts, registry.WithType(rpb.ItemType(t)))
			}
		}
	}
	ii, e := pluginsReg.List(opts...)
	if e != nil {
		service.RestError500(req, resp, e)
		return
	}
	response := &rpb.ListResponse{}
	for _, i := range ii {
		item := util.ToProtoItem(i)
		if input.AdjacentsOptions != nil {
			adjOpts := util.ToOptions(input.AdjacentsOptions)
			if len(input.AdjacentsOptions.Types) == 0 {
				for _, t := range rpb.ItemType_value {
					if t > 0 {
						adjOpts = append(adjOpts, registry.WithType(rpb.ItemType(t)))
					}
				}
			}
			aa := pluginsReg.ListAdjacentItems(
				registry.WithAdjacentSourceItems([]registry.Item{i}),
				registry.WithAdjacentTargetOptions(adjOpts...),
			)
			item.Adjacents = util.ToProtoItems(aa)
		}
		response.Items = append(response.Items, item)
	}
	_ = resp.WriteEntity(response)

}

// ListPeersAddresses lists all Peers (servers) on which any pydio service is running
func (h *Handler) ListPeersAddresses(req *restful.Request, resp *restful.Response) {

	response := &rest.ListPeersAddressesResponse{
		PeerAddresses: []string{},
	}
	reg := servercontext.GetRegistry(req.Request.Context())
	nodes, er := reg.List(registry.WithType(rpb.ItemType_SERVER))
	if er != nil {
		service.RestError500(req, resp, er)
		return
	}
	accu := make(map[string]string)
	hosts := make(map[string]string)
	for _, n := range nodes {
		node := n.(registry.Server)
		var aa []string
		for _, a := range reg.ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{n}),
			registry.WithAdjacentTargetOptions(registry.WithType(rpb.ItemType_ADDRESS)),
		) {
			aa = append(aa, a.Name())
		}
		if ho, _, e := net.SplitHostPort(strings.Join(aa, "")); e == nil && ho != "" && ho != "::" {
			accu[ho] = ho
			if h, ok := node.Metadata()[runtime.NodeMetaHostName]; ok && h != "" {
				hosts[ho] = h
			}
		}
	}
	for _, v := range accu {
		if h, ok := hosts[v]; ok {
			v += "|" + h
		}
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

	var opts []grpc.Option
	if listReq.PeerAddress != "" {
		opts = append(opts, grpc.WithPeerSelector(listReq.PeerAddress))
	}
	cl := tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(req.Request.Context(), common.ServiceDataObjectsPeer, opts...))

	// Use a selector to make sure to we call the service that is running on the specific node
	streamer, e := cl.ListNodes(req.Request.Context(), &tree.ListNodesRequest{
		Node: &tree.Node{Path: listReq.Path},
	})
	if e != nil {
		service.RestError500(req, resp, e)
		return
	}
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
	var opts []grpc.Option
	if createReq.PeerAddress != "" {
		opts = append(opts, grpc.WithPeerSelector(createReq.PeerAddress))
	}
	cl := tree.NewNodeReceiverClient(grpc.GetClientConnFromCtx(req.Request.Context(), common.ServiceDataObjectsPeer, opts...))
	cr, e := cl.CreateNode(req.Request.Context(), &tree.CreateNodeRequest{Node: &tree.Node{Path: createReq.Path}})
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

	reg := servercontext.GetRegistry(req.Request.Context())
	nodes, er := reg.List(registry.WithType(rpb.ItemType_SERVER))
	if er != nil {
		service.RestError500(req, resp, er)
		return
	}
	accu := make(map[string]map[string]string)
	for _, n := range nodes {
		node := n.(registry.Server)
		mm := node.Metadata()
		if _, ok := accu[mm[runtime.NodeMetaPID]]; ok {
			continue
		}
		accu[mm[runtime.NodeMetaPID]] = mm
	}
	for pid, meta := range accu {
		out.Processes = append(out.Processes, &rest.Process{
			ID:       pid,
			ParentID: meta[runtime.NodeMetaParentPID],
			//MetricsPort: int32(mport),
			PeerId:      "", // ??
			PeerAddress: "", // ??
			StartTag:    meta[runtime.NodeMetaStartTag],
			Services:    []string{},
		})
	}

	resp.WriteEntity(out)

}

// ValidateLocalDSFolderOnPeer sends a couple of stat/create requests to the target Peer to make sure folder is valid
func (h *Handler) ValidateLocalDSFolderOnPeer(ctx context.Context, newSource *object.DataSource) error {

	folder := newSource.StorageConfiguration[object.StorageKeyFolder]
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataObjectsPeer
	var opts []grpc.Option
	if newSource.PeerAddress != "" {
		opts = append(opts, grpc.WithPeerSelector(newSource.PeerAddress))
	}
	conn := grpc.GetClientConnFromCtx(ctx, srvName, opts...)

	cl := tree.NewNodeProviderClient(conn)
	wCl := tree.NewNodeReceiverClient(conn)

	// Check it's two level deep
	parentName := path.Dir(folder)
	if strings.Trim(parentName, "/") == "" {
		return errors.BadRequest("ds.folder.invalid", "please use at least a two-levels deep folder")
	}

	// Stat node to make sure it exists - Create it otherwise
	_, e := cl.ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{Path: folder},
	})

	if e != nil {
		if create, ok := newSource.StorageConfiguration[object.StorageKeyFolderCreate]; ok && create == "true" {
			// Create Node Now
			if _, err := wCl.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
				Type: tree.NodeType_COLLECTION,
				Path: folder,
			}}); err != nil {
				return errors.Forbidden("ds.folder.cannot.create", err.Error())
			}
		} else {
			return errors.NotFound("ds.folder.cannot.stat", e.Error())
		}
	}

	log.Logger(ctx).Info("Checking parent folder is writable before creating datasource", zap.Object("ds", newSource))
	// Finally try to write a tmp file inside parent folder to make sure it's writable, then remove it
	touchFile := &tree.Node{
		Type: tree.NodeType_LEAF,
		Path: path.Join(parentName, uuid.New()),
	}
	touched, e := wCl.CreateNode(ctx, &tree.CreateNodeRequest{Node: touchFile})
	if e != nil {
		return errors.Forbidden("ds.folder.parent.not.writable", "Please make sure that parent folder (%s) is writeable by the application", parentName)
	} else {
		if _, er := wCl.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: touched.Node}); er != nil {
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
func (h *Handler) serviceToRest(r registry.Registry, srv registry.Service, nodes []registry.Item) *ctl.Service {
	status := ctl.ServiceStatus_STOPPED
	running := len(nodes) > 0
	if running {
		status = ctl.ServiceStatus_STARTED
	}
	isGeneric := false
	controllable := true
	if !strings.HasPrefix(srv.Name(), "pydio") || srv.Name() == "pydio.grpc.config" {
		controllable = false
	}
	desc := ""
	if d, o := srv.Metadata()[registry.MetaDescriptionKey]; o {
		desc = d
	}
	protoSrv := &ctl.Service{
		Name:         srv.Name(),
		Status:       status,
		Tag:          strings.Join(srv.Tags(), ", "),
		Description:  desc,
		Controllable: controllable,
		Version:      srv.Version(),
		RunningPeers: []*ctl.Peer{},
		Metadata:     srv.Metadata(),
	}
	for _, node := range nodes {
		aa := r.ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{node}),
			registry.WithAdjacentTargetOptions(registry.WithType(rpb.ItemType_ADDRESS)),
		)
		if len(aa) > 0 {
			h, p, _ := net.SplitHostPort(aa[0].Name())
			port, _ := strconv.Atoi(p)
			protoSrv.RunningPeers = append(protoSrv.RunningPeers, &ctl.Peer{
				Id:       node.Name(),
				Port:     int32(port),
				Address:  h,
				Metadata: node.Metadata(),
			})
		} else if node.ID() == "generic" {
			isGeneric = true
		}
	}
	sort.Slice(protoSrv.RunningPeers, func(i, j int) bool {
		return protoSrv.RunningPeers[i].Id > protoSrv.RunningPeers[j].Id
	})
	if len(protoSrv.RunningPeers) == 0 && !isGeneric {
		protoSrv.Status = ctl.ServiceStatus_STOPPED
	}
	return protoSrv
}
