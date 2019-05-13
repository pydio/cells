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
	var e error
	response, e = t.getRouter().ReadNode(ctx, request)
	return e
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

func (t *TreeHandler) getRouter() views.Handler {
	if t.router != nil {
		return t.router
	}
	t.router = views.NewStandardRouter(views.RouterOptions{AdminView: true})
	return t.router
}
