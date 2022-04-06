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

func NewHandler(name string) *Handler {
	return &Handler{
		serviceName: name,
	}
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
	if err := config.Set(req.GetValue().GetData(), req.GetPath()); err != nil {
		return nil, err
	}

	return &pb.SetResponse{}, nil
}

func (h *Handler) Delete(ctx context.Context, req *pb.DeleteRequest) (*pb.DeleteResponse, error) {
	if err := config.Get(req.GetPath()).Del(); err != nil {
		return nil, err
	}

	return &pb.DeleteResponse{}, nil
}

func (h *Handler) Watch(req *pb.WatchRequest, stream pb.Config_WatchServer) error {
	w, err := config.Watch(req.GetPath())
	if err != nil {
		return err
	}

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		if err := stream.Send(&pb.WatchResponse{
			Value: &pb.Value{
				Data: res.Bytes(),
			},
		}); err != nil {
			return err
		}
	}
}

func (h *Handler) Save(ctx context.Context, req *pb.SaveRequest) (*pb.SaveResponse, error) {
	if err := config.Save(req.GetUser(), req.GetMessage()); err != nil {
		return nil, err
	}

	return &pb.SaveResponse{}, nil
}
