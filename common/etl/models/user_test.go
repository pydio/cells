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

package models

import (
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUserEqual(t *testing.T) {
	Convey("Test Merge Users", t, func() {
		idmUser := &idm.User{}
		idmUser.Uuid = "00001-abcdef-123456789"
		idmUser.Login = "user001"
		idmUser.Attributes = make(map[string]string)
		idmUser.Attributes["AuthSource"] = "OpenLdap"
		idmUser.GroupPath = "/group01/group02"

		user := User{idmUser}
		So(user.Equal(idmUser), ShouldBeTrue)

		apiUser := &idm.User{}
		apiUser.Uuid = "00001-abcdef-123456780"
		apiUser.Login = "user002"
		apiUser.Attributes = make(map[string]string)
		apiUser.Attributes["AuthSource"] = "OpenLdap"
		apiUser.GroupPath = "/group01/group02"

		So(user.Equal(apiUser), ShouldBeFalse)
	})
}

func TestUserIsMergeable(t *testing.T) {
	Convey("Test mergeable users", t, func() {
		idmUser := &idm.User{}
		idmUser.Uuid = "00001-abcdef-123456789"
		idmUser.Login = "user001"
		idmUser.Attributes = make(map[string]string)
		idmUser.Attributes["AuthSource"] = "OpenLdap"
		idmUser.GroupPath = "/group01/group02"

		user := User{idmUser}
		So(user.IsMergeable(idmUser), ShouldBeTrue)

		apiUser := &idm.User{}
		apiUser.Uuid = "00001-abcdef-123456780"
		apiUser.Login = "user002"
		apiUser.Attributes = make(map[string]string)
		apiUser.Attributes["AuthSource"] = "MySQL"
		apiUser.GroupPath = "/group01/group02"

		So(user.IsMergeable(apiUser), ShouldBeFalse)
	})
}

func TestUserMerge(t *testing.T) {
	Convey("Test mergeable users", t, func() {
		extUser := &idm.User{}
		extUser.Login = "user001"
		extUser.Attributes = make(map[string]string)
		extUser.Attributes["AuthSource"] = "OpenLdap"
		extUser.Attributes["displayName"] = "User LDAP 001 DisplayName"
		extUser.GroupPath = "/group01/group02"

		apiUser := &idm.User{}
		apiUser.Uuid = "00001-abcdef-123456780"
		apiUser.Login = "user001"
		apiUser.Attributes = make(map[string]string)
		apiUser.Attributes["AuthSource"] = "OpenLdap"
		apiUser.GroupPath = "/group01/group01"

		newRole := new(idm.Role)
		newRole.Uuid = "ldap_Role006"
		newRole.Label = "Role006_New"
		newRole.UserRole = false
		newRole.GroupRole = false

		mappedRole := new(idm.Role)
		mappedRole.Uuid = "ldap_MappedRole"
		mappedRole.Label = "MappedRole"
		mappedRole.UserRole = false
		mappedRole.GroupRole = false

		abandonedRole := new(idm.Role)
		abandonedRole.Uuid = "ldap_Abandonned"
		abandonedRole.Label = "Abandonned"
		abandonedRole.UserRole = false
		abandonedRole.GroupRole = false

		apiUserRole := new(idm.Role)
		apiUserRole.Uuid = "00001-123456789-abcdef-02"
		apiUserRole.Label = "Role User2"
		apiUserRole.UserRole = true
		apiUserRole.GroupRole = false
		//apiUserRole.OwnerUuid = "00001-abcdef-123456780"

		extUser.Roles = append(extUser.Roles, newRole, mappedRole)
		apiUser.Roles = append(apiUser.Roles, apiUserRole, mappedRole, abandonedRole)

		user := User{extUser}
		newUser, err, _ := user.Merge(apiUser, &MergeOptions{})

		if err != nil {
		}

		// Test: no change on uuid, login
		So(newUser.Login == apiUser.Login, ShouldBeTrue)
		So(newUser.Uuid == apiUser.Uuid, ShouldBeTrue)
		So(newUser.GroupPath == extUser.GroupPath, ShouldBeTrue)

		So(newUser.Attributes["displayName"] == extUser.Attributes["displayName"], ShouldBeTrue)

		noAbandonnedRole := true
		hasNewRole := false
		for _, role := range newUser.Roles {
			if role.Uuid == abandonedRole.Uuid {
				noAbandonnedRole = false
			}
			if role.Uuid == newRole.Uuid {
				hasNewRole = true
			}
		}
		// Removed role
		So(noAbandonnedRole, ShouldBeTrue)
		// Added role
		So(hasNewRole, ShouldBeTrue)
	})
}
