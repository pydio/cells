/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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
	"path/filepath"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

type Handler struct {
	router nodes.Client
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
	node, err := h.loadNodeByPath(ctx, nsRequest.NodePath, tree.Flags{tree.StatFlagFolderCounts})
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
	nn, pag, err := h.LoadNodes(ctx, &bulkRequest, tree.Flags{})
	if err != nil {
		return err
	}
	for _, n := range nn {
		output.Nodes = append(output.Nodes, n.WithoutReservedMetas())
	}
	output.Pagination = pag
	return resp.WriteEntity(output)
}

func (h *Handler) LoadNodes(ctx context.Context, bulkRequest *rest.GetBulkMetaRequest, flags tree.Flags) (nn []*tree.Node, pagination *rest.Pagination, er error) {
	var folderNodes []*tree.Node
	flags = append(flags, tree.StatFlagFolderCounts)
	for _, p := range bulkRequest.NodePaths {
		if strings.HasSuffix(p, "/*") || bulkRequest.Versions {
			if readResp, err := h.loadNodeByPath(ctx, strings.TrimSuffix(p, "/*"), flags); err == nil {
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
					nn = append(nn, readResp)
				}
			} else {
				er = errors.Tag(err, errors.NodeNotFound)
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
			if node, err := h.loadNodeByPath(ctx, p, flags); err == nil {
				nn = append(nn, node)
			}
		}
	}

	if len(nn) > 0 {
		for i, n := range nn {
			if n.Uuid != "" {
				nn[i] = n
			}
		}
	}

	if len(folderNodes) == 0 {
		return
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
			StatFlags:    flags,
		}
		hasFilter := false
		for k, v := range bulkRequest.GetFilters() {
			switch k {
			case "type":
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
			case tree.MetaFilterGrep, tree.MetaFilterForceGrep, tree.MetaFilterNoGrep:
				folderNode.MustSetMeta(k, v)
			}
		}
		cc, countDiffers, err := h.fillChildren(ctx, listRequest, childrenCount)
		if err != nil {
			er = err
			return
		}
		childrenLoaded = int32(len(cc))
		nn = append(nn, cc...)

		if !bulkRequest.Versions {
			fNode := folderNode.Clone()

			if wEr := h.GetRouter().WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
				c, n, e := inputFilter(ctx, fNode, "in")
				if e != nil {
					return e
				}
				broker.MustPublish(c, common.TopicTreeChanges, &tree.NodeChangeEvent{
					Type:   tree.NodeChangeEvent_READ,
					Target: n,
				})
				return nil
			}); wEr != nil {
				log.Logger(ctx).Debug("Cannot publish READ event on node", fNode.Zap(), zap.Error(er))
			}
		}

		// Handle Pagination
		if total > 0 && bulkRequest.Limit > 0 && childrenLoaded < total {
			pagination = PopulatePagination(bulkRequest.Offset, bulkRequest.Limit, total)
			// If the first page is already smaller than the limit, then do not send pagination data
			// List may have been filtered out
			if countDiffers && !hasFilter {
				if childrenLoaded < bulkRequest.Limit-1 {
					// Assume it's the last
					pagination.TotalPages = pagination.CurrentPage
				} else {
					pagination.TotalPages = -1
				}
			}
		}

	}

	return

}

func (h *Handler) SetMeta(req *restful.Request, resp *restful.Response) error {
	// DEPRECATED
	return errors.WithMessage(errors.StatusForbidden, "This API is deprecated")

}

func (h *Handler) DeleteMeta(req *restful.Request, resp *restful.Response) error {
	// DEPRECATED
	return errors.WithMessage(errors.StatusForbidden, "This API is deprecated")
}

func (h *Handler) GetRouter() nodes.Client {
	if h.router == nil {
		h.router = compose.PathClient(nodes.WithAuditEventsLogging())
	}
	return h.router
}

func (h *Handler) loadNodeByPath(ctx context.Context, nodePath string, flags tree.Flags) (*tree.Node, error) {
	nodePath = strings.TrimSuffix(nodePath, "/")
	response, err := h.GetRouter().ReadNode(ctx, &tree.ReadNodeRequest{
		StatFlags: flags,
		Node: &tree.Node{
			Path: nodePath,
		},
	})
	log.Logger(ctx).Debug("Querying Tree Service by Path: ", zap.String("p", nodePath), zap.Any("flags", flags), zap.Any("resp", response), zap.Error(err))

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
			oo = append(oo, r.Node)
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
