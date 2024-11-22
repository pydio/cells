/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package share

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"

	. "github.com/smartystreets/goconvey/convey"
)

func TestSharesHandler_DiffAcls(t *testing.T) {

	Convey("Test Diff Acls", t, func() {

		current := []*idm.ACL{
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "remove-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "remove-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
		}

		target := []*idm.ACL{
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
		}
		sc := NewClient(context.Background(), nil)
		add, remove := sc.DiffAcls(context.Background(), current, target)
		So(add, ShouldHaveLength, 2)
		So(add[0].RoleID, ShouldEqual, "add-me")
		So(add[1].RoleID, ShouldEqual, "add-me")
		So(remove, ShouldHaveLength, 2)
		So(remove[0].RoleID, ShouldEqual, "remove-me")
		So(remove[1].RoleID, ShouldEqual, "remove-me")

	})

	Convey("Test Diff Acls With Other Nodes", t, func() {

		current := []*idm.ACL{
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node1",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node2",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "remove-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node1",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "remove-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node2",
			},
		}

		target := []*idm.ACL{
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node1",
			},
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node2",
			},
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node1",
			},
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "node2",
			},
		}

		sc := NewClient(context.Background(), nil)
		add, remove := sc.DiffAcls(context.Background(), current, target)
		So(add, ShouldHaveLength, 2)
		So(add[0].RoleID, ShouldEqual, "add-me")
		So(add[1].RoleID, ShouldEqual, "add-me")
		So(remove, ShouldHaveLength, 2)
		So(remove[0].RoleID, ShouldEqual, "remove-me")
		So(remove[1].RoleID, ShouldEqual, "remove-me")

	})

}

func TestSharesHandler_DiffReadRoles(t *testing.T) {

	Convey("Test DiffReadRoles", t, func() {

		current := []*idm.ACL{
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "remove-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "remove-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
		}

		target := []*idm.ACL{
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
		}

		sc := NewClient(context.Background(), nil)
		add, remove := sc.DiffReadRoles(context.Background(), current, target)
		So(add, ShouldHaveLength, 1)
		So(remove, ShouldHaveLength, 1)

	})

	Convey("Test DiffReadRoles : just remove a node", t, func() {

		current := []*idm.ACL{
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role-2",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "role-2",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "other-node",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "other-node",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role-2",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "other-node",
			},
			{
				ID:          "4289",
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "role-2",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "other-node",
			},
		}

		target := []*idm.ACL{
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role-2",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "role-2",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
		}

		sc := NewClient(context.Background(), nil)
		add, remove := sc.DiffReadRoles(context.Background(), current, target)
		So(add, ShouldHaveLength, 0)
		So(remove, ShouldHaveLength, 0)

	})

}

func TestSharesHandler_AclsToRoomAcls(t *testing.T) {
	Convey("Test AclsToRoomAcls", t, func() {

		acls := []*idm.ACL{
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "04d4e7a6-0d07-11e8-9a2e-28cfe919ca6f",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
			{
				Action:      &idm.ACLAction{Name: "write", Value: "1"},
				RoleID:      "add-me",
				WorkspaceID: "54a38f71-1287-11e8-9f0f-28cfe919ca6f",
				NodeID:      "2ebcf9cd-abc2-40fd-8fb8-f4b4e916c895",
			},
		}

		sc := NewClient(context.Background(), nil)
		roomAcls := sc.AclsToCellAcls(context.Background(), acls)
		So(roomAcls, ShouldHaveLength, 2)

	})
}
