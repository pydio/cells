package registry

import (
	"context"
	"fmt"
	"os"

	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/server"
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
		if req.Options.Type != pb.ItemType_ALL {
			oo = append(oo, registry.WithType(req.Options.Type))
		}
		if req.Options.Name != "" {
			oo = append(oo, registry.WithName(req.Options.Name))
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

	if item.GetServer() != nil && item.GetServer().GetMetadata() != nil {
		meta := item.GetServer().GetMetadata()
		if parent, ok := meta[server.NodeMetaParentPID]; ok && parent == fmt.Sprintf("%d", os.Getpid()) {
			// This is a fork, try to attach to the "fork" service
			if startTag, ok := meta[server.NodeMetaStartTag]; ok && startTag != "" {
				ff, _ := h.reg.List(registry.WithType(pb.ItemType_SERVER), registry.WithMeta(server.NodeMetaForkStartTag, startTag))
				if len(ff) > 0 {
					_, _ = h.reg.RegisterEdge(ff[0].ID(), item.GetServer().GetId(), "Fork", map[string]string{})
				}
			}

		}
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

	var opts []registry.Option
	opts = append(opts, registry.WithAction(req.GetOptions().GetAction()))
	opts = append(opts, registry.WithType(req.GetOptions().GetType()))

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
