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

package storage

import (
	"context"
	"crypto/md5"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/pydio/cells/common/config/raft"
	"github.com/pydio/cells/common/proto/storage"
	proto "github.com/pydio/config-srv/proto/config"
	go_micro_os_config "github.com/pydio/go-os/config/proto"
)

var (
	errNotImplemented = errors.New("service not implemented")
	errNotFound       = errors.New("not found")
)

type Handler struct {
	store *raft.KVStore
}

func NewHandler(store *raft.KVStore) *Handler {
	return &Handler{store}
}

func (h *Handler) Propose(ctx context.Context, request *storage.ProposeRequest, resp *storage.ProposeResponse) error {
	key := request.GetKey()
	value := request.GetValue()

	h.store.Propose(key, string(value))

	return nil
}

func (h *Handler) Lookup(ctx context.Context, request *storage.LookupRequest, resp *storage.LookupResponse) error {
	key := request.Key

	if v, ok := h.store.Lookup(key); ok {
		resp.Value = []byte(v)
	}

	return nil
}

func (h *Handler) Create(ctx context.Context, request *proto.CreateRequest, response *proto.CreateResponse) error {
	return h.Update(ctx, &proto.UpdateRequest{
		Change: request.Change,
	}, &proto.UpdateResponse{})
}

func (h *Handler) Update(ctx context.Context, request *proto.UpdateRequest, response *proto.UpdateResponse) error {
	var data interface{}

	if err := json.Unmarshal([]byte(request.Change.ChangeSet.Data), &data); err != nil {
		return err
	}

	h.store.Propose(request.Change.Path, data)

	return nil
}

func (h *Handler) Delete(ctx context.Context, request *proto.DeleteRequest, response *proto.DeleteResponse) error {
	h.store.Propose(request.Change.Path, "")

	return nil
}

func (h *Handler) Search(ctx context.Context, request *proto.SearchRequest, response *proto.SearchResponse) error {
	return errNotImplemented
}

func (h *Handler) Read(ctx context.Context, request *proto.ReadRequest, response *proto.ReadResponse) error {
	val, ok := h.store.Lookup(request.Path)
	if !ok {
		return errNotFound
	}

	hasher := md5.New()
	hasher.Write([]byte(val))
	checksum := fmt.Sprintf("%x", hasher.Sum(nil))

	response.Change = &proto.Change{
		Timestamp: time.Now().Unix(),
		Path:      request.Path,
		ChangeSet: &go_micro_os_config.ChangeSet{
			Data:      val,
			Source:    request.Id,
			Checksum:  checksum,
			Timestamp: time.Now().Unix(),
		},
	}

	return nil
}

func (h *Handler) AuditLog(ctx context.Context, request *proto.AuditLogRequest, response *proto.AuditLogResponse) error {
	return errNotImplemented
}

func (h *Handler) Watch(ctx context.Context, request *proto.WatchRequest, stream proto.Config_WatchStream) error {
	return errNotImplemented
}
