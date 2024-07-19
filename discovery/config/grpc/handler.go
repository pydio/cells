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

	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/config"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type Handler struct {
	pb.UnimplementedConfigServer
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Get(ctx context.Context, req *pb.GetRequest) (*pb.GetResponse, error) {
	if req.Namespace == "vault" {
		return &pb.GetResponse{
			Value: &pb.Value{Data: config.Vault().Val(req.GetPath()).Bytes()},
		}, nil
	}
	return &pb.GetResponse{
		Value: &pb.Value{Data: config.Get(ctx, req.GetPath()).Bytes()},
	}, nil
}

func (h *Handler) Set(ctx context.Context, req *pb.SetRequest) (*pb.SetResponse, error) {
	if err := config.Set(ctx, req.GetValue().GetData(), req.GetPath()); err != nil {
		return nil, err
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
