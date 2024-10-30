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
	"os"
	"strings"
	"testing"

	"github.com/pydio/cells/v4/common"
	permissions2 "github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/server/stubs/idmtest"
	"github.com/pydio/cells/v4/common/storage/sql"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/cache/gocache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	"github.com/pydio/cells/v4/common/utils/uuid"
	acldao "github.com/pydio/cells/v4/idm/acl/dao/sql"
	roledao "github.com/pydio/cells/v4/idm/role/dao/sql"
	usrdao "github.com/pydio/cells/v4/idm/user/dao/sql"
	wsdao "github.com/pydio/cells/v4/idm/workspace/dao/sql"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testData *idmtest.TestData
)

func TestMain(m *testing.M) {
	cache_helper.SetStaticResolver("pm://", &gocache.URLOpener{})
	m.Run()

}

var (
	testServices = map[string]map[string]any{
		common.ServiceUserGRPC: {
			"sql": usrdao.NewDAO,
		},
		common.ServiceRoleGRPC: {
			"sql": roledao.NewDAO,
		},
		common.ServiceAclGRPC: {
			"sql": acldao.NewDAO,
		},
		common.ServiceWorkspaceGRPC: {
			"sql": wsdao.NewDAO,
		},
	}
	testcases []test.ServicesStorageTestCase
)

func init() {
	unique := uuid.New()[:6] + "_"
	testcases = []test.ServicesStorageTestCase{
		{
			DSN:       map[string]string{"sql": sql.SqliteDriver + "://" + sql.SharedMemDSN + "&hookNames=cleanTables&prefix=" + unique},
			Condition: true,
			Services:  testServices,
			Label:     "Sqlite",
		},
	}
	if other := os.Getenv("CELLS_TEST_MYSQL_DSN"); other != "" {
		for _, dsn := range strings.Split(other, ";") {
			testcases = append(testcases, test.ServicesStorageTestCase{
				DSN:       map[string]string{"sql": strings.TrimSpace(dsn) + "?parseTime=true&hookNames=cleanTables&prefix=" + unique},
				Condition: true,
				Services:  testServices,
				Label:     "MySQL",
			})
		}
	}
	if other := os.Getenv("CELLS_TEST_PGSQL_DSN"); other != "" {
		for _, dsn := range strings.Split(other, ";") {
			testcases = append(testcases, test.ServicesStorageTestCase{
				DSN:       map[string]string{"sql": strings.TrimSpace(dsn) + "&hookNames=cleanTables&prefix=" + unique},
				Condition: true,
				Services:  testServices,
				Label:     "Postgres",
			})
		}
	}

}

func TestSearchUniqueUser(t *testing.T) {

	test.RunServicesTests(testcases, t, func(ctx context.Context) {
		Convey("Setup Mock Data", t, func() {
			sd, er := idmtest.GetStartData()
			So(er, ShouldBeNil)
			testData = sd
			er = idmtest.RegisterIdmMocksWithData(ctx, sd)
			So(er, ShouldBeNil)
		})

		Convey("Test Basic Search Requests on Mocks", t, func() {

			adminUser, e := permissions2.SearchUniqueUser(ctx, "admin", "")
			So(e, ShouldBeNil)
			_, e = permissions2.SearchUniqueUser(ctx, "otherlogin", "")
			So(e, ShouldNotBeNil)
			aa, e := permissions2.GetACLsForActions(ctx, permissions2.AclRead)
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
			fakeAcl.Flatten(ctx)

			aa, er := permissions2.GetACLsForWorkspace(ctx, []string{
				testData.WsSlugToUuid("common-files"),
			}, permissions2.AclRead, permissions2.AclWrite)
			So(er, ShouldBeNil)
			So(aa, ShouldHaveLength, 2)

			rr, er := permissions2.GetRolesForUser(ctx, adminUser, false)
			So(er, ShouldBeNil)
			So(rr, ShouldHaveLength, 3)

			rr, _ = permissions2.GetRoles(ctx, []string{"ADMINS"})
			So(rr, ShouldHaveLength, 1)

		})

		Convey("Test ACL List load", t, func() {
			acl, user, er := permissions2.AccessListFromUser(ctx, "admin", false)
			So(er, ShouldBeNil)
			So(user, ShouldNotBeEmpty)
			So(acl, ShouldNotBeEmpty)
			wss := acl.DetectedWsRights(ctx)
			So(wss, ShouldHaveLength, 4)
		})

	})

}
