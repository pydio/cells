package anko_services

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
)

type TreeService struct {
	ctx    context.Context
	router views.Handler
}

func NewTreeService(c context.Context) *TreeService {
	t := &TreeService{
		ctx: c,
		router: views.NewStandardRouter(views.RouterOptions{
			AdminView: true,
		}),
	}
	return t
}

func (srv *TreeService) Ls(nodePath string, recursive bool, filterType string) ([]*tree.Node, error) {
	var nn []*tree.Node
	request := &tree.ListNodesRequest{Node: &tree.Node{Path: nodePath}}
	if recursive {
		request.Recursive = true
	}
	if filterType == "leaf" {
		request.FilterType = tree.NodeType_LEAF
	} else if filterType == "collection" {
		request.FilterType = tree.NodeType_COLLECTION
	}
	s, e := srv.router.ListNodes(srv.ctx, request)
	if e != nil {
		return nn, e
	}
	defer s.Close()
	for {
		r, er := s.Recv()
		if er != nil || r == nil {
			break
		}
		nn = append(nn, r.Node)
	}
	return nn, nil
}

func (srv *TreeService) Stat(nodePath string) (*tree.Node, error) {
	r, e := srv.router.ReadNode(srv.ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: nodePath}})
	if e != nil {
		return nil, e
	} else {
		return r.Node, nil
	}
}
