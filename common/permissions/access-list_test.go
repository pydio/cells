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

package permissions

import (
	"context"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
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
		"root/folder1/subfolder2/file3": "root/folder1/subfolder2/file3",
		"root/filtered":                 "root/filtered",
		"root/filtered/sub1":            "root/filtered/sub1",
		"root/filtered/sub1/sub11":      "root/filtered/sub11",
		"root/filtered/sub1/sub11/file": "root/filtered/sub11/file",
	}
	metas = map[string]map[string]string{
		"root/filtered":                 {"usermeta-tags": `"filtered"`},
		"root/folder1/subfolder2/file3": {"usermeta-tags": `"filtered"`},
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
	policyAcls = []*idm.ACL{
		{
			WorkspaceID: "ws1",
			NodeID:      "root",
			RoleID:      "user_id",
			Action: &idm.ACLAction{
				Name: "policy", Value: "meta-filter",
			},
		},
	}
)

func policyMockResolver(ctx context.Context, request *idm.PolicyEngineRequest, explicitOnly bool) (*idm.PolicyEngineResponse, error) {
	policyId := strings.TrimPrefix(request.Subjects[0], "policy:")
	allowed := true

	switch policyId {
	case "meta-filter":
		if v, o := request.Context["NodeMeta:usermeta-tags"]; o && v == "filtered" {
			allowed = false
		}
	default:
		allowed = true
	}

	return &idm.PolicyEngineResponse{
		Allowed: allowed,
	}, nil
}

func virtualMockResolver(ctx context.Context, node *tree.Node) (*tree.Node, bool) {
	return nil, false
}

func listParents(nodeId string) []*tree.Node {
	parts := strings.Split(nodeId, "/")
	var paths, inverted []*tree.Node
	total := len(parts)
	for i := 0; i < total; i++ {
		p := strings.Join(parts[0:i+1], "/")
		node := &tree.Node{Uuid: p, Path: p}
		if meta, ok := metas[p]; ok {
			node.MetaStore = meta
		}
		paths = append(paths, node)
	}
	for i := 1; i <= total; i++ {
		inverted = append(inverted, paths[total-i])
	}
	return inverted
}

func TestNewAccessList(t *testing.T) {
	Convey("Test New Access List", t, func() {
		list := NewAccessList(roles...)
		list.AppendACLs(acls...)
		So(list.orderedRoles, ShouldResemble, roles)
		So(list.wsACLs, ShouldResemble, acls)
	})
}

func TestAccessList_Flatten(t *testing.T) {
	Convey("Test Flatten", t, func() {
		ctx := context.Background()
		list := NewAccessList(roles...)
		list.AppendACLs(acls...)
		list.Flatten(ctx)
		So(list.masksByUUIDs, ShouldHaveLength, 4)

		// Path and UUID are the same, a trick to avoid triggering load of PathsAcls
		list.masksByPaths = list.masksByUUIDs
		_ = list.LoadWorkspaces(ctx, func(ctx context.Context, uuids []string) ([]*idm.Workspace, error) {
			return []*idm.Workspace{
				{UUID: "ws1"},
				{UUID: "ws2"},
			}, nil
		})
		So(list.HasPolicyBasedAcls(), ShouldBeFalse)

		So(list.wssRootsMasks, ShouldHaveLength, 2)
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
		So(list.wssRootsMasks, ShouldResemble, result)

		testReadWrite := listParents("root/folder1/subfolder2/file1")
		So(list.CanRead(ctx, testReadWrite...), ShouldBeTrue)
		So(list.CanWrite(ctx, testReadWrite...), ShouldBeTrue)
		So(list.IsLocked(ctx, testReadWrite...), ShouldBeFalse)
		wss, _ := list.BelongsToWorkspaces(ctx, testReadWrite...)
		So(wss, ShouldHaveLength, 2)

		So(list.CanReadPath(ctx, virtualMockResolver, testReadWrite...), ShouldBeTrue)
		So(list.CanWritePath(ctx, virtualMockResolver, testReadWrite...), ShouldBeTrue)

		testReadOnly := listParents("root/folder1/subfolder2/file2")
		So(list.CanRead(ctx, testReadOnly...), ShouldBeTrue)
		So(list.CanWrite(ctx, testReadOnly...), ShouldBeFalse)
		So(list.CanReadPath(ctx, virtualMockResolver, testReadOnly...), ShouldBeTrue)
		So(list.CanWritePath(ctx, virtualMockResolver, testReadOnly...), ShouldBeFalse)

		testDenied := listParents("root/folder1/subfolder1/fileA")
		So(list.CanRead(ctx, testDenied...), ShouldBeFalse)
		So(list.CanWrite(ctx, testDenied...), ShouldBeFalse)
		So(list.CanReadPath(ctx, virtualMockResolver, testDenied...), ShouldBeFalse)
		So(list.CanWritePath(ctx, virtualMockResolver, testDenied...), ShouldBeFalse)

		testNothing := listParents("root/folder2")
		So(list.CanRead(ctx, testNothing...), ShouldBeFalse)
		So(list.CanWrite(ctx, testNothing...), ShouldBeFalse)
		So(list.CanReadPath(ctx, virtualMockResolver, testNothing...), ShouldBeFalse)
		So(list.CanWritePath(ctx, virtualMockResolver, testNothing...), ShouldBeFalse)

		testNothing2 := listParents("root")
		So(list.CanRead(ctx, testNothing2...), ShouldBeFalse)
		So(list.CanWrite(ctx, testNothing2...), ShouldBeFalse)
		So(list.CanReadPath(ctx, virtualMockResolver, testNothing2...), ShouldBeFalse)
		So(list.CanWritePath(ctx, virtualMockResolver, testNothing2...), ShouldBeFalse)

	})

}

func TestAclPolicies(t *testing.T) {
	Convey("Test Policies", t, func() {
		// Override default PolicyChecker
		ResolvePolicyRequest = policyMockResolver

		ctx := context.Background()
		list := NewAccessList(roles...)
		list.AppendACLs(policyAcls...)
		list.Flatten(ctx)
		// Path and UUID are the same, a trick to avoid triggering load of PathsAcls
		list.masksByPaths = list.masksByUUIDs

		So(list.HasPolicyBasedAcls(), ShouldBeTrue)

		readable := listParents("root/folder1")
		So(list.CanRead(ctx, readable...), ShouldBeTrue)
		So(list.CanReadPath(ctx, virtualMockResolver, readable...), ShouldBeTrue)

		denied := listParents("root/filtered")
		So(list.CanRead(ctx, denied...), ShouldBeFalse)
		So(list.CanReadPath(ctx, virtualMockResolver, denied...), ShouldBeFalse)

		deniedDeep := listParents("root/filtered/sub11/file")
		So(list.CanRead(ctx, deniedDeep...), ShouldBeFalse)
		So(list.CanReadPath(ctx, virtualMockResolver, deniedDeep...), ShouldBeFalse)
	})

}
