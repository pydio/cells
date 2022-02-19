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

package events

import (
	"context"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"io"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/service/errors"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

func WithRead() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if options.LogReadEvents {
			options.Wrappers = append(options.Wrappers, &HandlerRead{})
		}
	}
}

// HandlerRead publishes events after reading files.
type HandlerRead struct {
	abstract.Handler
}

func (h *HandlerRead) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	h.AdaptOptions(c, options)
	return h
}

func (h *HandlerRead) feedNodeUuid(ctx context.Context, node *tree.Node) error {
	response, e := h.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
	if e != nil {
		return e
	}
	node.Uuid = response.Node.Uuid
	node.Type = response.Node.Type
	return nil
}

func (h *HandlerRead) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	c, e := h.Next.ListNodes(ctx, in, opts...)
	if branchInfo, ok := nodes.GetBranchInfo(ctx, "in"); ok && branchInfo.IsInternal() {
		return c, e
	}
	if e == nil && in.Node != nil {
		node := in.Node.Clone()
		if node.Uuid == "" {
			if e := h.feedNodeUuid(ctx, node); e != nil {
				log.Logger(ctx).Error("HandlerRead did not find Uuid!", zap.Error(e))
			}
		}
		if node.Uuid != "" {
			c := metadata.NewBackgroundWithMetaCopy(ctx)
			go func() {
				broker.MustPublish(c, common.TopicTreeChanges, &tree.NodeChangeEvent{
					Type:   tree.NodeChangeEvent_READ,
					Target: node,
				})
			}()
		}
	}
	return c, e
}

func (h *HandlerRead) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {

	logger := log.Logger(ctx)

	var (
		doc      *docstore.Document
		linkData *docstore.ShareDocument
	)

	if doc, linkData = h.sharedLinkWithDownloadLimit(ctx); doc != nil && linkData != nil {
		// Check download limit!
		if linkData.DownloadCount >= linkData.DownloadLimit {
			return nil, errors.Forbidden("MaxDownloadsReached", "You are not allowed to download this document")
		}
	}

	reader, e := h.Next.GetObject(ctx, node, requestData)
	if branchInfo, ok := nodes.GetBranchInfo(ctx, "in"); ok && branchInfo.IsInternal() {
		return reader, e
	}
	if e == nil && requestData.StartOffset == 0 {
		eventNode := node.Clone()
		if eventNode.Uuid == "" {
			if e := h.feedNodeUuid(ctx, eventNode); e != nil {
				logger.Debug("HandlerRead did not find Uuid!", zap.Error(e))
			}
		}
		if eventNode.Uuid != "" {
			if eventNode.Type == tree.NodeType_UNKNOWN {
				// Assume it's a file
				eventNode.Type = tree.NodeType_LEAF
			}
			c := metadata.NewBackgroundWithMetaCopy(ctx)
			go func() {
				broker.MustPublish(c, common.TopicTreeChanges, &tree.NodeChangeEvent{
					Type:   tree.NodeChangeEvent_READ,
					Target: eventNode,
				})
			}()
		}
		if doc != nil && linkData != nil {
			go func() {
				bgContext := context.Background()
				linkData.DownloadCount++
				newData, _ := json.Marshal(linkData)
				doc.Data = string(newData)
				store := docstore.NewDocStoreClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceDocStore))
				_, e3 := store.PutDocument(bgContext, &docstore.PutDocumentRequest{StoreID: common.DocStoreIdShares, DocumentID: doc.ID, Document: doc})
				if e3 == nil {
					logger.Debug("Updated share download count " + doc.ID)
				} else {
					logger.Error("Docstore error while trying to increment link downloads count", zap.Error(e3))
				}

			}()
		}
	}
	return reader, e

}

func (h *HandlerRead) sharedLinkWithDownloadLimit(ctx context.Context) (doc *docstore.Document, linkData *docstore.ShareDocument) {

	userLogin, claims := permissions.FindUserNameInContext(ctx)
	// TODO - Have the 'hidden' info directly in claims => could it be a profile instead ?
	if claims.Profile != common.PydioProfileShared {
		return
	}
	bgContext := clientcontext.WithClientConn(context.Background(), clientcontext.GetClientConn(ctx))
	user, e := permissions.SearchUniqueUser(bgContext, userLogin, "", &idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeValue: "true"})
	if e != nil || user == nil {
		return
	}
	// This is a unique hidden user - search corresponding link and update download number
	store := docstore.NewDocStoreClient(grpc2.GetClientConnFromCtx(ctx, common.ServiceDocStore))

	// SEARCH WITH PRESET_LOGIN
	stream, e := store.ListDocuments(bgContext, &docstore.ListDocumentsRequest{StoreID: common.DocStoreIdShares, Query: &docstore.DocumentQuery{
		MetaQuery: "+SHARE_TYPE:minisite +PRESET_LOGIN:" + userLogin + "",
	}})
	if e != nil {
		return
	}
	if r, e := stream.Recv(); e == nil {
		doc = r.Document
	}
	stream.CloseSend()

	if doc == nil {
		// SEARCH WITH PRELOG_USER
		stream2, e := store.ListDocuments(bgContext, &docstore.ListDocumentsRequest{StoreID: common.DocStoreIdShares, Query: &docstore.DocumentQuery{
			MetaQuery: "+SHARE_TYPE:minisite +PRELOG_USER:" + userLogin + "",
		}})
		if e != nil {
			return
		}
		if r, e := stream2.Recv(); e == nil {
			doc = r.Document
		}
		stream2.CloseSend()
	}

	if doc != nil {
		var data *docstore.ShareDocument
		if e2 := json.Unmarshal([]byte(doc.Data), &data); e2 == nil && data.DownloadLimit > 0 {
			linkData = data
		}
	}
	return
}
