package merger

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

// A local folder rename: the FS watcher sends the folder create, the folder delete and one delete per
// child at the old path. The children deletes are part of the move: they must not be applied after it,
// under the new path (which deleted the moved files on the server, phase 3 live test).
func TestFolderMoveDropsChildrenDeletes(t *testing.T) {
	ctx := context.Background()
	source := memory.NewMemDB()
	target := memory.NewMemDB()
	for _, n := range []*tree.Node{
		{Path: "photos2", Uuid: "folder-u", Type: tree.NodeType_COLLECTION},
		{Path: "photos2/pic.jpg", Uuid: "pic-u", Etag: "e1", Type: tree.NodeType_LEAF},
		{Path: "photos2/sub", Uuid: "sub-u", Type: tree.NodeType_COLLECTION},
		{Path: "photos2/sub/deep.md", Uuid: "deep-u", Etag: "e2", Type: tree.NodeType_LEAF},
	} {
		_ = target.CreateNode(ctx, n, false)
	}
	for _, n := range []*tree.Node{
		{Path: "photos3", Uuid: "folder-u", Type: tree.NodeType_COLLECTION},
		{Path: "photos3/pic.jpg", Uuid: "pic-u", Etag: "e1", Type: tree.NodeType_LEAF},
		{Path: "photos3/sub", Uuid: "sub-u", Type: tree.NodeType_COLLECTION},
		{Path: "photos3/sub/deep.md", Uuid: "deep-u", Etag: "e2", Type: tree.NodeType_LEAF},
	} {
		_ = source.CreateNode(ctx, n, false)
	}
	patch := newTreePatch(source, target, PatchOptions{MoveDetection: true, NoRescan: true})
	patch.Enqueue(NewOperation(OpCreateFolder, model.EventInfo{Path: "photos3", Folder: true, Type: model.EventCreate}))
	for _, p := range []string{"photos2", "photos2/pic.jpg", "photos2/sub", "photos2/sub/deep.md"} {
		patch.Enqueue(NewOperation(OpDelete, model.EventInfo{Path: p, Type: model.EventRemove}))
	}
	patch.Filter(ctx)

	var moves, deletes []string
	patch.WalkOperations(nil, func(o Operation) {
		switch o.Type() {
		case OpMoveFolder:
			moves = append(moves, o.GetMoveOriginPath()+" -> "+o.GetRefPath())
		case OpDelete:
			deletes = append(deletes, o.GetRefPath())
		}
	})
	if len(moves) != 1 || moves[0] != "photos2 -> photos3" {
		t.Fatalf("expected the folder move only, got moves %v", moves)
	}
	if len(deletes) != 0 {
		t.Fatalf("children deletes must be dropped with the move, got %v", deletes)
	}

	// A file deleted inside the folder in the same batch is also sent at the old path, but it is
	// missing at the new path: that delete is kept.
	_ = source.DeleteNode(ctx, "photos3/pic.jpg")
	patch = newTreePatch(source, target, PatchOptions{MoveDetection: true, NoRescan: true})
	patch.Enqueue(NewOperation(OpCreateFolder, model.EventInfo{Path: "photos3", Folder: true, Type: model.EventCreate}))
	for _, p := range []string{"photos2", "photos2/pic.jpg", "photos2/sub", "photos2/sub/deep.md"} {
		patch.Enqueue(NewOperation(OpDelete, model.EventInfo{Path: p, Type: model.EventRemove}))
	}
	patch.Filter(ctx)
	deletes = nil
	patch.WalkOperations([]OperationType{OpDelete}, func(o Operation) { deletes = append(deletes, o.GetRefPath()) })
	// Listed at its old path: the processor applies it under the moved folder (photos3/pic.jpg)
	if len(deletes) != 1 || deletes[0] != "photos2/pic.jpg" {
		t.Fatalf("only the really deleted child must be kept, got %v", deletes)
	}
}
