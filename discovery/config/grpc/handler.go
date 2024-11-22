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

package grpc

import (
	"context"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	pb "github.com/pydio/cells/v5/common/proto/config"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

type Handler struct {
	pb.UnimplementedConfigServer
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Get(ctx context.Context, req *pb.GetRequest) (*pb.GetResponse, error) {
	var v any

	if req.Namespace == "vault" {
		var vault config.Store
		if !propagator.Get(ctx, config.VaultKey, &vault) {
			return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find vault in context")
		}

		v = vault.Val(req.GetPath()).Get()
	} else {
		v = config.Get(ctx, req.GetPath()).Get()
	}

	switch vv := v.(type) {
	case []byte:
		return &pb.GetResponse{
			Value: &pb.Value{Data: vv},
		}, nil
	}

	b, err := json.Marshal(v)
	if err != nil {
		return nil, errors.WithMessage(errors.StatusInternalServerError, err.Error())
	}

	return &pb.GetResponse{
		Value: &pb.Value{Data: b},
	}, nil
}

func (h *Handler) Set(ctx context.Context, req *pb.SetRequest) (*pb.SetResponse, error) {
	if req.Namespace == "vault" {
		var vault config.Store
		if !propagator.Get(ctx, config.VaultKey, &vault) {
			return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find vault in context")
		}

		if err := vault.Val(req.GetPath()).Set(req.GetValue().GetData()); err != nil {
			return nil, err
		}
	} else {
		if err := config.Set(ctx, req.GetValue().GetData(), req.GetPath()); err != nil {
			return nil, err
		}
	}

	return &pb.SetResponse{}, nil
}

func (h *Handler) Delete(ctx context.Context, req *pb.DeleteRequest) (*pb.DeleteResponse, error) {
	if err := config.Get(ctx, req.GetPath()).Del(); err != nil {
		return nil, err
	}

	return &pb.DeleteResponse{}, nil
}

func (h *Handler) Watch(req *pb.WatchRequest, stream pb.Config_WatchServer) error {
	var opts []configx.WatchOption
	if req.GetPath() != "" && req.GetPath() != "/" {
		opts = append(opts, configx.WithPath(req.GetPath()))
	}
	w, err := config.Watch(stream.Context(), opts...)
	if err != nil {
		return err
	}

	defer w.Stop()

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		if err := stream.Send(&pb.WatchResponse{
			Value: &pb.Value{
				Data: res.(configx.Values).Bytes(),
			},
		}); err != nil {
			return err
		}
	}
}

func (h *Handler) Save(ctx context.Context, req *pb.SaveRequest) (*pb.SaveResponse, error) {
	if err := config.Save(ctx, req.GetUser(), req.GetMessage()); err != nil {
		return nil, err
	}

	return &pb.SaveResponse{}, nil
}
