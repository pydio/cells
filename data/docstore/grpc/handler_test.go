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
	"github.com/pydio/cells/v4/common/dao/test"
	"log"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"google.golang.org/grpc/metadata"

	proto "github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/data/docstore"
	. "github.com/smartystreets/goconvey/convey"
)

type listDocsTestStreamer struct {
	Docs []*proto.ListDocumentsResponse
	Ctx  context.Context
}

func (l *listDocsTestStreamer) SetHeader(md metadata.MD) error {
	panic("implement me")
}

func (l *listDocsTestStreamer) SendHeader(md metadata.MD) error {
	panic("implement me")
}

func (l *listDocsTestStreamer) SetTrailer(md metadata.MD) {
	panic("implement me")
}

func (l *listDocsTestStreamer) Context() context.Context {
	return l.Ctx
}

func newPath(tmpName string) string {
	return filepath.Join(os.TempDir(), tmpName)
}

func (l *listDocsTestStreamer) SendMsg(interface{}) error {
	return nil
}

func (l *listDocsTestStreamer) RecvMsg(interface{}) error {
	return nil
}

func (l *listDocsTestStreamer) Close() error {
	return nil
}

func (l *listDocsTestStreamer) Send(r *proto.ListDocumentsResponse) error {
	l.Docs = append(l.Docs, r)
	return nil
}

func createTestHandler(suffix string) (*Handler, func()) {

	var closer func()
	d, c, e := test.OnFileTestDAO("boltdb", newPath("docstore"+suffix+".db"), "", "docstore-test", false, docstore.NewDAO)
	if e != nil {
		log.Fatal(e)
	}
	if bs, o := d.(*docstore.BleveServer); o {
		bPath := strings.ReplaceAll(bs.DAO.DB().Path(), "docstore"+suffix+".db", "docstore"+suffix+".bleve")
		closer = func() {
			c()
			fmt.Println("dropping on-file bleve" + bPath)
			os.RemoveAll(bPath)
		}
	} else {
		closer = c
	}
	return &Handler{DAO: d.(docstore.DAO)}, closer
}

func TestHandler_CloseBolt(t *testing.T) {

	Convey("Test init/close handler", t, func() {

		pBolt := newPath("docstoreT.db")
		pBleve := newPath("docstoreT.bleve")
		defer func() {
			os.RemoveAll(pBolt)
			os.RemoveAll(pBleve)
		}()

		store, err := docstore.NewBoltStore(pBolt, true)
		So(err, ShouldBeNil)

		indexer, err := docstore.NewBleveEngine(store, pBleve, true)
		So(err, ShouldBeNil)

		handler := &Handler{
			DAO: indexer,
		}

		cE := handler.Close(context.Background())
		So(cE, ShouldBeNil)
		e := store.Close()
		So(e, ShouldBeNil)

		s1, _ := os.Stat(pBolt)
		s2, _ := os.Stat(pBleve)
		So(s1, ShouldBeNil)
		So(s2, ShouldBeNil)

	})

}

func TestHandler_CRUD(t *testing.T) {

	ctx := context.Background()
	Convey("Test Document GET/PUT/DELETE", t, func() {

		h, closer := createTestHandler("crud")
		defer closer()

		_, e := h.PutDocument(ctx, &proto.PutDocumentRequest{
			StoreID: "any-store",
			Document: &proto.Document{
				Type:          proto.DocumentType_JSON,
				ID:            "my-doc-id",
				Owner:         "admin",
				Data:          `{"key1":"value1"}`,
				IndexableMeta: `{"key1":"value1"}`,
			},
		})
		So(e, ShouldBeNil)

		getDocResp, e2 := h.GetDocument(ctx, &proto.GetDocumentRequest{
			StoreID:    "any-store",
			DocumentID: "my-doc-id",
		})
		So(e2, ShouldBeNil)
		So(getDocResp.Document.Data, ShouldResemble, `{"key1":"value1"}`)

		delDocResp, e3 := h.DeleteDocuments(ctx, &proto.DeleteDocumentsRequest{
			StoreID:    "any-store",
			DocumentID: "my-doc-id",
		})
		So(e3, ShouldBeNil)
		So(delDocResp.Success, ShouldBeTrue)
		So(delDocResp.DeletionCount, ShouldEqual, 1)

		// Try to get deleted doc
		getDocResp2, e4 := h.GetDocument(ctx, &proto.GetDocumentRequest{
			StoreID:    "any-store",
			DocumentID: "my-doc-id",
		})
		So(e4, ShouldNotBeNil)
		So(getDocResp2, ShouldBeNil)

		_, e = h.PutDocument(ctx, &proto.PutDocumentRequest{
			StoreID: "any-store",
			Document: &proto.Document{
				Type:  proto.DocumentType_JSON,
				ID:    "my-doc-id",
				Owner: "admin",
				Data:  `{"key1":"value1","key2":{"Sub_key":"Sub_value"},"key3":[{"array_key":"array_value"}]}`,
			},
		})
		So(e, ShouldBeNil)

		getDocResp3, e3 := h.GetDocument(ctx, &proto.GetDocumentRequest{
			StoreID:    "any-store",
			DocumentID: "my-doc-id",
		})
		So(e3, ShouldBeNil)
		So(getDocResp3.Document.Data, ShouldEqual, `{"key1":"value1","key2":{"Sub_key":"Sub_value"},"key3":[{"array_key":"array_value"}]}`)

		_, e = h.PutDocument(ctx, &proto.PutDocumentRequest{
			StoreID: "any-store",
			Document: &proto.Document{
				Type:  proto.DocumentType_JSON,
				ID:    "my-doc-id2",
				Owner: "admin",
				Data:  `{"key1":0.0}`,
			},
		})
		So(e, ShouldBeNil)

		getDocResp3, e3 = h.GetDocument(ctx, &proto.GetDocumentRequest{
			StoreID:    "any-store",
			DocumentID: "my-doc-id2",
		})
		So(e3, ShouldBeNil)
		So(getDocResp3.Document.Data, ShouldEqual, `{"key1":0.0}`)

		delDocResp, e3 = h.DeleteDocuments(ctx, &proto.DeleteDocumentsRequest{
			StoreID:    "any-store",
			DocumentID: "my-doc-id",
		})
		So(e3, ShouldBeNil)
		So(delDocResp.Success, ShouldBeTrue)
		So(delDocResp.DeletionCount, ShouldEqual, 1)

		_, e3 = h.DeleteDocuments(ctx, &proto.DeleteDocumentsRequest{
			StoreID:    "any-store",
			DocumentID: "my-doc-id2",
		})
		So(e3, ShouldBeNil)

	})

}

func TestHandler_Search(t *testing.T) {

	ctx := context.Background()
	Convey("Test Document LIST/SEARCH", t, func() {

		h, closer := createTestHandler("list")
		defer closer()

		_, e := h.PutDocument(ctx, &proto.PutDocumentRequest{
			StoreID: "any-store",
			Document: &proto.Document{
				Type:          proto.DocumentType_JSON,
				ID:            "my-doc-id-1",
				Owner:         "admin",
				Data:          `{"key":"value", "key2":"value2", "key3":45, "KEY4":"other4", "key5":{"keySub":"value"}}`,
				IndexableMeta: `{"key":"value", "key2":"value2", "key3":45, "KEY4":"other4", "key5":{"keySub":"value"}}`,
			},
		})
		So(e, ShouldBeNil)

		_, e = h.PutDocument(ctx, &proto.PutDocumentRequest{
			StoreID: "any-store",
			Document: &proto.Document{
				Type:          proto.DocumentType_JSON,
				ID:            "my-doc-id-2",
				Owner:         "charles",
				Data:          `{"key":"value", "key2":"other", "key3":50}`,
				IndexableMeta: `{"key":"value", "key2":"other", "key3":50}`,
			},
		})
		So(e, ShouldBeNil)

		streamer := &listDocsTestStreamer{Ctx: ctx}
		e1 := h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				Owner: "admin",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 1)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				Owner: "unknwown",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 0)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+key:value",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 2)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+key2:value2",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 1)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+key3:<49",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 1)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+key3:<45",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 0)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+key3:>45 +key2:value2",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 0)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+KEY4:other4",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 1)

		streamer = &listDocsTestStreamer{Ctx: ctx}
		e1 = h.ListDocuments(&proto.ListDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+key5.keySub:val*",
			},
		}, streamer)
		So(e1, ShouldBeNil)
		So(streamer.Docs, ShouldHaveLength, 1)

		// NOW DELETE DOCS
		delDocs, e1 := h.DeleteDocuments(ctx, &proto.DeleteDocumentsRequest{
			StoreID: "any-store",
			Query: &proto.DocumentQuery{
				MetaQuery: "+key:value",
			},
		})
		So(e1, ShouldBeNil)
		So(delDocs.DeletionCount, ShouldEqual, 2)

	})
}
