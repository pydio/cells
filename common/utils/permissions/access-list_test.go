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

package permissions

import (
	"context"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
)

var (
	roles = []*idm.Role{
		{Uuid: "root"},
		{Uuid: "role"},
		{Uuid: "user_id"},
	}
	nodes = map[string]string{
		"root":                          "root",
		"root/folder1":                  "root/folder1",
		"root/folder2":                  "root/folder2",
		"root/folder1/subfolder1":       "root/folder1/subfolder1",
		"root/folder1/subfolder1/fileA": "root/folder1/subfolder1/fileA",
		"root/folder1/subfolder1/fileB": "root/folder1/subfolder1/fileB",
		"root/folder1/subfolder2":       "root/folder1/subfolder2",
		"root/folder1/subfolder2/file1": "root/folder1/subfolder2/file1",
		"root/folder1/subfolder2/file2": "root/folder1/subfolder2/file2",
	}
	acls = []*idm.ACL{
		{
			WorkspaceID: "ws1",
			NodeID:      "root/folder1",
			RoleID:      "root",
			Action:      AclRead,
		},
		{
			NodeID: "root/folder1/subfolder1",
			RoleID: "root",
			Action: AclDeny,
		},
		{
			WorkspaceID: "ws2",
			NodeID:      "root/folder1/subfolder2",
			RoleID:      "role",
			Action:      AclRead,
		},
		{
			WorkspaceID: "ws2",
			NodeID:      "root/folder1/subfolder2",
			RoleID:      "role",
			Action:      AclWrite,
		},
		{
			NodeID: "root/folder1/subfolder2/file2",
			RoleID: "user_id",
			Action: AclRead,
		},
		{
			WorkspaceID: "ws2",
			RoleID:      "root",
			Action:      &idm.ACLAction{Name: "other-acl", Value: "no-node-id, must be ignored"},
		},
		{
			NodeID: "root/folder1/subfolder1",
			Action: &idm.ACLAction{Name: "lock", Value: "1"},
		},
	}
)

func listParents(nodeId string) []*tree.Node {
	parts := strings.Split(nodeId, "/")
	var paths, inverted []*tree.Node
	total := len(parts)
	for i := 0; i < total; i++ {
		paths = append(paths, &tree.Node{Uuid: strings.Join(parts[0:i+1], "/")})
	}
	for i := 1; i <= total; i++ {
		inverted = append(inverted, paths[total-i])
	}
	return inverted
}

func TestNewAccessList(t *testing.T) {
	Convey("Test New Access List", t, func() {
		list := NewAccessList(roles, []*idm.ACL{})
		list.Append(acls)
		So(list.OrderedRoles, ShouldResemble, roles)
		So(list.Acls, ShouldResemble, acls)
	})
}

func TestAccessList_Flatten(t *testing.T) {
	Convey("Test Flatten", t, func() {
		ctx := context.Background()
		list := NewAccessList(roles)
		list.Append(acls)
		list.Flatten(ctx)
		So(list.NodesAcls, ShouldHaveLength, 4)
		wsNodes := list.GetWorkspacesNodes()
		So(wsNodes, ShouldHaveLength, 2)
		result := map[string]map[string]Bitmask{}
		rMask := Bitmask{}
		rMask.AddFlag(FlagRead)
		result["ws1"] = map[string]Bitmask{
			"root/folder1": rMask,
		}
		rwMask := Bitmask{}
		rwMask.AddFlag(FlagRead)
		rwMask.AddFlag(FlagWrite)
		result["ws2"] = map[string]Bitmask{
			"root/folder1/subfolder2": rwMask,
		}
		So(wsNodes, ShouldResemble, result)

		testReadWrite := listParents("root/folder1/subfolder2/file1")
		So(list.CanRead(ctx, testReadWrite...), ShouldBeTrue)
		So(list.CanWrite(ctx, testReadWrite...), ShouldBeTrue)

		testReadOnly := listParents("root/folder1/subfolder2/file2")
		So(list.CanRead(ctx, testReadOnly...), ShouldBeTrue)
		So(list.CanWrite(ctx, testReadOnly...), ShouldBeFalse)

		testDenied := listParents("root/folder1/subfolder1/fileA")
		So(list.CanRead(ctx, testDenied...), ShouldBeFalse)
		So(list.CanWrite(ctx, testDenied...), ShouldBeFalse)

		testNothing := listParents("root/folder2")
		So(list.CanRead(ctx, testNothing...), ShouldBeFalse)
		So(list.CanWrite(ctx, testNothing...), ShouldBeFalse)

		testNothing2 := listParents("root")
		So(list.CanRead(ctx, testNothing2...), ShouldBeFalse)
		So(list.CanWrite(ctx, testNothing2...), ShouldBeFalse)

	})
}

func TestPathAncestors(t *testing.T) {
	Convey("Test Path Ancestors", t, func() {
		a := &AccessList{}

		nn := a.pathAncestors(&tree.Node{Path: "/pydiods1/toto/tata/zzz", Type: tree.NodeType_LEAF})
		So(len(nn), ShouldEqual, 4)

		nn = a.pathAncestors(&tree.Node{Path: "/", Type: tree.NodeType_COLLECTION})
		So(len(nn), ShouldEqual, 1)
	})
}
