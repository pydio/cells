//go:build storage

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

package sql

import (
	"context"
	"testing"

	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/idm/meta"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	nsTestcases = test.TemplateSQL(NewNSDAO)
)

func TestNSCrud(t *testing.T) {

	test.RunStorageTests(nsTestcases, func(ctx context.Context) {

		Convey("Create Meta Namespace", t, func() {
			mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
			So(er, ShouldBeNil)

			// Insert a meta
			err := mockDAO.Add(ctx, &idm.UserMetaNamespace{
				Namespace:      "namespace",
				Label:          "label",
				Order:          1,
				JsonDefinition: "{\"test\":\"value\"}",
			})
			So(err, ShouldBeNil)

			// List meta
			result, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(result, ShouldHaveLength, 2) // 2 because DAO automatically adds the Bookmarks namespace
			So(result["namespace"].Order, ShouldEqual, 1)

			jsonDef := result["namespace"].JsonDefinition
			var def map[string]string
			er = json.Unmarshal([]byte(jsonDef), &def)
			So(er, ShouldBeNil)
			So(def["test"], ShouldEqual, "value")

			e := mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: "namespace"})
			So(e, ShouldBeNil)

			// List meta for the node
			result2, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(result2, ShouldHaveLength, 2)
		})
	})

}

func TestNSResourceRules(t *testing.T) {

	test.RunStorageTests(nsTestcases, func(ctx context.Context) {
		mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
		if er != nil {
			panic(er)
		}

		Convey("Test Add Rule", t, func() {

			err := mockDAO.AddPolicy(ctx, "resource-id-ns", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
			So(err, ShouldBeNil)

		})

		Convey("Select Rules", t, func() {

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules", t, func() {

			err := mockDAO.DeletePoliciesForResource(ctx, "resource-id-ns")
			So(err, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 0)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules For Action", t, func() {

			e := mockDAO.AddPolicy(ctx, "resource-id-ns", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
			So(e, ShouldBeNil)
			e = mockDAO.AddPolicy(ctx, "resource-id-ns", &service.ResourcePolicy{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"})
			So(e, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 2)

			err = mockDAO.DeletePoliciesForResourceAndAction(ctx, "resource-id-ns", service.ResourcePolicyAction_READ)
			So(err, ShouldBeNil)

			rules, err = mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})
	})
}
