package grpc

import (
	"context"
	"time"

	"github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common/micro/registry/service"
	pb "github.com/pydio/cells/common/proto/registry"
)

type Handler struct{}

func (h *Handler) GetService(ctx context.Context, req *pb.GetRequest, resp *pb.GetResponse) error {
	ss, err := registry.GetService(req.GetService())
	if err != nil {
		return err
	}

	var services []*pb.Service

	for _, s := range ss {
		services = append(services, service.ToProto(s))
	}

	resp.Services = services

	return nil
}
func (h *Handler) Register(ctx context.Context, s *pb.Service, resp *pb.EmptyResponse) error {
	return registry.Register(service.ToService(s), registry.RegisterTTL(time.Duration(s.GetOptions().GetTtl())*time.Second))
}

func (h *Handler) Deregister(ctx context.Context, s *pb.Service, resp *pb.EmptyResponse) error {
	return registry.Deregister(service.ToService(s))
}

func (h *Handler) ListServices(ctx context.Context, req *pb.ListRequest, resp *pb.ListResponse) error {
	ss, err := registry.ListServices()
	if err != nil {
		return err
	}

	var services []*pb.Service
	for _, s := range ss {
		services = append(services, service.ToProto(s))
	}

	resp.Services = services

	return nil
}

func (h *Handler) Watch(ctx context.Context, req *pb.WatchRequest, stream pb.Registry_WatchStream) error {
	defer stream.Close()

	var opts []registry.WatchOption
	if s := req.GetService(); s != "" {
		opts = append(opts, registry.WatchService(s))
	}

	w, err := registry.Watch(opts...)
	if err != nil {
		return err
	}

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		stream.Send(&pb.Result{
			Action:  res.Action,
			Service: service.ToProto(res.Service),
		})
	}
}
