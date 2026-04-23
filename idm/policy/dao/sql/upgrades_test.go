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

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/policy"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	upgradeCases = test.TemplateSQL(NewDAO)
)

// TestUpgrade4993 tests the Upgrade4993 migration which adds namespace resources
// to the user-meta-read policy for the rest-apis-default-accesses group.
// Follows the same test infrastructure pattern as Test() in sql_test.go.
//
// Run with: go test -v --tags=storage ./idm/policy/dao/sql/... -run TestUpgrade4993
func TestUpgrade4993(t *testing.T) {
	test.RunStorageTests(upgradeCases, t, func(ctx context.Context) {

		dao, err := manager.Resolve[policy.DAO](ctx)
		if err != nil {
			t.Fatal(err)
		}

		Convey("Upgrade4993 namespace resource migration", t, func() {

			createGroup := func(uuid, policyID string, resources []string) *idm.PolicyGroup {
				return &idm.PolicyGroup{
					Uuid: uuid,
					Policies: []*idm.Policy{{
						ID:        policyID,
						Resources: resources,
					}},
				}
			}

			findGroup := func(uuid string) *idm.PolicyGroup {
				groups, _ := dao.ListPolicyGroups(ctx, nil)
				for _, g := range groups {
					if g.Uuid == uuid {
						return g
					}
				}
				return nil
			}

			Convey("Adds missing namespace resources", func() {
				g := createGroup("rest-apis-default-accesses", "user-meta-read", []string{"rest:/user-meta"})
				_, err := dao.StorePolicyGroup(ctx, g)
				So(err, ShouldBeNil)

				err = policy.Upgrade4993(ctx)
				So(err, ShouldBeNil)

				group := findGroup("rest-apis-default-accesses")
				So(group, ShouldNotBeNil)
				So(len(group.Policies[0].Resources), ShouldEqual, 3)
				So(group.Policies[0].Resources, ShouldContain, "rest:/user-meta/namespace")
				So(group.Policies[0].Resources, ShouldContain, "rest:/user-meta/namespace/<.+>")
			})

			Convey("Is idempotent", func() {
				g := createGroup("rest-apis-default-accesses", "user-meta-read",
					[]string{"rest:/user-meta", "rest:/user-meta/namespace", "rest:/user-meta/namespace/<.+>"})
				_, err := dao.StorePolicyGroup(ctx, g)
				So(err, ShouldBeNil)

				err = policy.Upgrade4993(ctx)
				So(err, ShouldBeNil)

				group := findGroup("rest-apis-default-accesses")
				So(len(group.Policies[0].Resources), ShouldEqual, 3)
			})

			Convey("Adds one missing resource when namespace exists", func() {
				g := createGroup("rest-apis-default-accesses", "user-meta-read", []string{"rest:/user-meta/namespace"})
				_, err := dao.StorePolicyGroup(ctx, g)
				So(err, ShouldBeNil)

				err = policy.Upgrade4993(ctx)
				So(err, ShouldBeNil)

				group := findGroup("rest-apis-default-accesses")
				So(len(group.Policies[0].Resources), ShouldEqual, 2)
				So(group.Policies[0].Resources, ShouldContain, "rest:/user-meta/namespace/<.+>")
			})

			Convey("Skips non-matching groups", func() {
				_, err := dao.StorePolicyGroup(ctx, createGroup("other-group", "other-policy", []string{}))
				So(err, ShouldBeNil)

				g := createGroup("rest-apis-default-accesses", "user-meta-read", []string{"rest:/user-meta"})
				_, err = dao.StorePolicyGroup(ctx, g)
				So(err, ShouldBeNil)

				err = policy.Upgrade4993(ctx)
				So(err, ShouldBeNil)

				other := findGroup("other-group")
				So(len(other.Policies[0].Resources), ShouldEqual, 0)

				target := findGroup("rest-apis-default-accesses")
				So(len(target.Policies[0].Resources), ShouldEqual, 3)
			})
		})
	})
}

func TestUpgrade4993ResolveError(t *testing.T) {
	Convey("Returns error when DAO not in context", t, func() {
		err := policy.Upgrade4993(context.Background())
		So(err, ShouldNotBeNil)
	})
}

func TestUpgrade4993ListError(t *testing.T) {
	test.RunStorageTests(upgradeCases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[policy.DAO](ctx)
		if err != nil {
			t.Fatal(err)
		}

		Convey("Returns error when policy table is missing", t, func() {
			impl := dao.(*sqlimpl)
			So(impl.DB.Migrator().DropTable(&idm.PolicyGroup{}), ShouldBeNil)

			err := policy.Upgrade4993(ctx)
			So(err, ShouldNotBeNil)
		})
	})
}
