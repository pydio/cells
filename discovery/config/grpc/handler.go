package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/config"

	pb "github.com/pydio/cells/v4/common/proto/config"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Handler struct {
	serviceName string
	pb.UnimplementedConfigServer
}

func (h *Handler) Id() string {
	return uuid.New()
}

func (h *Handler) Name() string {
	return h.serviceName
}

func (h *Handler) ServiceName() string {
	return h.serviceName
}

func (h *Handler) Get(ctx context.Context, req *pb.GetRequest) (*pb.GetResponse, error) {
	if req.Namespace == "vault" {
		return &pb.GetResponse{
			Value: &pb.Value{Data: config.Vault().Val(req.GetPath()).Bytes()},
		}, nil
	}
	return &pb.GetResponse{
		Value: &pb.Value{Data: config.Get(req.GetPath()).Bytes()},
	}, nil
}

func (h *Handler) Set(ctx context.Context, req *pb.SetRequest) (*pb.SetResponse, error) {
	if err := config.Set(req.GetValue(), req.GetPath()); err != nil {
		return nil, err
	}

	return &pb.SetResponse{}, nil
}
