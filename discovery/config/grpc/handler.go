package grpc

import (
	"context"

	pb "github.com/pydio/cells/v4/common/proto/config"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var config = configx.New()

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
	return &pb.GetResponse{
		Value: &pb.Value{Data: config.Val().String()},
	}, nil
}

func (h *Handler) Set(ctx context.Context, req *pb.SetRequest) (*pb.SetResponse, error) {
	if err := config.Val(req.GetPath()).Set(req.GetValue()); err != nil {
		return nil, err
	}

	return &pb.SetResponse{}, nil
}
