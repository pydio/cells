package grpc

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
)

// CreateNode Forwards to Index
func (s *Handler) CreateNode(ctx context.Context, req *tree.CreateNodeRequest, resp *tree.CreateNodeResponse) error {

	e := s.s3client.CreateNode(ctx, req.Node, req.UpdateIfExists)
	if e != nil {
		return e
	}
	resp.Node = req.Node
	return nil
}

// UpdateNode Forwards to S3
func (s *Handler) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest, resp *tree.UpdateNodeResponse) error {

	e := s.s3client.MoveNode(ctx, req.From.Path, req.To.Path)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = true
	return nil
}

// DeleteNode Forwards to S3
func (s *Handler) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest, resp *tree.DeleteNodeResponse) error {

	e := s.s3client.DeleteNode(ctx, req.Node.Path)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = true
	return nil
}

// ReadNode Forwards to Index
func (s *Handler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, resp *tree.ReadNodeResponse) error {

	r, e := s.indexClientRead.ReadNode(ctx, req)
	if e != nil {
		return e
	}
	resp.Success = true
	resp.Node = r.Node
	return nil

}

// ListNodes Forward to index
func (s *Handler) ListNodes(ctx context.Context, req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesStream) error {

	client, e := s.indexClientRead.ListNodes(ctx, req)
	if e != nil {
		return e
	}
	defer client.Close()
	for {
		nodeResp, re := client.Recv()
		if nodeResp == nil {
			break
		}
		if re != nil {
			return e
		}
		se := resp.Send(nodeResp)
		if se != nil {
			return e
		}
	}

	return nil
}
