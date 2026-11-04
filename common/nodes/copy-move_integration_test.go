package nodes

import (
	"context"
	"fmt"
	"testing"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"google.golang.org/grpc"
)

type orderedCopyMoveHandler struct {
	*HandlerMock
	children  []*tree.Node
	forbidden string
	deleted   map[string]bool
}

func (h *orderedCopyMoveHandler) ListNodes(ctx context.Context, _ *tree.ListNodesRequest, _ ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	stream := NewWrappingStreamer(ctx)
	go func() {
		defer stream.CloseSend()
		for _, child := range h.children {
			stream.Send(&tree.ListNodesResponse{Node: child})
		}
	}()
	return stream, nil
}

func (h *orderedCopyMoveHandler) CopyObject(ctx context.Context, from, to *tree.Node, _ *models.CopyRequestData) (models.ObjectInfo, error) {
	if from.Path == h.forbidden {
		return models.ObjectInfo{}, fmt.Errorf("%w: %s", errors.StatusForbidden, from.Path)
	}
	return models.ObjectInfo{Size: from.Size}, nil
}

func (h *orderedCopyMoveHandler) DeleteNode(ctx context.Context, request *tree.DeleteNodeRequest, _ ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	h.deleted[request.Node.Path] = true
	return h.HandlerMock.DeleteNode(ctx, request)
}

func TestCopyMoveNodesRecursiveChildFailures(t *testing.T) {
	oldUnitTestEnv := IsUnitTestEnv
	IsUnitTestEnv = true
	defer func() { IsUnitTestEnv = oldUnitTestEnv }()

	tests := []struct {
		name        string
		children    []string
		forbidden   string
		wantDeleted []string
		wantErr     bool
	}{
		{
			name:        "permitted and forbidden siblings",
			children:    []string{"source/denied", "source/moved", "source/last"},
			forbidden:   "source/denied",
			wantDeleted: []string{"source/moved"},
			wantErr:     true,
		},
		{
			name:        "forbidden special last child",
			children:    []string{"source/moved", "source/denied"},
			forbidden:   "source/denied",
			wantDeleted: []string{"source/moved"},
			wantErr:     true,
		},
		{
			name:        "all children succeed",
			children:    []string{"source/first", "source/last"},
			wantDeleted: []string{"source/first", "source/last"},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			base := NewHandlerMock()
			source := &tree.Node{Path: "source", Uuid: "source-id", Type: tree.NodeType_COLLECTION}
			base.Nodes[source.Path] = source
			children := make([]*tree.Node, 0, len(test.children))
			for _, path := range test.children {
				node := &tree.Node{Path: path, Type: tree.NodeType_LEAF, Size: 1}
				base.Nodes[path] = node
				children = append(children, node)
			}
			handler := &orderedCopyMoveHandler{
				HandlerMock: base,
				children:    children,
				forbidden:   test.forbidden,
				deleted:     make(map[string]bool),
			}

			bi := BranchInfo{LoadedSource: LoadedSource{DataSource: &object.DataSource{Name: "test"}}}
			ctx := WithBranchInfo(context.Background(), "from", bi)
			ctx = WithBranchInfo(ctx, "to", bi)
			status := make(chan string, 16)
			progress := make(chan float32, 16)
			err := CopyMoveNodes(ctx, handler, source, &tree.Node{Path: "target/source", Type: tree.NodeType_COLLECTION}, true, true, status, progress)
			if (err != nil) != test.wantErr {
				t.Fatalf("CopyMoveNodes() error = %v, wantErr %v", err, test.wantErr)
			}
			for _, path := range test.wantDeleted {
				if !handler.deleted[path] {
					t.Errorf("permitted child %q was not moved", path)
				}
			}
			if test.forbidden != "" && handler.deleted[test.forbidden] {
				t.Errorf("forbidden child %q was moved", test.forbidden)
			}
		})
	}
}
