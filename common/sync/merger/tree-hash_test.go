/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"testing"

	"github.com/pydio/cells/common/sync/model"

	"github.com/pydio/cells/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

func TestOpNodePaths(t *testing.T) {
	Convey("Test OpNode paths", t, func() {
		root := NewTreeNode(&tree.Node{Path: "/"})
		root.QueueOperation(&Operation{
			Key:  "a/b",
			Node: &tree.Node{Path: "a/b", Type: tree.NodeType_COLLECTION},
			Type: OpCreateFolder,
		})
		root.QueueOperation(&Operation{
			Key:  "a/b/c",
			Node: &tree.Node{Path: "a/b/c"},
			Type: OpCreateFile,
		})
		root.QueueOperation(&Operation{
			Key:  "a/b/c",
			Node: &tree.Node{Path: "a/b/c"},
			Type: OpDelete,
		})
		root.QueueOperation(&Operation{
			Key:  "a/b/d",
			Node: &tree.Node{Path: "a/b/d"},
			Type: OpCreateFile,
		})
		root.QueueOperation(&Operation{
			Key:       "m/v/rename",
			Node:      &tree.Node{Path: "m/v/p"},
			EventInfo: model.EventInfo{Path: "m/v/rename"},
			Type:      OpMoveFile,
		})
		t.Log(root.PrintTree())
	})
}
