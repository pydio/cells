package tree

import (
	"context"
	"path"
	"strings"

	"github.com/pydio/cells/common"
)

// IgnoreNodeForOutput checks wether a node shall be ignored for
// outputs sent to end user (typically websocket events, activities, etc)
func IgnoreNodeForOutput(ctx context.Context, node *Node) bool {
	base := path.Base(node.Path)
	return base == common.PydioSyncHiddenFile || strings.HasPrefix(base, ".")
}
