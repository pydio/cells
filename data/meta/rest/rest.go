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
	"encoding/json"
	"path/filepath"
	"strings"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/views"
)

type Handler struct {
	router *views.Router
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *Handler) SwaggerTags() []string {
	return []string{"MetaService"}
}

// Filter returns a function to filter the swagger path
func (h *Handler) Filter() func(string) string {
	return func(path string) string {
		return strings.Replace(path, "{NodePath}", "{NodePath:*}", 1)
	}
}

func (h *Handler) GetMeta(req *restful.Request, resp *restful.Response) {
	path := req.PathParameter("NodePath")
	var nsRequest rest.MetaNamespaceRequest
	if err := req.ReadEntity(&nsRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	ctx := req.Request.Context()
	nsRequest.NodePath = path
	node, err := h.loadNodeByUuidOrPath(ctx, nsRequest.NodePath, "")
	if err != nil {
		service.RestError404(req, resp, err)
		return
	}

	//log.Logger(ctx).Debug("BEFORE META PROVIDERS", zap.String("NodePath", path), zap.Any("n", node))
	streamers, closer := h.initMetaProviderClients(ctx)
	defer closer()
	h.EnrichMetaFromProviders(ctx, streamers, node)

	//log.Logger(ctx).Debug("AFTER META PROVIDERS", zap.Any("n", node))
	resp.WriteEntity(node.WithoutReservedMetas())
}

func (h *Handler) GetBulkMeta(req *restful.Request, resp *restful.Response) {

	var bulkRequest rest.GetBulkMetaRequest
	if err := req.ReadEntity(&bulkRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	output := &rest.BulkMetaResponse{}
	ctx := req.Request.Context()
	folderNodes := []*tree.Node{}
	for _, p := range bulkRequest.NodePaths {
		if strings.HasSuffix(p, "/*") || bulkRequest.Versions {
			if readResp, err := h.loadNodeByUuidOrPath(ctx, strings.TrimSuffix(p, "/*"), ""); err == nil {
				pathExt := strings.ToLower(filepath.Ext(readResp.Path))
				if pathExt == ".zip" || pathExt == ".tar" || pathExt == ".tar.gz" {
					readResp.Path += "/"
				}
				folderNodes = append(folderNodes, readResp)
			} else {
				service.RestError404(req, resp, err)
				return
			}
		} else {
			if node, err := h.loadNodeByUuidOrPath(ctx, p, ""); err == nil {
				output.Nodes = append(output.Nodes, node.WithoutReservedMetas())
			} else {
				// Do not send 404, just send no result
				//service.RestError404(req, resp, err)
				//return
			}
		}
	}
	for _, u := range bulkRequest.NodeUuids {
		if node, err := h.loadNodeByUuidOrPath(ctx, "", u); err == nil {
			output.Nodes = append(output.Nodes, node.WithoutReservedMetas())
		} else {
			service.RestError404(req, resp, err)
			return
		}
	}

	if len(folderNodes) == 0 {
		if len(output.Nodes) > 0 {
			streamers, closer := h.initMetaProviderClients(ctx)
			defer closer()
			h.EnrichMetaFromProviders(ctx, streamers, output.Nodes...)
		}
		reservedOutput := &rest.BulkMetaResponse{}
		for _, n := range output.Nodes {
			reservedOutput.Nodes = append(reservedOutput.Nodes, n.WithoutReservedMetas())
		}
		resp.WriteEntity(reservedOutput)
		return
	}

	streamers, closer := h.initMetaProviderClients(ctx)
	defer closer()

	for _, folderNode := range folderNodes {
		streamer, err := h.getRouter().ListNodes(ctx, &tree.ListNodesRequest{Node: folderNode, WithVersions: bulkRequest.Versions})
		if err != nil {
			continue
		}
		for {
			r, er := streamer.Recv()
			if er != nil {
				streamer.Close()
				break
			}
			if r == nil {
				continue
			}
			if !bulkRequest.Versions {
				h.EnrichMetaFromProviders(ctx, streamers, r.Node)
			}
			output.Nodes = append(output.Nodes, r.Node.WithoutReservedMetas())
		}
		streamer.Close()

		if !bulkRequest.Versions {
			fNode := folderNode.Clone()

			if resp, e := h.getRouter().ReadNode(ctx, &tree.ReadNodeRequest{Node: fNode}); e == nil {
				er := h.getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
					c, n, e := inputFilter(ctx, resp.Node, "in")
					if e != nil {
						return e
					}
					client.Publish(c, client.NewPublication(common.TOPIC_TREE_CHANGES, &tree.NodeChangeEvent{
						Type:   tree.NodeChangeEvent_READ,
						Target: n,
					}))
					return nil
				})
				if er != nil {
					log.Logger(ctx).Error("Cannot publish READ event on node", fNode.Zap(), zap.Error(e))
				}
			} else {
				log.Logger(ctx).Error("Cannot publish READ event on node", fNode.Zap(), zap.Error(e))
			}
		}

	}

	resp.WriteEntity(output)

}

func (h *Handler) SetMeta(req *restful.Request, resp *restful.Response) {

	path := req.PathParameter("NodePath")
	var metaCollection rest.MetaCollection
	if err := req.ReadEntity(&metaCollection); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	node, err := h.loadNodeByUuidOrPath(req.Request.Context(), path, "")
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}
	for _, m := range metaCollection.Metadatas {
		ns := m.Namespace
		var meta map[string]interface{}
		e := json.Unmarshal([]byte(m.JsonMeta), &meta)
		if e == nil {
			node.SetMeta(ns, meta)
		}
	}
	ctx := req.Request.Context()
	er := h.getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
		ctx, node, _ = inputFilter(ctx, node, "in")

		cli := tree.NewNodeReceiverClient(registry.GetClient(common.SERVICE_META))
		if _, er := cli.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node}); er != nil {
			log.Logger(ctx).Error("Failed to change the meta data", zap.Error(er))
			return er
		}
		return nil
	})
	if er != nil {
		log.Logger(ctx).Error("Failed to change the meta data", zap.Error(er))
		service.RestError500(req, resp, er)
		return
	}
	resp.WriteEntity(node.WithoutReservedMetas())

}

func (h *Handler) DeleteMeta(req *restful.Request, resp *restful.Response) {

	path := req.PathParameter("NodePath")
	var nsRequest rest.MetaNamespaceRequest
	if err := req.ReadEntity(&nsRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	nsRequest.NodePath = path
	node, err := h.loadNodeByUuidOrPath(req.Request.Context(), nsRequest.NodePath, "")
	if err != nil {
		service.RestError404(req, resp, err)
		return
	}
	for _, ns := range nsRequest.Namespace {
		node.SetMeta(ns, "")
	}

	ctx := req.Request.Context()
	er := h.getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
		ctx, node, _ = inputFilter(ctx, node, "in")

		cli := tree.NewNodeReceiverClient(registry.GetClient(common.SERVICE_META))
		if _, er := cli.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node}); er != nil {
			return er
		}
		return nil
	})
	if er != nil {
		service.RestError500(req, resp, er)
		return
	}
	resp.WriteEntity(node.WithoutReservedMetas())

}

type closer func()

func (h *Handler) initMetaProviderClients(ctx context.Context) ([]tree.NodeProviderStreamer_ReadNodeStreamClient, closer) {

	metaProviders := h.GetMetaProviderStreamers()
	streamers := []tree.NodeProviderStreamer_ReadNodeStreamClient{}
	for _, cli := range metaProviders {
		metaStreamer, metaE := cli.ReadNodeStream(ctx)
		if metaE != nil {
			continue
		}
		streamers = append(streamers, metaStreamer)
	}
	outCloser := func() {
		for _, streamer := range streamers {
			streamer.Close()
		}
	}
	return streamers, outCloser

}

func (h *Handler) EnrichMetaFromProviders(ctx context.Context, streamers []tree.NodeProviderStreamer_ReadNodeStreamClient, nodes ...*tree.Node) {

	for _, node := range nodes {

		for _, metaStreamer := range streamers {

			sendError := metaStreamer.Send(&tree.ReadNodeRequest{Node: node})
			if sendError != nil {
				log.Logger(ctx).Error("Error while sending to metaStreamer", zap.Error(sendError))
			}
			metaResponse, err := metaStreamer.Recv()
			if err == nil {
				if node.MetaStore == nil {
					node.MetaStore = make(map[string]string, len(metaResponse.Node.MetaStore))
				}
				for k, v := range metaResponse.Node.MetaStore {
					node.MetaStore[k] = v
				}
			}

		}
	}

}

func (h *Handler) GetMetaProviderStreamers() []tree.NodeProviderStreamerClient {

	// Init with Meta Grpc Service
	result := []tree.NodeProviderStreamerClient{
		tree.NewNodeProviderStreamerClient(registry.GetClient(common.SERVICE_META)),
	}

	// Other Meta Providers (running services only)
	services, err := registry.ListServicesWithMicroMeta("MetaProvider", "stream")
	if err != nil {
		return nil
	}

	for _, srv := range services {
		result = append(result, tree.NewNodeProviderStreamerClient(srv.Name(), defaults.NewClient()))
	}

	return result

}

func (h *Handler) getRouter() *views.Router {
	if h.router == nil {
		h.router = views.NewStandardRouter(views.RouterOptions{WatchRegistry: true, AuditEvent: true})
	}
	return h.router
}

func (h *Handler) loadNodeByUuidOrPath(ctx context.Context, nodePath string, nodeUuid string) (*tree.Node, error) {

	var response *tree.ReadNodeResponse
	var err error
	if nodeUuid != "" {
		log.Logger(ctx).Debug("Querying Meta Service by Uuid")

		cli := tree.NewNodeProviderClient(registry.GetClient(common.SERVICE_META))

		response, err = cli.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Uuid: nodeUuid,
			},
		})
	} else {
		log.Logger(ctx).Debug("Querying Tree Service by Path: ", zap.String("p", nodePath))
		response, err = h.getRouter().ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: nodePath,
			},
		})
	}

	if err != nil {
		return nil, err
	}
	return response.Node, nil
}
