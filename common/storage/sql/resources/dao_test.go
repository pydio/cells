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

package resources

import (
	"context"
	"testing"

	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO)
)

func TestQueryResourceForAction(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("Test Query Builder", t, func() {

			resDAO, err := manager.Resolve[DAO](ctx)
			So(err, ShouldBeNil)

			expr, e := resDAO.BuildPolicyConditionForAction(ctx, &service.ResourcePolicyQuery{Subjects: []string{"subject-1", "subject-2"}}, service.ResourcePolicyAction_READ)
			So(e, ShouldBeNil)
			So(expr, ShouldNotBeNil)
			//So(queryString, ShouldEqual, "EXISTS ( select 1 from _policies WHERE (_policies.subject='subject-1' OR _policies.subject='subject-2') AND _policies.action='READ' AND _policies.resource=left.uuid )")

			expr, e = resDAO.BuildPolicyConditionForAction(ctx, &service.ResourcePolicyQuery{Subjects: []string{}, Empty: true}, service.ResourcePolicyAction_READ)
			So(e, ShouldBeNil)
			So(expr, ShouldNotBeNil)
			//So(queryString, ShouldEqual, "NOT EXISTS ( select 1 from _policies WHERE _policies.resource=left.uuid AND _policies.action='READ' )")

			expr, e = resDAO.BuildPolicyConditionForAction(ctx, &service.ResourcePolicyQuery{Subjects: []string{}, Empty: false}, service.ResourcePolicyAction_READ)
			So(e, ShouldBeNil)
			So(expr, ShouldNotBeNil)
			//So(queryString, ShouldEqual, "EXISTS ( select 1 from _policies WHERE _policies.action='READ' AND _policies.resource=left.uuid )")

			expr, e = resDAO.BuildPolicyConditionForAction(ctx, &service.ResourcePolicyQuery{Subjects: []string{}, Any: true}, service.ResourcePolicyAction_READ)
			So(e, ShouldBeNil)
			So(expr, ShouldBeNil)

		})
	})
}
