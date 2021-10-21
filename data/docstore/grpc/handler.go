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

package grpc

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	proto "github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/data/docstore"
)

type Handler struct {
	Db      docstore.Store
	Indexer docstore.Indexer
}

func (h *Handler) Close() error {
	var err error
	err = h.Db.Close()
	if err != nil {
		fmt.Println("[error] Could not close docstore database")
	}
	err = h.Indexer.Close()
	return err
}

func (h *Handler) PutDocument(ctx context.Context, request *proto.PutDocumentRequest, response *proto.PutDocumentResponse) error {
	e := h.Db.PutDocument(request.StoreID, request.Document)
	log.Logger(ctx).Debug("PutDocument", zap.String("store", request.StoreID), zap.String("docId", request.Document.ID))
	if e != nil {
		log.Logger(ctx).Error("PutDocument", zap.Error(e))
		return e
	}
	e = h.Indexer.IndexDocument(request.StoreID, request.Document)
	if e != nil {
		log.Logger(ctx).Error("PutDocument:Index", zap.Error(e))
		return e
	}
	response.Document = request.Document
	return e
}

func (h *Handler) GetDocument(ctx context.Context, request *proto.GetDocumentRequest, response *proto.GetDocumentResponse) error {
	log.Logger(ctx).Debug("GetDocument", zap.String("store", request.StoreID), zap.String("docId", request.DocumentID))
	doc, e := h.Db.GetDocument(request.StoreID, request.DocumentID)
	if e != nil {
		return fmt.Errorf("document not found")
	}
	response.Document = doc
	return nil
}

func (h *Handler) DeleteDocuments(ctx context.Context, request *proto.DeleteDocumentsRequest, response *proto.DeleteDocumentsResponse) error {

	if request.Query != nil && request.Query.MetaQuery != "" {

		docIds, _, err := h.Indexer.SearchDocuments(request.StoreID, request.Query, false)
		if err != nil {
			return err
		}
		//log.Logger(ctx).Debug("SEARCH RESULTS", zap.Any("docs", docIds))
		for _, docId := range docIds {
			log.Logger(ctx).Info("DeleteDocument", zap.String("store", request.StoreID), zap.String("docId", docId))
			if e := h.Db.DeleteDocument(request.StoreID, docId); e == nil {
				// Remove from indexer as well
				h.Indexer.DeleteDocument(request.StoreID, docId)
				response.DeletionCount++
			}

		}
		response.Success = true
		return nil

	} else {

		err := h.Db.DeleteDocument(request.StoreID, request.DocumentID)
		if err != nil {
			return err
		}
		response.Success = true
		response.DeletionCount = 1
		return h.Indexer.DeleteDocument(request.StoreID, request.DocumentID)

	}
}

func (h *Handler) CountDocuments(ctx context.Context, request *proto.ListDocumentsRequest, response *proto.CountDocumentsResponse) error {

	log.Logger(ctx).Debug("CountDocuments", zap.Any("req", request))

	if request.Query == nil || request.Query.MetaQuery == "" {
		return fmt.Errorf("Please provide at least a meta query")
	}
	_, total, err := h.Indexer.SearchDocuments(request.StoreID, request.Query, true)
	if err != nil {
		return err
	}
	response.Total = total
	return nil

}

func (h *Handler) ListDocuments(ctx context.Context, request *proto.ListDocumentsRequest, stream proto.DocStore_ListDocumentsStream) error {

	log.Logger(ctx).Debug("ListDocuments", zap.Any("req", request))

	defer stream.Close()

	if request.Query != nil && request.Query.MetaQuery != "" {

		docIds, _, err := h.Indexer.SearchDocuments(request.StoreID, request.Query, false)
		if err != nil {
			return err
		}
		for _, docId := range docIds {
			if doc, e := h.Db.GetDocument(request.StoreID, docId); e == nil && doc != nil {
				doc.ID = docId
				stream.Send(&proto.ListDocumentsResponse{Document: doc})
			}
		}

	} else {

		results, done, err := h.Db.ListDocuments(request.StoreID, request.Query)

		if err != nil {
			return err
		}

		defer close(results)
		for {
			select {
			case doc := <-results:
				stream.Send(&proto.ListDocumentsResponse{Document: doc})
			case <-done:
				return nil
			}
		}

	}

	return nil
}

// TriggerResync clear search index and reindex all docs from DB
func (h *Handler) TriggerResync(ctx context.Context, request *sync.ResyncRequest, response *sync.ResyncResponse) error {

	stores, e := h.Db.ListStores()
	if e != nil {
		return e
	}
	if e := h.Indexer.Reset(); e != nil {
		return e
	}
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
	response.Success = true

	return nil
}
