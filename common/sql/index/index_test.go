package index

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common/utils/mtree"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
)

var (
	options config.Map

	mockNode *mtree.TreeNode

	mockLongNodeMPath       mtree.MPath
	mockLongNodeChild1MPath mtree.MPath
	mockLongNodeChild2MPath mtree.MPath

	mockLongNode       *mtree.TreeNode
	mockLongNodeChild1 *mtree.TreeNode
	mockLongNodeChild2 *mtree.TreeNode
)

func init() {
	mockLongNodeMPath = []uint64{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40}
	mockLongNodeChild1MPath = append(mockLongNodeMPath, 41)
	mockLongNodeChild2MPath = append(mockLongNodeMPath, 42)

	mockNode = NewNode(&tree.Node{
		Uuid: "ROOT",
		Type: tree.NodeType_LEAF,
	}, []uint64{1}, []string{""})

	mockLongNode = NewNode(&tree.Node{
		Uuid: "mockLongNode",
		Type: tree.NodeType_LEAF,
	}, mockLongNodeMPath, []string{"mockLongNode"})

	mockLongNodeChild1 = NewNode(&tree.Node{
		Uuid: "mockLongNodeChild1",
		Type: tree.NodeType_LEAF,
	}, mockLongNodeChild1MPath, []string{"mockLongNodeChild1"})

	mockLongNodeChild2 = NewNode(&tree.Node{
		Uuid: "mockLongNodeChild2",
		Type: tree.NodeType_LEAF,
	}, mockLongNodeChild2MPath, []string{"mockLongNodeChild2"})
}

func getSQLDAO(ctx context.Context) sql.DAO {
	return servicecontext.GetDAO(ctx).(sql.DAO)
}

func getDAO(ctx context.Context) DAO {
	return servicecontext.GetDAO(ctx).(DAO)
}

func printTree(ctx context.Context) {
	// query

	rows, _ := getSQLDAO(ctx).GetStmt("printTree").Query()

	var uuid, mpath string
	var level int
	var rat []byte

	for rows.Next() {
		err := rows.Scan(&uuid, &level, &mpath, &rat)
		if err != nil {
			return
		}

		fmt.Println(uuid, level, mpath, rat)
	}
}

func printNodes(ctx context.Context) {
	// query
	rows, _ := getSQLDAO(ctx).GetStmt("printNodes").Query()

	var uuid, name, etag, mode string
	var mtime, size int
	var leaf *bool

	for rows.Next() {
		err := rows.Scan(&uuid, &name, &leaf, &mtime, &etag, &size, &mode)
		if err != nil {
			return
		}

		fmt.Println(uuid, name, leaf, mtime, etag, size, mode)
	}
}
