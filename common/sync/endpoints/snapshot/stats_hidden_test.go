package snapshot

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// Root stats count user files only, like the filesystem endpoint: not the .pydio folder markers.
func TestStatsSkipHiddenFiles(t *testing.T) {
	s, err := NewBoltSnapshot(context.Background(), t.TempDir(), "stats")
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	if err = s.AutoCreateBucket(); err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	for _, n := range []*tree.Node{
		{Path: "docs", Type: tree.NodeType_COLLECTION},
		{Path: "docs/" + common.PydioSyncHiddenFile, Type: tree.NodeType_LEAF, Size: 36},
		{Path: "docs/a.txt", Type: tree.NodeType_LEAF, Size: 10},
		{Path: common.PydioSyncHiddenFile, Type: tree.NodeType_LEAF, Size: 36},
		{Path: "b.txt", Type: tree.NodeType_LEAF, Size: 5},
	} {
		if err := s.CreateNode(ctx, n, true); err != nil {
			t.Fatal(err)
		}
	}
	root, err := s.LoadNode(ctx, "/", true)
	if err != nil {
		t.Fatal(err)
	}
	files, _ := root.GetChildrenFiles()
	folders, _ := root.GetChildrenFolders()
	size, _ := root.GetChildrenSize()
	if files != 2 || folders != 1 || size != 15 {
		t.Fatalf("got %d files, %d folders, %d bytes; want 2, 1, 15", files, folders, size)
	}
}
