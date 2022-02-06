package registry

import (
	"context"
	"github.com/pydio/cells/v4/common/registry/util"

	"github.com/pydio/cells/v4/common"

	pb "github.com/pydio/cells/v4/common/proto/registry"

	"github.com/pydio/cells/v4/common/registry"
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

	t := pb.ItemType_ALL
	if req.Options != nil {
		t = req.Options.Type
	}

	item, err := h.reg.Get(
		req.GetName(),
		registry.WithType(t),
	)
	if err != nil {
		return nil, err
	}

	resp.Item = util.ToProtoItem(item)

	return resp, nil
}
func (h *Handler) Register(ctx context.Context, item *pb.Item) (*pb.EmptyResponse, error) {
	if err := h.reg.Register(util.ToItem(item)); err != nil { // , mregistry.RegisterTTL(time.Duration(s.GetOptions().GetTtl())*time.Second)); err != nil {
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

	t := pb.ItemType_ALL
	if req.Options != nil {
		t = req.Options.Type
	}
	ss, err := h.reg.List(
		registry.WithType(t),
	)
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

	//TODO v4 options
	//var opts []registry.WatchOption
	//if s := req.GetService(); s != "" {
	//	opts = append(opts, registry.WatchService(s))
	//}

	w, err := h.reg.Watch()
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
			Items:   util.ToProtoItems(res.Items()),
		})
	}
}
