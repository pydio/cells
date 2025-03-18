/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/encryption"
)

/****************************
    MASTER KEYS MANAGEMENT
*****************************/

// ListEncryptionKeys simply forwards to underlying key service
func (s *Handler) ListEncryptionKeys(req *restful.Request, resp *restful.Response) error {
	var request encryption.AdminListKeysRequest
	if e := req.ReadEntity(&request); e != nil {
		return e
	}
	ctx := req.Request.Context()

	encClient := encryption.NewUserKeyStoreClient(grpc.ResolveConn(ctx, common.ServiceUserKeyGRPC))
	var response *encryption.AdminListKeysResponse
	var err error
	if response, err = encClient.AdminListKeys(ctx, &request); err != nil {
		return err
	}
	return resp.WriteEntity(response)
}

// CreateEncryptionKey simply forwards to underlying key service
func (s *Handler) CreateEncryptionKey(req *restful.Request, resp *restful.Response) error {
	var request encryption.AdminCreateKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		return e
	}
	ctx := req.Request.Context()

	encClient := encryption.NewUserKeyStoreClient(grpc.ResolveConn(ctx, common.ServiceUserKeyGRPC))
	var response *encryption.AdminCreateKeyResponse
	var err error
	if response, err = encClient.AdminCreateKey(ctx, &request); err != nil {
		return err
	}
	return resp.WriteEntity(response)
}

// DeleteEncryptionKey simply forwards to underlying key service
func (s *Handler) DeleteEncryptionKey(req *restful.Request, resp *restful.Response) error {
	var request encryption.AdminDeleteKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		return e
	}
	ctx := req.Request.Context()

	encClient := encryption.NewUserKeyStoreClient(grpc.ResolveConn(ctx, common.ServiceUserKeyGRPC))
	var response *encryption.AdminDeleteKeyResponse
	var err error
	if response, err = encClient.AdminDeleteKey(ctx, &request); err != nil {
		return err
	}
	return resp.WriteEntity(response)
}

// ExportEncryptionKey simply forwards to underlying key service
func (s *Handler) ExportEncryptionKey(req *restful.Request, resp *restful.Response) error {
	var request encryption.AdminExportKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		return e
	}
	ctx := req.Request.Context()

	encClient := encryption.NewUserKeyStoreClient(grpc.ResolveConn(ctx, common.ServiceUserKeyGRPC))
	var response *encryption.AdminExportKeyResponse
	var err error
	if response, err = encClient.AdminExportKey(ctx, &request); err != nil {
		return err
	}
	return resp.WriteEntity(response)
}

// ImportEncryptionKey forwards call to underlying key service
func (s *Handler) ImportEncryptionKey(req *restful.Request, resp *restful.Response) error {
	var request encryption.AdminImportKeyRequest
	if e := req.ReadEntity(&request); e != nil {
		return e
	}
	ctx := req.Request.Context()

	encClient := encryption.NewUserKeyStoreClient(grpc.ResolveConn(ctx, common.ServiceUserKeyGRPC))
	var response *encryption.AdminImportKeyResponse
	var err error
	if response, err = encClient.AdminImportKey(ctx, &request); err != nil {
		return err
	}
	return resp.WriteEntity(response)
}
