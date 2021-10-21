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
	"path"
	"regexp"

	"github.com/gobwas/glob"

	"github.com/pydio/cells/common/proto/tree"
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

// newMetaNode create a new MetaNode from an existing metadata
func newMetaNode(parentNode *TreeNode, name, value string) *TreeNode {
	tN := NewTreeNode(&tree.Node{
		Path: path.Join(parentNode.Path, name),
		Uuid: parentNode.Uuid + "-" + name,
		Type: NodeType_METADATA,
		Etag: value,
		MetaStore: map[string]string{
			MetaNodeParentUUIDMeta: `"` + parentNode.Uuid + `"`, // Json-encode parent Uuid
			MetaNodeParentPathMeta: `"` + parentNode.Path + `"`, // Json-encode parent Path
		},
	})
	return tN
}

// addMetadataAsChildNodes extracts MetaNodes from normal node, based on a config
func addMetadataAsChildNodes(n *TreeNode, metaGlobs []glob.Glob) {
	if len(metaGlobs) == 0 || n.MetaStore == nil {
		return
	}
	for k, v := range n.MetaStore {
		for _, g := range metaGlobs {
			if g.Match(k) {
				n.AddChild(newMetaNode(n, k, v))
			}
		}
	}
}
