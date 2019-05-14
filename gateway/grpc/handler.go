package grpc

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
)

type TreeHandler struct {
	router views.Handler
}

// ReadNode forwards to router
func (t *TreeHandler) ReadNode(ctx context.Context, request *tree.ReadNodeRequest, response *tree.ReadNodeResponse) error {
	r, e := t.getRouter().ReadNode(ctx, request)
	if e != nil {
		response.Success = false
		return e
	} else {
		response.Node = r.Node
		response.Success = r.Success
		return nil
	}
}

// ListNodes forwards to router
func (t *TreeHandler) ListNodes(ctx context.Context, request *tree.ListNodesRequest, stream tree.NodeProvider_ListNodesStream) error {

	st, e := t.getRouter().ListNodes(ctx, request)
	if e != nil {
		return e
	}
	defer st.Close()
	for {
		r, e := st.Recv()
		if e != nil {
			break
		}
		stream.Send(r)
	}

	return nil
}

// StreamChanges sends events to the client
func (t *TreeHandler) StreamChanges(ctx context.Context, req *tree.StreamChangesRequest, resp tree.NodeChangesStreamer_StreamChangesStream) error {

	streamer, err := t.getRouter().StreamChanges(ctx, req)
	if err != nil {
		return err
	}
	defer streamer.Close()
	for {
		r, e := streamer.Recv()
		if e != nil {
			break
		}
		resp.Send(r)
	}

	return nil
}

// CreateNode is used for creating folders
func (t *TreeHandler) CreateNode(ctx context.Context, req *tree.CreateNodeRequest, resp *tree.CreateNodeResponse) error {
	r, e := t.getRouter().CreateNode(ctx, req)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Node = r.Node
	resp.Success = r.Success
	return nil
}

// UpdateNode is used for moving nodes paths
func (t *TreeHandler) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest, resp *tree.UpdateNodeResponse) error {
	r, e := t.getRouter().UpdateNode(ctx, req)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = r.Success
	resp.Node = r.Node
	return nil
}

// DeleteNode is used to delete nodes
func (t *TreeHandler) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest, resp *tree.DeleteNodeResponse) error {
	r, e := t.getRouter().DeleteNode(ctx, req)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = r.Success
	return nil
}

func (t *TreeHandler) getRouter() views.Handler {
	if t.router != nil {
		return t.router
	}
	t.router = views.NewStandardRouter(views.RouterOptions{
		AdminView:        false,
		WatchRegistry:    true,
		LogReadEvents:    false,
		AuditEvent:       false,
		SynchronousTasks: true,
	})
	return t.router
}
