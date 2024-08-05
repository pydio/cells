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

package permissions_test

import (
	"context"
	"log"
	"testing"

	permissions2 "github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/server/stubs/idmtest"
	"github.com/pydio/cells/v4/common/utils/cache/gocache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var testData *idmtest.TestData

func TestMain(m *testing.M) {
	cache_helper.SetStaticResolver("pm://", &gocache.URLOpener{})
	sd, er := idmtest.GetStartData()
	if er != nil {
		log.Fatal(er)
	}
	testData = sd

	er = idmtest.RegisterIdmMocksWithData(testData)
	if er != nil {
		log.Fatal(er)
	}

	m.Run()

}

func TestSearchUniqueUser(t *testing.T) {
	bg := context.Background()
	Convey("Test Basic Search Requests on Mocks", t, func() {
		adminUser, e := permissions2.SearchUniqueUser(bg, "admin", "")
		So(e, ShouldBeNil)
		_, e = permissions2.SearchUniqueUser(bg, "otherlogin", "")
		So(e, ShouldNotBeNil)
		aa, e := permissions2.GetACLsForActions(bg, permissions2.AclRead)
		So(e, ShouldBeNil)
		So(aa, ShouldNotBeEmpty)

		fakeAcl := permissions2.NewAccessList()
		fakeAcl.AppendACLs(&idm.ACL{
			ID:          "",
			Action:      &idm.ACLAction{Name: "read", Value: "1"},
			RoleID:      "ROOT_GROUP",
			WorkspaceID: testData.WsSlugToUuid("common-files"),
			NodeID:      "pydiods1",
		})
		fakeAcl.Flatten(bg)

		aa, er := permissions2.GetACLsForWorkspace(bg, []string{
			testData.WsSlugToUuid("common-files"),
		}, permissions2.AclRead, permissions2.AclWrite)
		So(er, ShouldBeNil)
		So(aa, ShouldHaveLength, 2)

		rr, er := permissions2.GetRolesForUser(bg, adminUser, false)
		So(er, ShouldBeNil)
		So(rr, ShouldHaveLength, 3)

		rr, _ = permissions2.GetRoles(bg, []string{"ADMINS"})
		So(rr, ShouldHaveLength, 1)

	})

	Convey("Test ACL List load", t, func() {
		acl, user, er := permissions2.AccessListFromUser(bg, "admin", false)
		So(er, ShouldBeNil)
		So(user, ShouldNotBeEmpty)
		So(acl, ShouldNotBeEmpty)
		wss := acl.DetectedWsRights(bg)
		So(wss, ShouldHaveLength, 4)
	})

}
