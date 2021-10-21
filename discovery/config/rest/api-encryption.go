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
	"github.com/emicklei/go-restful"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/service"
)

/****************************
    MASTER KEYS MANAGEMENT
*****************************/

// ListEncryptionKeys simply forwards to underlying key service
func (s *Handler) ListEncryptionKeys(req *restful.Request, resp *restful.Response) {
	var request encryption.AdminListKeysRequest
	if e := req.ReadEntity(&request); e != nil {
		service.RestError500(req, resp, e)
		return
	}

	encClient := encryption.NewUserKeyStoreClient(common.ServiceGrpcNamespace_+common.ServiceUserKey, defaults.NewClient())
	var response *encryption.AdminListKeysResponse
	var err error
	if response, err = encClient.AdminListKeys(req.Request.Context(), &request); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	resp.WriteEntity(response)
}

// CreateEncryptionKey simply forwards to underlying key service
func (s *Handler) CreateEncryptionKey(req *restful.Request, resp *restful.Response) {
	var request encryption.AdminCreateKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		service.RestError500(req, resp, e)
		return
	}

	encClient := encryption.NewUserKeyStoreClient(common.ServiceGrpcNamespace_+common.ServiceUserKey, defaults.NewClient())
	var response *encryption.AdminCreateKeyResponse
	var err error
	if response, err = encClient.AdminCreateKey(req.Request.Context(), &request); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	resp.WriteEntity(response)
}

// DeleteEncryptionKey simply forwards to underlying key service
func (s *Handler) DeleteEncryptionKey(req *restful.Request, resp *restful.Response) {
	var request encryption.AdminDeleteKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		service.RestError500(req, resp, e)
		return
	}

	encClient := encryption.NewUserKeyStoreClient(common.ServiceGrpcNamespace_+common.ServiceUserKey, defaults.NewClient())
	var response *encryption.AdminDeleteKeyResponse
	var err error
	if response, err = encClient.AdminDeleteKey(req.Request.Context(), &request); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	resp.WriteEntity(response)
}

// ExportEncryptionKey simply forwards to underlying key service
func (s *Handler) ExportEncryptionKey(req *restful.Request, resp *restful.Response) {
	var request encryption.AdminExportKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		service.RestError500(req, resp, e)
		return
	}

	encClient := encryption.NewUserKeyStoreClient(common.ServiceGrpcNamespace_+common.ServiceUserKey, defaults.NewClient())
	var response *encryption.AdminExportKeyResponse
	var err error
	if response, err = encClient.AdminExportKey(req.Request.Context(), &request); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	resp.WriteEntity(response)
}

// ImportEncryptionKey forwards call to underlying key service
func (s *Handler) ImportEncryptionKey(req *restful.Request, resp *restful.Response) {
	var request encryption.AdminImportKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		service.RestError500(req, resp, e)
		return
	}

	encClient := encryption.NewUserKeyStoreClient(common.ServiceGrpcNamespace_+common.ServiceUserKey, defaults.NewClient())
	var response *encryption.AdminImportKeyResponse
	var err error
	if response, err = encClient.AdminImportKey(req.Request.Context(), &request); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	resp.WriteEntity(response)
}
