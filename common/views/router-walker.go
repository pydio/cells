package views

import (
	"context"
	"time"

	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common/proto/tree"
)

// ListNodesWithCallback performs a ListNodes request and applied callback with optional filters. This hides the complexity of streams handling.
func (v *Router) ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback WalkFunc, ignoreCbError bool, filters ...WalkFilter) error {

	r, e := v.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: request.Node.Path}})
	if e != nil {
		return e
	}
	skipFirst := false
	firstFilters := append(filters, func(ctx context.Context, node *tree.Node) bool {
		return request.FilterType == tree.NodeType_UNKNOWN || r.GetNode().Type == request.FilterType
	})
	for _, f := range firstFilters {
		if !f(ctx, r.GetNode()) {
			skipFirst = true
			break
		}
	}
	if !skipFirst {
		if eC := callback(ctx, r.GetNode(), nil); eC != nil && !ignoreCbError {
			return eC
		}
	}

	nodeClient, err := v.ListNodes(ctx, request, client.WithRequestTimeout(6*time.Hour))
	if err != nil {
		return err
	}
	defer nodeClient.Close()
loop:
	for {
		clientResponse, err := nodeClient.Recv()
		if clientResponse == nil || err != nil {
			break
		}
		n := clientResponse.GetNode()
		for _, f := range filters {
			if !f(ctx, n) {
				continue loop
			}
		}
		if e := callback(ctx, n, nil); e != nil && !ignoreCbError {
			return e
		}
	}
	return nil

}
