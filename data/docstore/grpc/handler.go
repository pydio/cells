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

package grpc

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	proto "github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/data/docstore"
)

type Handler struct {
	proto.UnimplementedDocStoreServer
	sync.UnimplementedSyncEndpointServer
}

func (h *Handler) Name() string {
	return Name
}

func (h *Handler) PutDocument(ctx context.Context, request *proto.PutDocumentRequest) (*proto.PutDocumentResponse, error) {
	dao, err := manager.Resolve[docstore.DAO](ctx)
	if err != nil {
		return nil, err
	}

	e := dao.PutDocument(ctx, request.StoreID, request.Document)
	log.Logger(ctx).Debug("PutDocument", zap.String("store", request.StoreID), zap.String("docId", request.Document.ID))
	if e != nil {
		log.Logger(ctx).Error("PutDocument", zap.Error(e))
		return nil, e
	}
	return &proto.PutDocumentResponse{Document: request.Document}, nil
}

func (h *Handler) GetDocument(ctx context.Context, request *proto.GetDocumentRequest) (*proto.GetDocumentResponse, error) {
	dao, err := manager.Resolve[docstore.DAO](ctx)
	if err != nil {
		return nil, err
	}

	log.Logger(ctx).Debug("GetDocument", zap.String("store", request.StoreID), zap.String("docId", request.DocumentID))
	doc, e := dao.GetDocument(ctx, request.StoreID, request.DocumentID)
	if e != nil {
		return nil, fmt.Errorf("document not found")
	}
	return &proto.GetDocumentResponse{Document: doc}, nil
}

func (h *Handler) DeleteDocuments(ctx context.Context, request *proto.DeleteDocumentsRequest) (*proto.DeleteDocumentsResponse, error) {

	dao, err := manager.Resolve[docstore.DAO](ctx)
	if err != nil {
		return nil, err
	}

	response := &proto.DeleteDocumentsResponse{}

	if request.Query != nil && request.Query.MetaQuery != "" {

		count, er := dao.DeleteDocuments(ctx, request.StoreID, request.Query)
		if er != nil {
			return nil, er
		}
		return &proto.DeleteDocumentsResponse{DeletionCount: int32(count), Success: true}, nil

	} else {

		err := dao.DeleteDocument(ctx, request.StoreID, request.DocumentID)
		if err != nil {
			return nil, err
		}
		response.Success = true
		response.DeletionCount = 1
		return response, nil

	}
}

func (h *Handler) CountDocuments(ctx context.Context, request *proto.ListDocumentsRequest) (*proto.CountDocumentsResponse, error) {

	log.Logger(ctx).Debug("CountDocuments", zap.Any("req", request))

	dao, err := manager.Resolve[docstore.DAO](ctx)
	if err != nil {
		return nil, err
	}

	if request.Query == nil || request.Query.MetaQuery == "" {
		return nil, fmt.Errorf("Please provide at least a meta query")
	}
	total, err := dao.CountDocuments(ctx, request.StoreID, request.Query)
	if err != nil {
		return nil, err
	}

	return &proto.CountDocumentsResponse{Total: int64(total)}, nil

}

func (h *Handler) ListDocuments(request *proto.ListDocumentsRequest, stream proto.DocStore_ListDocumentsServer) error {

	ctx := stream.Context()
	log.Logger(ctx).Debug("ListDocuments", zap.Any("req", request))

	dao, err := manager.Resolve[docstore.DAO](ctx)
	if err != nil {
		return err
	}

	results, err := dao.QueryDocuments(ctx, request.StoreID, request.Query)
	if err != nil {
		return err
	}
	for doc := range results {
		if err := stream.Send(&proto.ListDocumentsResponse{Document: doc}); err != nil {
			return err
		}
	}

	return nil

}

// TriggerResync clear search index and reindex all docs from DB
func (h *Handler) TriggerResync(ctx context.Context, request *sync.ResyncRequest) (*sync.ResyncResponse, error) {

	/*
		stores, e := h.DAO.ListStores()
		if e != nil {
			return nil, e
		}
		if e := h.DAO.Reset(); e != nil {
			return nil, e
		}

		// TODO v4
		go func() {
			for _, s := range stores {
				log.Logger(ctx).Info("Browsing store", zap.String("store", s))
				docs, done, e := h.Db.ListDocuments(s, &proto.DocumentQuery{})
				if e != nil {
					continue
				}
			loop:
				for {
					select {
					case doc := <-docs:
						log.Logger(ctx).Info("-- Reindexing", zap.String("docID", doc.ID))
						h.Indexer.IndexDocument(s, doc)
					case <-done:
						break loop
					}
				}
			}
		}()

	*/

	return &sync.ResyncResponse{Success: true}, nil
}
