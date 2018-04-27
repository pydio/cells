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
	"strings"
	"sync"
	"unsafe"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/common/views"
	"go.uber.org/zap"
)

var collPool = (*chngCollPool)(&sync.Pool{New: func() interface{} {
	return new(rest.ChangeCollection)
}})

type chngCollPool sync.Pool

func (c *chngCollPool) Get() (coll *rest.ChangeCollection) {
	return (*sync.Pool)(unsafe.Pointer(c)).Get().(*rest.ChangeCollection)
}

func (c *chngCollPool) Put(coll *rest.ChangeCollection) {
	coll.Changes = nil
	(*sync.Pool)(unsafe.Pointer(c)).Put(coll)
}

// Handler for REST interface to changes API
type Handler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"ChangeService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return nil
}

// Get lines matched by the query
func (h Handler) GetChanges(req *restful.Request, rsp *restful.Response) {

	// Requests are defined in protobuf with an explicit input and output
	// that we can directly read to an expected type
	var restReq rest.ChangeRequest
	if err := req.ReadEntity(&restReq); err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	if restReq.Filter == "" {
		service.RestError500(req, rsp, errors.BadRequest(common.SERVICE_CHANGES, "Please provide a filter parameter"))
		return
	}
	ctx := req.Request.Context()
	// This the expected Output format
	coll := collPool.Get()
	defer collPool.Put(coll)

	// Do not declare clients as package var, we must create clients as we need them
	// to make sure to get a "fresh" connection
	indexClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())

	// Use router to transform filter to absolute path
	// TODO : if root of a workspace, we have to list the root to get all the possible root nodes
	// In that case make multiple calls of modify grpc handler to manage multiple filters ?
	r := views.NewStandardRouter(views.RouterOptions{LogReadEvents: false})
	inputFilterNode := &tree.Node{Path: restReq.Filter}
	var wrapError error
	r.WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
		ctx, inputFilterNode, wrapError = inputFilter(ctx, inputFilterNode, "in")
		return nil
	})
	if wrapError != nil {
		service.RestError404(req, rsp, wrapError)
		return
	}
	aclList, err := views.AccessListFromContext(ctx)
	if err != nil {
		service.RestError404(req, rsp, err)
		return
	}
	recyclePath := inputFilterNode.Path + "/recycle_bin"

	q := &tree.SearchSyncChangeRequest{
		Seq:    uint64(restReq.SeqID),
		Prefix: inputFilterNode.Path,
	}
	changesClient := tree.NewSyncChangesClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CHANGES, defaults.NewClient())
	res, err := changesClient.Search(ctx, q)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	defer res.Close()

	for {
		change, e := res.Recv()
		if e != nil {
			break
		}
		if change == nil {
			continue
		}
		log.Logger(ctx).Info("Sending Change", zap.Any("c", change))
		if h.filterChange(ctx, change, aclList, inputFilterNode.Path, recyclePath) {
			continue
		}
		h.enrichChange(ctx, change, indexClient, inputFilterNode.Path)
		coll.Changes = append(coll.Changes, change)
	}

	// Make a last call to get Last Seq ID
	if last, e := h.lastSequenceId(ctx, changesClient); e == nil {
		coll.LastSeqId = int64(last)
	}

	rsp.WriteEntity(coll)

}

// Send a Search query with LastSeqOnly parameter to get the overall very last sequence ID
func (h Handler) lastSequenceId(ctx context.Context, changesClient tree.SyncChangesClient) (uint64, error) {
	streamer, err := changesClient.Search(ctx, &tree.SearchSyncChangeRequest{LastSeqOnly: true})
	if err != nil {
		return 0, err
	}
	defer streamer.Close()
	for {
		r, e := streamer.Recv()
		if e != nil {
			break
		}
		return r.Seq, nil
	}
	return 0, nil
}

// 1 - Filter "out of filter" nodes => transform moves to create/delete
// 2 - Filter /recycle_bin/* path, transform moves to create/delete
// 3 - Filter by ACLs here to ignore changes that are entirely out of path, transform moves to create/delete
func (h Handler) filterChange(ctx context.Context, change *tree.SyncChange, aclList *utils.AccessList, pathFilter string, recyclePath string) (ignore bool) {

	log.Logger(ctx).Info("FILTER CHANGE", zap.Any("change", change), zap.Any("pathFilter", pathFilter), zap.Any("recycle", recyclePath))
	// 1 - Filter out moves that are node inside our filter
	if h.filterByPath("out", change, pathFilter) {
		return true
	}

	log.Logger(ctx).Info("FILTER CHANGE > 1", zap.Any("change", change))

	// 2 - Filter /recycle_bin/* path, transform moves to create/delete
	if h.filterByPath("in", change, recyclePath) {
		return true
	}

	log.Logger(ctx).Info("FILTER CHANGE > 2", zap.Any("change", change))

	// 3 - Acl List
	/*
		if h.filterByAcl(ctx, change, aclList) {
			return true
		}
		log.Logger(ctx).Info("FILTER CHANGE > 3", zap.Any("change", change))
	*/

	// 4 - Now Trim Prefix on absolute path's
	h.trimPrefix(change, pathFilter)

	log.Logger(ctx).Info("FILTER CHANGE > 4", zap.Any("change", change))

	return false
}

// Check paths are inside scope. If both are out of scope, return ignore true
func (h Handler) filterByPath(filterType string, change *tree.SyncChange, path string) (ignore bool) {

	if change.Target != "" && change.Target != "NULL" && (filterType == "out" && !strings.HasPrefix(change.Target, path) || filterType == "in" && strings.HasPrefix(change.Target, path)) {
		change.Target = "NULL"
		change.Type = tree.SyncChange_delete
	}
	if change.Source != "" && change.Source != "NULL" && (filterType == "out" && !strings.HasPrefix(change.Source, path) || filterType == "in" && strings.HasPrefix(change.Source, path)) {
		change.Source = "NULL"
		change.Type = tree.SyncChange_create
	}

	return change.Target == "NULL" && change.Source == "NULL"

}

// Check paths are readable by ACL. If both are out of scope, return ignore true
func (h Handler) filterByAcl(ctx context.Context, change *tree.SyncChange, aclList *utils.AccessList) (ignore bool) {

	if change.Target != "" && change.Target != "NULL" && !aclList.CanRead(ctx, &tree.Node{Path: change.Target, Uuid: change.NodeId}) {
		change.Target = "NULL"
		change.Type = tree.SyncChange_delete
	}
	if change.Source != "" && change.Source != "NULL" && !aclList.CanRead(ctx, &tree.Node{Path: change.Source, Uuid: change.NodeId}) {
		change.Source = "NULL"
		change.Type = tree.SyncChange_create
	}

	return change.Target == "NULL" && change.Source == "NULL"
}

// Remove absolute path prefix
func (h Handler) trimPrefix(change *tree.SyncChange, prefix string) {

	if change.Target != "" && change.Target != "NULL" {
		change.Target = strings.TrimPrefix(change.Target, prefix)
	}
	if change.Source != "" && change.Source != "NULL" {
		change.Source = strings.TrimPrefix(change.Source, prefix)
	}

}

// Append node data if it's present in index
func (h Handler) enrichChange(ctx context.Context, change *tree.SyncChange, indexClient tree.NodeProviderClient, pathFilter string) error {

	change.Node = &tree.SyncChangeNode{}

	if change.Type == tree.SyncChange_delete {
		return nil
	}

	// Grab node from index - We could use a client streamer here, but not implemented on TreeService yet.
	if nodeResp, e := indexClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: change.NodeId}}); e == nil {
		found := nodeResp.Node
		md5 := found.Etag
		if !found.IsLeaf() {
			md5 = "directory"
		}
		change.Node = &tree.SyncChangeNode{
			NodePath: strings.TrimPrefix(found.Path, pathFilter),
			Bytesize: found.Size,
			Md5:      md5,
			Mtime:    found.MTime,
		}
	}

	return nil

}
