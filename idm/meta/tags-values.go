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

package meta

import (
	"context"

	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/proto/docstore"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

const TagsDocStoreId = "user_meta_tags"

type TagsValuesClient interface {
	ListTags(ctx context.Context, namespace string) ([]string, *docstore.Document)
	StoreNewTags(ctx context.Context, namespace string, tags []string) error
	DeleteAllTags(ctx context.Context, namespace string) error
}

func NewTagsValuesClient() TagsValuesClient {
	return &tgClient{}
}

// tgClient is an utilitary used for listing/storing a set of values used in a given usermeta namespace
type tgClient struct{}

func (s *tgClient) getClient(ctx context.Context) docstore.DocStoreClient {
	return docstorec.DocStoreClient(ctx)
}

// ListTags retrieves all values from the docstore
func (s *tgClient) ListTags(ctx context.Context, namespace string) ([]string, *docstore.Document) {
	var tags []string
	var doc *docstore.Document
	r, e := s.getClient(ctx).GetDocument(ctx, &docstore.GetDocumentRequest{
		StoreID:    TagsDocStoreId,
		DocumentID: namespace,
	})
	if e == nil && r != nil && r.Document != nil {
		doc = r.Document
		var docTags []string
		if e := json.Unmarshal([]byte(r.Document.Data), &docTags); e == nil {
			tags = docTags
		}
	}
	return tags, doc
}

// StoreNewTags checks if there are new values and update the list in the docstore accordingly
func (s *tgClient) StoreNewTags(ctx context.Context, namespace string, tags []string) error {
	// Store new tags
	currentTags, storeDocument := s.ListTags(ctx, namespace)
	changes := false
	for _, newT := range tags {
		found := false
		for _, crt := range currentTags {
			if crt == newT {
				found = true
				break
			}
		}
		if !found {
			currentTags = append(currentTags, newT)
			changes = true
		}
	}
	if changes {
		// Now store back
		jsonData, _ := json.Marshal(currentTags)
		if storeDocument != nil {
			storeDocument.Data = string(jsonData)
		} else {
			storeDocument = &docstore.Document{
				ID:   namespace,
				Data: string(jsonData),
			}
		}
		_, e := s.getClient(ctx).PutDocument(ctx, &docstore.PutDocumentRequest{
			StoreID:    TagsDocStoreId,
			Document:   storeDocument,
			DocumentID: namespace,
		})
		if e != nil {
			return e
		}
	}
	return nil
}

// DeleteAllTags can be used to clear all values for this namespace
func (s *tgClient) DeleteAllTags(ctx context.Context, namespace string) error {
	if _, e := s.getClient(ctx).DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{
		StoreID:    TagsDocStoreId,
		DocumentID: namespace,
	}); e != nil {
		return e
	}
	return nil
}
