/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package merger

import (
	"encoding/json"
	"path"
	"regexp"

	"github.com/gobwas/glob"

	"github.com/pydio/cells/v5/common/proto/tree"
)

const (
	NodeType_METADATA tree.NodeType = 3

	MetaNodeParentUUIDMeta = "ParentUUID"
	MetaNodeParentPathMeta = "ParentPath"
)

type MetaConfig struct {
	MetaNames  []string
	MetaRegexp []*regexp.Regexp
}

// ParentMetaStore returns the MetaStore of a metadata node, holding the JSON-encoded uuid and path of
// the node it belongs to. Values must be properly encoded: paths may contain quotes or backslashes.
func ParentMetaStore(parentUuid, parentPath string) map[string]string {
	u, _ := json.Marshal(parentUuid)
	p, _ := json.Marshal(parentPath)
	return map[string]string{
		MetaNodeParentUUIDMeta: string(u),
		MetaNodeParentPathMeta: string(p),
	}
}

// newMetaNode create a new MetaNode from an existing metadata
func newMetaNode(parentNode *TreeNode, name, value string) *TreeNode {
	tN := NewTreeNode(&tree.Node{
		Path:      path.Join(parentNode.GetPath(), name),
		Uuid:      parentNode.GetUuid() + "-" + name,
		Type:      NodeType_METADATA,
		Etag:      value,
		MetaStore: ParentMetaStore(parentNode.GetUuid(), parentNode.GetPath()),
	})
	return tN
}

// addMetadataAsChildNodes extracts MetaNodes from normal node, based on a config
func addMetadataAsChildNodes(n *TreeNode, metaGlobs []glob.Glob) {
	rm := n.ListRawMetadata()
	if len(metaGlobs) == 0 || rm == nil {
		return
	}
	for k, v := range rm {
		for _, g := range metaGlobs {
			if g.Match(k) {
				n.AddChild(newMetaNode(n, k, v))
			}
		}
	}
}
