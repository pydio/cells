package views

import (
	"context"
	"path"
	"time"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type SyncFolderTasksHandler struct {
	AbstractHandler
}

func (h *SyncFolderTasksHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {

	node := in.Node
	var err error
	if node.IsLeaf() {
		_, err = h.next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node.Clone()})
	} else {
		pFile := path.Join(node.Path, common.PYDIO_SYNC_HIDDEN_FILE_META)
		// Now list all children and delete them all
		stream, err := h.next.ListNodes(ctx, &tree.ListNodesRequest{Node: node, Recursive: true})
		if err != nil {
			return nil, err
		}
		defer stream.Close()
		for {
			resp, e := stream.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			if resp.Node.Path == pFile {
				continue
			}
			if !resp.Node.IsLeaf() {
				resp.Node.Path = path.Join(resp.Node.Path, common.PYDIO_SYNC_HIDDEN_FILE_META, "/")
				resp.Node.Type = tree.NodeType_LEAF
			}
			if _, err := h.next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: resp.Node}); err != nil {
				log.Logger(ctx).Error("Error while deleting node child " + err.Error())
				return nil, err
			}
		}
		fakeChild := node.Clone()
		fakeChild.Path = pFile
		initMetaPath := fakeChild.GetStringMeta(common.META_NAMESPACE_DATASOURCE_PATH)
		fakeChild.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, path.Join(initMetaPath, common.PYDIO_SYNC_HIDDEN_FILE_META))
		_, err = h.next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: fakeChild})
	}
	if err != nil {
		return nil, err
	} else {
		return &tree.DeleteNodeResponse{Success: true}, nil
	}

}

func (h *SyncFolderTasksHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {

	source := in.From
	target := in.To
	status := make(chan string)
	progress := make(chan float32)
	done := make(chan bool)
	// Transform identifier from => in
	if f, ok := GetBranchInfo(ctx, "from"); ok {
		ctx = WithBranchInfo(ctx, "in", f)
	}
	go func() {
		for {
			select {
			case <-done:
				return
			case s := <-status:
				log.Logger(ctx).Info(s)
			case pg := <-progress:
				log.Logger(ctx).Debug("progress", zap.Float32("pg", pg))
			}
		}
	}()
	log.Logger(ctx).Info("Should Copy/Move Target", target.Zaps()...)
	err := CopyMoveNodes(ctx, h.next, source, target, true, true, false, status, progress)
	close(done)
	close(status)
	close(progress)
	if err != nil {
		return nil, err
	}

	// Build a fake output node
	out := source.Clone()
	out.Path = target.Path
	out.MTime = time.Now().Unix()
	return &tree.UpdateNodeResponse{
		Node:    out,
		Success: true,
	}, nil

}
