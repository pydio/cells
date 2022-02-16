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
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/service"
)

func TestQueryResourceForAction(t *testing.T) {

	wrapper := func(d dao.DAO) dao.DAO {
		return NewDAO(d, "left.uuid")
	}
	d, e := dao.InitDAO(sqlite.Driver, sqlite.SharedMemDSN, "", wrapper)
	if e != nil {
		panic(e)
	}
	resDAO := d.(*ResourcesSQL)

	Convey("Test Query Builder", t, func() {

		expr, e := resDAO.BuildPolicyConditionForAction(&service.ResourcePolicyQuery{Subjects: []string{"subject-1", "subject-2"}}, service.ResourcePolicyAction_READ)
		So(e, ShouldBeNil)
		So(expr, ShouldNotBeNil)
		//So(queryString, ShouldEqual, "EXISTS ( select 1 from _policies WHERE (_policies.subject='subject-1' OR _policies.subject='subject-2') AND _policies.action='READ' AND _policies.resource=left.uuid )")

		expr, e = resDAO.BuildPolicyConditionForAction(&service.ResourcePolicyQuery{Subjects: []string{}, Empty: true}, service.ResourcePolicyAction_READ)
		So(e, ShouldBeNil)
		So(expr, ShouldNotBeNil)
		//So(queryString, ShouldEqual, "NOT EXISTS ( select 1 from _policies WHERE _policies.resource=left.uuid AND _policies.action='READ' )")

		expr, e = resDAO.BuildPolicyConditionForAction(&service.ResourcePolicyQuery{Subjects: []string{}, Empty: false}, service.ResourcePolicyAction_READ)
		So(e, ShouldBeNil)
		So(expr, ShouldNotBeNil)
		//So(queryString, ShouldEqual, "EXISTS ( select 1 from _policies WHERE _policies.action='READ' AND _policies.resource=left.uuid )")

		expr, e = resDAO.BuildPolicyConditionForAction(&service.ResourcePolicyQuery{Subjects: []string{}, Any: true}, service.ResourcePolicyAction_READ)
		So(e, ShouldBeNil)
		So(expr, ShouldBeNil)

	})

}
