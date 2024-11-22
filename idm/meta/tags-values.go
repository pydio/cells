package meta

import (
	"context"

	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/proto/docstore"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

const TagsDocStoreId = "user_meta_tags"

// TagsValuesClient is an utilitary used for listing/storing a set of values used in a given usermeta namespace
type TagsValuesClient struct{}

func (s *TagsValuesClient) getClient(ctx context.Context) docstore.DocStoreClient {
	return docstorec.DocStoreClient(ctx)
}

// ListTags retrieves all values from the docstore
func (s *TagsValuesClient) ListTags(ctx context.Context, namespace string) ([]string, *docstore.Document) {
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
func (s *TagsValuesClient) StoreNewTags(ctx context.Context, namespace string, tags []string) error {
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
func (s *TagsValuesClient) DeleteAllTags(ctx context.Context, namespace string) error {
	if _, e := s.getClient(ctx).DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{
		StoreID:    TagsDocStoreId,
		DocumentID: namespace,
	}); e != nil {
		return e
	}
	return nil
}
