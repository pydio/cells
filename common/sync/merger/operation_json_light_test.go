package merger

import (
	"encoding/json"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Nodes built by the filesystem endpoint and the merger are light nodes: they must survive the
// patch store round trip (they were stored as {}).
func TestOperationJSON_LightNodes(t *testing.T) {
	n := tree.LightNode(tree.NodeType_LEAF, "uuid-1", "docs/a.txt", "etag", 42, 1700000000, 0644)
	op := NewOperation(OpCreateFile, model.EventInfo{Path: "docs/a.txt", ScanEvent: true, ScanSourceNode: n}, n)
	data, err := json.Marshal(op)
	if err != nil {
		t.Fatal(err)
	}
	back, err := unmarshalOp(data)
	if err != nil {
		t.Fatal(err)
	}
	got := back.GetNode()
	if got == nil || got.GetPath() != "docs/a.txt" || got.GetSize() != 42 || !got.IsLeaf() || got.GetUuid() != "uuid-1" {
		t.Fatalf("node lost in JSON: %s", data)
	}
	if src := back.(*patchOperation).EventInfo.ScanSourceNode; src == nil || src.GetPath() != "docs/a.txt" {
		t.Fatalf("scan source node lost in JSON: %s", data)
	}

	from := tree.LightNode(tree.NodeType_COLLECTION, "uuid-2", "old", "", 0, 0, 0)
	to := tree.LightNode(tree.NodeType_COLLECTION, "uuid-2", "new", "", 0, 0, 0)
	mv := NewOperation(OpMoveFolder, model.EventInfo{Path: "new", MoveSource: from, MoveTarget: to}, from)
	data, _ = json.Marshal(mv)
	back, err = unmarshalOp(data)
	if err != nil {
		t.Fatal(err)
	}
	ei := back.(*patchOperation).EventInfo
	if ei.MoveSource == nil || ei.MoveSource.GetPath() != "old" || ei.MoveTarget == nil || ei.MoveTarget.GetPath() != "new" {
		t.Fatalf("move nodes lost in JSON: %s", data)
	}
}
