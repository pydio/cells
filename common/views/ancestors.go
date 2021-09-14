package views

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"

	"google.golang.org/grpc/status"

	"github.com/pydio/cells/common/proto/tree"
)

// BuildAncestorsList uses ListNodes with "Ancestors" flag to build the list of parent nodes.
// It uses an internal short-lived cache to throttle calls to the TreeService
func BuildAncestorsList(ctx context.Context, treeClient tree.NodeProviderClient, node *tree.Node) (parentUuids []*tree.Node, err error) {
	/*
		sT := time.Now()
		defer func() {
			fmt.Println("--- End BuildAncestorsList for "+node.GetPath(), time.Now().Sub(sT))
		}()
	*/
	dirPath := path.Dir(node.GetPath())
	if node.GetPath() != "" {
		if cached, has := ancestorsParentsCache.Get(dirPath); has {
			if parents, ok := cached.([]*tree.Node); ok {
				// Lookup First node
				if cachedNode, h := ancestorsNodesCache.Get(node.GetPath()); h {
					parentUuids = append(parentUuids, cachedNode.(*tree.Node))
				} else {
					r, er := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
					if er != nil {
						return parentUuids, er
					}
					ancestorsNodesCache.SetDefault(node.GetPath(), r.GetNode())
					parentUuids = append(parentUuids, r.GetNode())
				}
				parentUuids = append(parentUuids, parents...)
				return parentUuids, nil
			}
		}
	}

	ancestorStream, lErr := treeClient.ListNodes(ctx, &tree.ListNodesRequest{
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
				if s, o := status.FromError(e); o {
					return nil, fmt.Errorf(s.Message())
				}
				return nil, e
			}
		}
		if parent == nil {
			continue
		}
		parentUuids = append(parentUuids, parent.Node)
	}
	if dirPath != "" && parentUuids != nil && len(parentUuids) > 1 {
		cNode := parentUuids[0]
		pNodes := parentUuids[1:]
		ancestorsNodesCache.SetDefault(node.GetPath(), cNode)
		ancestorsParentsCache.SetDefault(dirPath, pNodes)
	}
	return parentUuids, err
}

// BuildAncestorsListOrParent builds ancestors list when the node does not exists yet, by trying to find all existing parents.
func BuildAncestorsListOrParent(ctx context.Context, treeClient tree.NodeProviderClient, node *tree.Node) (parentUuids []*tree.Node, err error) {
	parents, err := BuildAncestorsList(ctx, treeClient, node)
	nodePathParts := strings.Split(node.Path, "/")
	if err != nil && len(nodePathParts) > 1 {
		// Try to list parent node right
		parentNode := &tree.Node{}
		parentNode.Path = strings.Join(nodePathParts[0:len(nodePathParts)-1], "/")
		parents, err = BuildAncestorsListOrParent(ctx, treeClient, parentNode)
		if err != nil {
			return parents, err
		}
	}
	return parents, nil
}
