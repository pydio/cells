package registry

import (
	"context"
	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
)

type Handler struct {
	pb.UnimplementedRegistryServer

	reg registry.Registry
}

func NewHandler(reg registry.Registry) *Handler {
	return &Handler{
		reg: reg,
	}
}

func (h *Handler) Name() string {
	return common.ServiceGrpcNamespace_ + common.ServiceRegistry
}

func (h *Handler) Start(ctx context.Context, item *pb.Item) (*pb.EmptyResponse, error) {
	if err := h.reg.Start(util.ToItem(item)); err != nil {
		return nil, err
	}

	return &pb.EmptyResponse{}, nil
}
func (h *Handler) Stop(ctx context.Context, item *pb.Item) (*pb.EmptyResponse, error) {
	if err := h.reg.Stop(util.ToItem(item)); err != nil {
		return nil, err
	}

	return &pb.EmptyResponse{}, nil
}
func (h *Handler) Get(ctx context.Context, req *pb.GetRequest) (*pb.GetResponse, error) {
	resp := &pb.GetResponse{}

	var oo []registry.Option
	if req.Options != nil {
		for _, itemType := range req.Options.Types {
			oo = append(oo, registry.WithType(itemType))
		}

		for _, name := range req.Options.Names {
			oo = append(oo, registry.WithName(name))
		}
	}

	item, err := h.reg.Get(req.GetId(), oo...)
	if err != nil {
		return nil, err
	}

	resp.Item = util.ToProtoItem(item)

	return resp, nil
}
func (h *Handler) Register(ctx context.Context, item *pb.Item) (*pb.EmptyResponse, error) {
	if err := h.reg.Register(util.ToItem(item)); err != nil {
		return nil, err
	}

	return &pb.EmptyResponse{}, nil
}

func (h *Handler) Deregister(ctx context.Context, item *pb.Item) (*pb.EmptyResponse, error) {
	if err := h.reg.Deregister(util.ToItem(item)); err != nil {
		return nil, err
	}

	return &pb.EmptyResponse{}, nil
}

func (h *Handler) List(ctx context.Context, req *pb.ListRequest) (*pb.ListResponse, error) {
	resp := &pb.ListResponse{}

	var oo []registry.Option
	if req.Options != nil {
		for _, itemType := range req.Options.Types {
			oo = append(oo, registry.WithType(itemType))
		}

		for _, name := range req.Options.Names {
			oo = append(oo, registry.WithName(name))
		}
	}
	ss, err := h.reg.List(oo...)
	if err != nil {
		return nil, err
	}

	var items []*pb.Item
	for _, s := range ss {
		items = append(items, util.ToProtoItem(s))
	}

	resp.Items = items

	return resp, nil
}

func (h *Handler) Watch(req *pb.WatchRequest, stream pb.Registry_WatchServer) error {

	var opts []registry.Option
	opts = append(opts, registry.WithAction(req.GetOptions().GetAction()))

	for _, itemType := range req.GetOptions().GetTypes() {
		opts = append(opts, registry.WithType(itemType))
	}

	w, err := h.reg.Watch(opts...)
	if err != nil {
		return err
	}

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		stream.Send(&pb.Result{
			Action: res.Action(),
			Items:  util.ToProtoItems(res.Items()),
		})
	}
}
