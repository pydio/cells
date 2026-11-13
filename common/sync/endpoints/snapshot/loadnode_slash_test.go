package snapshot

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// The selected roots of a task come with a leading slash ("/docs"); the snapshot stores "docs".
func TestLoadNodeLeadingSlash(t *testing.T) {
	s, err := NewBoltSnapshot(context.Background(), t.TempDir(), "slash")
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
		{Path: "docs/sub", Type: tree.NodeType_COLLECTION},
		{Path: "docs/sub/b.txt", Type: tree.NodeType_LEAF, Size: 5},
		{Path: "other.txt", Type: tree.NodeType_LEAF, Size: 7},
	} {
		if err := s.CreateNode(ctx, n, true); err != nil {
			t.Fatal(err)
		}
	}
	for _, p := range []string{"docs", "/docs", "/docs/"} {
		n, err := s.LoadNode(ctx, p, true)
		if err != nil {
			t.Fatalf("LoadNode(%q): %v", p, err)
		}
		files, _ := n.GetChildrenFiles()
		folders, _ := n.GetChildrenFolders()
		size, _ := n.GetChildrenSize()
		if files != 2 || folders != 1 || size != 15 {
			t.Fatalf("LoadNode(%q): got %d files, %d folders, %d bytes; want 2, 1, 15", p, files, folders, size)
		}
	}
	if _, err := s.LoadNode(ctx, "/missing"); err == nil {
		t.Fatal("LoadNode(/missing): want an error")
	}
}
