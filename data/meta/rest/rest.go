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
	"context"
	"math"
	"path"
	"path/filepath"
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/meta"
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

func error404(req *restful.Request, resp *restful.Response, err error) {
	// Do not log error as it's polluting logs for nothing
	service.RestError404(req, resp, err)
}

func (h *Handler) GetMeta(req *restful.Request, resp *restful.Response) {
	p := req.PathParameter("NodePath")
	var nsRequest rest.MetaNamespaceRequest
	if err := req.ReadEntity(&nsRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	ctx := req.Request.Context()
	nsRequest.NodePath = p
	node, err := h.loadNodeByPath(ctx, nsRequest.NodePath, false)
	if err != nil {
		error404(req, resp, err)
		return
	}

	//log.Logger(ctx).Debug("BEFORE META PROVIDERS", zap.String("NodePath", p), zap.Any("n", node))
	loader := meta.NewStreamLoader(ctx)
	defer loader.Close()
	loader.LoadMetas(ctx, node)

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
	var folderNodes []*tree.Node

	for _, p := range bulkRequest.NodePaths {
		if strings.HasSuffix(p, "/*") || bulkRequest.Versions {
			if readResp, err := h.loadNodeByPath(ctx, strings.TrimSuffix(p, "/*"), true); err == nil {
				pathExt := strings.ToLower(filepath.Ext(readResp.Path))
				if pathExt == ".zip" || pathExt == ".tar" || pathExt == ".tar.gz" {
					readResp.Path += "/"
				}
				folderNodes = append(folderNodes, readResp)
				var inRequest bool
				for _, p2 := range bulkRequest.NodePaths {
					if strings.TrimSuffix(p2, "/") == strings.TrimSuffix(readResp.Path, "/") {
						inRequest = true
						break
					}
				}
				if inRequest && !bulkRequest.Versions {
					output.Nodes = append(output.Nodes, readResp.WithoutReservedMetas())
				}
			} else {
				error404(req, resp, err)
				return
			}
		} else {
			var asFolder bool
			for _, p2 := range bulkRequest.NodePaths {
				if p2 == p+"/*" {
					asFolder = true
					break
				}
			}
			// node is already loaded as a folder node ( = /*), do not send readNode twice
			if asFolder {
				continue
			}
			if node, err := h.loadNodeByPath(ctx, p, bulkRequest.AllMetaProviders); err == nil {
				output.Nodes = append(output.Nodes, node.WithoutReservedMetas())
			}
		}
	}

	metaLoader := meta.NewStreamLoader(ctx)
	defer metaLoader.Close()

	if len(output.Nodes) > 0 {
		for i, n := range output.Nodes {
			if n.Uuid != "" {
				metaLoader.LoadMetas(ctx, n)
				output.Nodes[i] = n.WithoutReservedMetas()
			}
		}
	}

	if len(folderNodes) == 0 {
		reservedOutput := &rest.BulkMetaResponse{}
		for _, n := range output.Nodes {
			reservedOutput.Nodes = append(reservedOutput.Nodes, n.WithoutReservedMetas())
		}
		resp.WriteEntity(reservedOutput)
		return
	}

	for _, folderNode := range folderNodes {
		var childrenCount, total, childrenLoaded int32
		if e := folderNode.GetMeta("ChildrenCount", &childrenCount); e == nil && childrenCount > 0 {
			total = childrenCount
		}
		streamer, err := h.GetRouter().ListNodes(ctx, &tree.ListNodesRequest{
			Node:         folderNode,
			WithVersions: bulkRequest.Versions,
			Offset:       int64(bulkRequest.Offset),
			Limit:        int64(bulkRequest.Limit),
		})
		if err != nil {
			continue
		}
		var eTimes []time.Duration
		for {
			r, er := streamer.Recv()
			if er != nil {
				streamer.Close()
				break
			}
			if r == nil {
				continue
			}
			s := time.Now()
			if !bulkRequest.Versions {
				metaLoader.LoadMetas(ctx, r.Node)
			}
			eTimes = append(eTimes, time.Since(s))
			if strings.HasPrefix(path.Base(r.Node.GetPath()), ".") {
				continue
			}
			childrenLoaded++
			output.Nodes = append(output.Nodes, r.Node.WithoutReservedMetas())
		}
		l := float64(len(eTimes))
		var t time.Duration
		for _, d := range eTimes {
			t += d
		}
		avg := time.Duration(float64(t.Nanoseconds()) / l)
		log.Logger(ctx).Debug("EnrichMetaProvider", zap.Duration("Average time spent to load node additional metadata", avg))
		streamer.Close()

		if !bulkRequest.Versions {
			fNode := folderNode.Clone()

			if resp, e := h.GetRouter().ReadNode(ctx, &tree.ReadNodeRequest{Node: fNode}); e == nil {
				er := h.GetRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
					c, n, e := inputFilter(ctx, resp.Node, "in")
					if e != nil {
						return e
					}
					client.Publish(c, client.NewPublication(common.TopicTreeChanges, &tree.NodeChangeEvent{
						Type:   tree.NodeChangeEvent_READ,
						Target: n,
					}))
					return nil
				})
				if er != nil {
					log.Logger(ctx).Debug("Cannot publish READ event on node", resp.Node.Zap(), zap.Error(er))
				}
			} else {
				log.Logger(ctx).Error("Cannot publish READ event on node", fNode.Zap(), zap.Error(e))
			}
		}

		// Handle Pagination
		if total > 0 && bulkRequest.Limit > 0 && childrenLoaded < total {
			var totalPages, crtPage, nextOffset, prevOffset int32
			pageSize := bulkRequest.Limit
			totalPages = int32(math.Ceil(float64(total) / float64(pageSize)))
			crtPage = int32(math.Floor(float64(bulkRequest.Offset)/float64(pageSize))) + 1
			if crtPage > 1 {
				prevOffset = bulkRequest.Offset - pageSize
			}
			if crtPage < totalPages {
				nextOffset = bulkRequest.Offset + pageSize
			}
			output.Pagination = &rest.Pagination{
				Limit:         pageSize,
				CurrentOffset: bulkRequest.Offset,
				Total:         total,
				CurrentPage:   crtPage,
				TotalPages:    totalPages,
				NextOffset:    nextOffset,
				PrevOffset:    prevOffset,
			}
		}

	}

	resp.WriteEntity(output)

}

func (h *Handler) SetMeta(req *restful.Request, resp *restful.Response) {

	p := req.PathParameter("NodePath")
	var metaCollection rest.MetaCollection
	if err := req.ReadEntity(&metaCollection); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	node, err := h.loadNodeByPath(req.Request.Context(), p, false)
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}
	for _, m := range metaCollection.Metadatas {
		ns := m.Namespace
		var mm map[string]interface{}
		e := json.Unmarshal([]byte(m.JsonMeta), &mm)
		if e == nil {
			node.SetMeta(ns, mm)
		}
	}
	ctx := req.Request.Context()
	er := h.GetRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
		ctx, node, _ = inputFilter(ctx, node, "in")

		cli := tree.NewNodeReceiverClient(registry.GetClient(common.ServiceMeta))
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

	p := req.PathParameter("NodePath")
	var nsRequest rest.MetaNamespaceRequest
	if err := req.ReadEntity(&nsRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	nsRequest.NodePath = p
	node, err := h.loadNodeByPath(req.Request.Context(), nsRequest.NodePath, false)
	if err != nil {
		service.RestError404(req, resp, err)
		return
	}
	for _, ns := range nsRequest.Namespace {
		node.SetMeta(ns, "")
	}

	ctx := req.Request.Context()
	er := h.GetRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
		ctx, node, _ = inputFilter(ctx, node, "in")

		cli := tree.NewNodeReceiverClient(registry.GetClient(common.ServiceMeta))
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

func (h *Handler) GetRouter() *views.Router {
	if h.router == nil {
		h.router = views.NewStandardRouter(views.RouterOptions{WatchRegistry: true, AuditEvent: true})
	}
	return h.router
}

func (h *Handler) loadNodeByPath(ctx context.Context, nodePath string, loadExtended bool) (*tree.Node, error) {

	nodePath = strings.TrimSuffix(nodePath, "/")
	response, err := h.GetRouter().ReadNode(ctx, &tree.ReadNodeRequest{
		WithExtendedStats: loadExtended,
		Node: &tree.Node{
			Path: nodePath,
		},
	})
	log.Logger(ctx).Debug("Querying Tree Service by Path: ", zap.String("p", nodePath), zap.Bool("withExtended", loadExtended), zap.Any("resp", response), zap.Error(err))

	if err != nil {
		return nil, err
	}
	return response.Node, nil
}
