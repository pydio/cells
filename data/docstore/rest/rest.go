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
	"errors"

	"github.com/emicklei/go-restful"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"go.uber.org/zap"
)

type Handler struct{}

var (
	storeClient docstore.DocStoreClient
)

func getClient() docstore.DocStoreClient {
	if storeClient == nil {
		storeClient = docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	}
	return storeClient
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"DocStoreService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return nil
}

func (h *Handler) GetDoc(req *restful.Request, resp *restful.Response) {

	log.Logger(req.Request.Context()).Debug("Docstore.Get on " + req.PathParameter("StoreID"))

	input := &docstore.GetDocumentRequest{
		StoreID:    req.PathParameter("StoreID"),
		DocumentID: req.PathParameter("DocumentID"),
	}

	response, err := getClient().GetDocument(req.Request.Context(), input)
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}

	resp.WriteEntity(response)

}

func (h *Handler) PutDoc(req *restful.Request, resp *restful.Response) {

	log.Logger(req.Request.Context()).Debug("Docstore.Put on " + req.PathParameter("StoreID"))

	var input docstore.PutDocumentRequest
	if err := req.ReadEntity(&input); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	if input.StoreID == "" {
		input.StoreID = req.PathParameter("StoreID")
	}
	if input.Document.ID == "" {
		input.Document.ID = req.PathParameter("DocumentID")
	}

	response, err := getClient().PutDocument(req.Request.Context(), &input)
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}
	resp.WriteEntity(response)

}

func (h *Handler) ListDocs(req *restful.Request, resp *restful.Response) {

	log.Logger(req.Request.Context()).Debug("Docstore.List on " + req.PathParameter("StoreID"))

	var input rest.ListDocstoreRequest
	if err := req.ReadEntity(&input); err != nil {
		service.RestError500(req, resp, err)
		return
	}

	if input.StoreID == "" {
		input.StoreID = req.PathParameter("StoreID")
	}
	if input.Query == nil {
		input.Query = &docstore.DocumentQuery{}
	}

	output := &rest.DocstoreCollection{}

	if input.CountOnly {

		cResp, err := getClient().CountDocuments(req.Request.Context(), &docstore.ListDocumentsRequest{
			Query:   input.Query,
			StoreID: input.StoreID,
		})
		if err != nil {
			service.RestError500(req, resp, err)
			return
		}
		output.Total = cResp.Total

	} else {

		streamer, err := getClient().ListDocuments(req.Request.Context(), &docstore.ListDocumentsRequest{
			StoreID: input.StoreID,
			Query:   input.Query,
		})
		if err != nil {
			service.RestError500(req, resp, err)
			return
		}
		defer streamer.Close()
		for {
			if sResp, err := streamer.Recv(); err == nil {
				if sResp == nil {
					continue
				}
				output.Docs = append(output.Docs, sResp.Document)
			} else {
				break
			}
		}
		output.Total = int64(len(output.Docs))
	}

	resp.WriteEntity(output)

}

func (h *Handler) DeleteDoc(req *restful.Request, resp *restful.Response) {

	var input docstore.DeleteDocumentsRequest
	if err := req.ReadEntity(&input); err != nil {
		service.RestError500(req, resp, err)
		return
	}

	log.Logger(req.Request.Context()).Info("Docstore.Delete on ", zap.Any("DeleteDocRequest", input))

	if input.DocumentID == "" && (input.Query == nil || (input.Query.MetaQuery == "" && input.Query.Owner == "")) {
		service.RestError500(req, resp, errors.New("please provide a context for deletion."))
		return
	}

	response, err := getClient().DeleteDocuments(req.Request.Context(), &input)
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}
	resp.WriteEntity(response)

}
