package registry

import (
	"context"
	"errors"
	"sync"

	"go.uber.org/zap"

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

type Handler struct {
	pb.UnimplementedRegistryServer

	reg registry.Registry

	lockers map[string]sync.Locker
}

func NewHandler(reg registry.Registry) *Handler {
	return &Handler{
		reg: reg,
	}
}

func (h *Handler) Session(srv pb.Registry_SessionServer) error {
	// First message must be init
	msg, err := srv.Recv()
	if err != nil {
		return err
	}

	// Checking initial request type
	sessionRequestType := msg.GetType()
	if sessionRequestType != pb.SessionRequestType_REGISTER {
		return errors.New("session should start with the registering of the main node")
	}

	node := util.ToItem(msg.GetItem())

	if err := h.reg.Register(node); err != nil {
		return err
	}

	defer func() {
		h.reg.Deregister(node)
	}()

	if err := srv.Send(&pb.EmptyResponse{}); err != nil {
		return err
	}

	for {
		msg, err := srv.Recv()
		if err != nil {
			return err
		}

		item := util.ToItem(msg.GetItem())

		switch msg.GetType() {
		case pb.SessionRequestType_REGISTER:
			if err := h.reg.Register(item); err != nil {
				return err
			}
		case pb.SessionRequestType_DEREGISTER:
			if err := h.reg.Deregister(item); err != nil {
				return err
			}
		}

		if err := srv.Send(&pb.EmptyResponse{}); err != nil {
			return err
		}
	}

	return nil
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

		for _, id := range req.Options.Ids {
			oo = append(oo, registry.WithID(id))
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

	ctx := stream.Context()

	opts := []registry.Option{registry.WithContext(ctx)}

	var sendInitialList bool
	actions := req.GetOptions().GetActions()
	if len(actions) == 0 {
		sendInitialList = true
	}
	for _, id := range req.GetOptions().GetIds() {
		opts = append(opts, registry.WithID(id))
	}
	for _, name := range req.GetOptions().GetNames() {
		opts = append(opts, registry.WithName(name))
	}
	for _, a := range actions {
		opts = append(opts, registry.WithAction(a))
		if a == pb.ActionType_CREATE || a == pb.ActionType_ANY || a == pb.ActionType_FULL_LIST {
			sendInitialList = true
		}
	}
	for _, itemType := range req.GetOptions().GetTypes() {
		opts = append(opts, registry.WithType(itemType))
	}

	// Send initial list as created items
	res, err := h.reg.List(opts...)
	if err != nil {
		return err
	}

	if sendInitialList {
		if err := stream.Send(&pb.Result{
			Action: pb.ActionType_CREATE,
			Items:  util.ToProtoItems(res),
		}); err != nil {
			log.Logger(ctx).Error("initial stream failed ", zap.Error(err))
		}
	}

	w, err := h.reg.Watch(opts...)
	if err != nil {
		return err
	}

	defer w.Stop()

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		if err := stream.Send(&pb.Result{
			Action: res.Action(),
			Items:  util.ToProtoItems(res.Items()),
		}); err != nil {
			log.Logger(ctx).Error("could not send to stream", zap.Error(err))
		}
	}
}

func (h *Handler) NewLocker(server pb.Registry_NewLockerServer) error {
	reqLock, err := server.Recv()
	if err != nil {
		return err
	}

	if reqLock.GetType() != pb.LockType_Lock {
		return errors.New("should lock first")
	}

	if locker := h.reg.NewLocker(reqLock.GetPrefix()); locker != nil {
		locker.Lock()
		defer locker.Unlock()
	}

	if err := server.Send(&pb.NewLockerResponse{Type: pb.LockType_Lock}); err != nil {
		return err
	}

	reqUnlock, err := server.Recv()
	if err != nil {
		return err
	}

	if reqUnlock.GetType() != pb.LockType_Unlock {
		return errors.New("can only unlock locked item")
	}

	return server.Send(&pb.NewLockerResponse{Type: pb.LockType_Unlock})
}
