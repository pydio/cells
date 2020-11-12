package tree

import (
	"context"
	"io"
	"path"
	"strings"

	"github.com/pydio/cells/common"
)

// BuildAncestorsList uses ListNodes with Ancestors flag set to build the list of parent nodes.
func BuildAncestorsList(ctx context.Context, treeClient NodeProviderClient, node *Node) (parentUuids []*Node, err error) {
	ancestorStream, lErr := treeClient.ListNodes(ctx, &ListNodesRequest{
		Node:      node,
		Ancestors: true,
	})
	if lErr != nil {
		return parentUuids, lErr
	}
	defer ancestorStream.Close()
	for {
		parent, e := ancestorStream.Recv()
		if e != nil {
			if e == io.EOF || e == io.ErrUnexpectedEOF {
				break
			} else {
				return nil, e
			}
		}
		if parent == nil {
			continue
		}
		parentUuids = append(parentUuids, parent.Node)
	}
	return parentUuids, err
}

// Recursive listing to build ancestors list when the node does not exists yet : try to find all existing parents
func BuildAncestorsListOrParent(ctx context.Context, treeClient NodeProviderClient, node *Node) (parentUuids []*Node, err error) {
	parents, err := BuildAncestorsList(ctx, treeClient, node)
	nodePathParts := strings.Split(node.Path, "/")
	if err != nil && len(nodePathParts) > 1 {
		// Try to list parent node right
		parentNode := &Node{}
		parentNode.Path = strings.Join(nodePathParts[0:len(nodePathParts)-1], "/")
		parents, err = BuildAncestorsListOrParent(ctx, treeClient, parentNode)
		if err != nil {
			return parents, err
		}
	}
	return parents, nil
}

// IgnoreNodeForOutput checks wether a node shall be ignored for
// outputs sent to end user (typically websocket events, activities, etc)
func IgnoreNodeForOutput(ctx context.Context, node *Node) bool {
	base := path.Base(node.Path)
	return base == common.PydioSyncHiddenFile || strings.HasPrefix(base, ".")
}
