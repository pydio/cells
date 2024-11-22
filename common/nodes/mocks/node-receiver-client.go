package mocks

import (
	"context"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/proto/tree"
)

type NodeReceiverClient struct {
	Nodes map[string]*tree.Node
}

func (n *NodeReceiverClient) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	if n.Nodes == nil {
		n.Nodes = make(map[string]*tree.Node)
	}
	n.Nodes[in.Node.Uuid] = in.Node
	return &tree.CreateNodeResponse{Node: in.Node}, nil
}

func (n *NodeReceiverClient) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	if n.Nodes == nil {
		n.Nodes = make(map[string]*tree.Node)
	}
	if in.From != nil {
		delete(n.Nodes, in.From.Uuid)
	}
	n.Nodes[in.To.Uuid] = in.To
	return &tree.UpdateNodeResponse{Node: in.To}, nil
}

func (n *NodeReceiverClient) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	if n.Nodes == nil {
		n.Nodes = make(map[string]*tree.Node)
	}
	delete(n.Nodes, in.Node.Uuid)
	return &tree.DeleteNodeResponse{Success: true}, nil
}
