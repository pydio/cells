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

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type Handler struct {
	RuntimeCtx context.Context
	router     nodes.Client
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

func (h *Handler) GetMeta(req *restful.Request, resp *restful.Response) error {
	p := req.PathParameter("NodePath")
	var nsRequest rest.MetaNamespaceRequest
	if err := req.ReadEntity(&nsRequest); err != nil {
		return errors.Tag(err, errors.UnmarshalError)
	}
	ctx := req.Request.Context()
	nsRequest.NodePath = p
	node, err := h.loadNodeByPath(ctx, nsRequest.NodePath, false)
	if err != nil {
		return err
	}
	return resp.WriteEntity(node.WithoutReservedMetas())
}

func (h *Handler) GetBulkMeta(req *restful.Request, resp *restful.Response) error {

	var bulkRequest rest.GetBulkMetaRequest
	if err := req.ReadEntity(&bulkRequest); err != nil {
		return err
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
				return errors.Tag(err, errors.NodeNotFound)
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

	if len(output.Nodes) > 0 {
		for i, n := range output.Nodes {
			if n.Uuid != "" {
				output.Nodes[i] = n.WithoutReservedMetas()
			}
		}
	}

	if len(folderNodes) == 0 {
		reservedOutput := &rest.BulkMetaResponse{}
		for _, n := range output.Nodes {
			reservedOutput.Nodes = append(reservedOutput.Nodes, n.WithoutReservedMetas())
		}
		return resp.WriteEntity(reservedOutput)
	}

	for _, folderNode := range folderNodes {
		var childrenCount, total, childrenLoaded int32
		if folderNode.GetStringMeta(common.MetaFlagWriteOnly) == "true" {
			continue
		}
		if e := folderNode.GetMeta(common.MetaFlagChildrenCount, &childrenCount); e == nil && childrenCount > 0 {
			total = childrenCount
		}
		listRequest := &tree.ListNodesRequest{
			Node:         folderNode,
			WithVersions: bulkRequest.Versions,
			Offset:       int64(bulkRequest.Offset),
			Limit:        int64(bulkRequest.Limit),
			SortField:    bulkRequest.SortField,
			SortDirDesc:  bulkRequest.SortDirDesc,
		}
		hasFilter := false
		for k, v := range bulkRequest.GetFilters() {
			if k == "type" {
				switch v {
				case "LEAF":
					listRequest.FilterType = tree.NodeType_LEAF
					hasFilter = true
					if e := folderNode.GetMeta(common.MetaFlagChildrenFiles, &childrenCount); e == nil && childrenCount > 0 {
						total = childrenCount
					}
				case "COLLECTION":
					listRequest.FilterType = tree.NodeType_COLLECTION
					hasFilter = true
					if e := folderNode.GetMeta(common.MetaFlagChildrenFolders, &childrenCount); e == nil && childrenCount > 0 {
						total = childrenCount
					}
				}
			}
		}
		cc, countDiffers, er := h.fillChildren(ctx, listRequest, childrenCount)
		if er != nil {
			return er
		}
		childrenLoaded = int32(len(cc))
		output.Nodes = append(output.Nodes, cc...)

		if !bulkRequest.Versions {
			fNode := folderNode.Clone()

			//todo recheck - why would we re-issue a readnode here ?
			//if resp, e := h.GetRouter().ReadNode(ctx, &tree.ReadNodeRequest{Node: fNode}); e == nil {
			er := h.GetRouter().WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
				c, n, e := inputFilter(ctx, fNode, "in")
				if e != nil {
					return e
				}
				broker.MustPublish(c, common.TopicTreeChanges, &tree.NodeChangeEvent{
					Type:   tree.NodeChangeEvent_READ,
					Target: n,
				})
				return nil
			})
			if er != nil {
				log.Logger(ctx).Debug("Cannot publish READ event on node", fNode.Zap(), zap.Error(er))
			}
			//} else {
			//	log.Logger(ctx).Error("Cannot publish READ event on node", fNode.Zap(), zap.Error(e))
			//}
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
			// If the first page is already smaller than the limit, then do not send pagination data
			// List may have been filtered out
			if countDiffers && !hasFilter {
				if childrenLoaded < bulkRequest.Limit-1 {
					// Assume it's the last
					totalPages = crtPage
				} else {
					totalPages = -1
				}
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

	return resp.WriteEntity(output)

}

func (h *Handler) SetMeta(req *restful.Request, resp *restful.Response) error {

	p := req.PathParameter("NodePath")
	var metaCollection rest.MetaCollection
	if err := req.ReadEntity(&metaCollection); err != nil {
		return err
	}
	node, err := h.loadNodeByPath(req.Request.Context(), p, false)
	if err != nil {
		return err
	}
	for _, m := range metaCollection.Metadatas {
		ns := m.Namespace
		var mm map[string]interface{}
		e := json.Unmarshal([]byte(m.JsonMeta), &mm)
		if e == nil {
			node.MustSetMeta(ns, mm)
		}
	}
	ctx := req.Request.Context()
	er := h.GetRouter().WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
		ctx, node, _ = inputFilter(ctx, node, "in")

		cli := treec.ServiceNodeReceiverClient(ctx, common.ServiceMeta)
		if _, er := cli.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node}); er != nil {
			log.Logger(ctx).Error("Failed to change the meta data", zap.Error(er))
			return er
		}
		return nil
	})
	if er != nil {
		log.Logger(ctx).Error("Failed to change the meta data", zap.Error(er))
		return er
	}
	return resp.WriteEntity(node.WithoutReservedMetas())

}

func (h *Handler) DeleteMeta(req *restful.Request, resp *restful.Response) error {

	p := req.PathParameter("NodePath")
	var nsRequest rest.MetaNamespaceRequest
	if err := req.ReadEntity(&nsRequest); err != nil {
		return err
	}
	nsRequest.NodePath = p
	node, err := h.loadNodeByPath(req.Request.Context(), nsRequest.NodePath, false)
	if err != nil {
		return err
	}
	for _, ns := range nsRequest.Namespace {
		node.MustSetMeta(ns, "")
	}

	ctx := req.Request.Context()
	er := h.GetRouter().WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
		ctx, node, _ = inputFilter(ctx, node, "in")

		cli := treec.ServiceNodeReceiverClient(ctx, common.ServiceMeta)
		if _, er := cli.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node}); er != nil {
			return er
		}
		return nil
	})
	if er != nil {
		return er
	}
	return resp.WriteEntity(node.WithoutReservedMetas())

}

func (h *Handler) GetRouter() nodes.Client {
	if h.router == nil {
		h.router = compose.PathClient(h.RuntimeCtx, nodes.WithAuditEventsLogging())
	}
	return h.router
}

func (h *Handler) loadNodeByPath(ctx context.Context, nodePath string, loadExtended bool) (*tree.Node, error) {

	nodePath = strings.TrimSuffix(nodePath, "/")
	response, err := h.GetRouter().ReadNode(ctx, &tree.ReadNodeRequest{
		StatFlags: []uint32{tree.StatFlagFolderCounts},
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

func (h *Handler) fillChildren(ctx context.Context, listRequest *tree.ListNodesRequest, knownCount int32) ([]*tree.Node, bool, error) {

	var oo []*tree.Node
	var countDiffers bool
	offset := listRequest.Offset
	limit := listRequest.Limit
	lr := proto.Clone(listRequest).(*tree.ListNodesRequest)

	for {

		log.Logger(ctx).Debug("Listing", zap.Int64("offset", offset), zap.Int64("limit", limit))
		lr.Offset = offset
		lr.Limit = limit
		streamer, err := h.GetRouter().ListNodes(ctx, lr)
		if err != nil {
			return oo, countDiffers, err
		}
		for {
			r, er := streamer.Recv()
			if er != nil {
				break
			}
			if r == nil {
				continue
			}
			if strings.HasPrefix(path.Base(r.Node.GetPath()), ".") {
				continue
			}
			oo = append(oo, r.Node.WithoutReservedMetas())
		}
		if len(oo) >= int(limit) { // limit is reached, break
			break
		}
		if offset+limit >= int64(knownCount) { // This is last page, break
			break
		}
		offset += limit
		countDiffers = true
	}

	return oo, countDiffers, nil

}
