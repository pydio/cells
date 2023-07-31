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

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func TestQueryResourceForAction(t *testing.T) {

	wrapper := func(ctx context.Context, d dao.DAO) (dao.DAO, error) {
		return NewDAO(d, "left.uuid"), nil
	}
	ctx := context.Background()

	d, e := dao.InitDAO(ctx, sqlite.Driver, sqlite.SharedMemDSN, "", wrapper)
	if e != nil {
		panic(e)
	}

	resDAO := d.(*ResourcesSQL)
	cfg := configx.New()
	cfg.Val("prepare").Set(true)
	resDAO.Init(ctx, cfg)
	resDAO.cache, _ = cache.OpenCache(ctx, "discard://")

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

	Convey("Test Add Policy", t, func() {
		resourceId := "testId"
		policy := &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "test", Effect: service.ResourcePolicy_allow, JsonConditions: "{}"}
		er := resDAO.AddPolicy(resourceId, policy)
		So(er, ShouldBeNil)
	})

	Convey("Test Add Policies", t, func() {
		resourceId := "testId"
		policies := []*service.ResourcePolicy{
			{Action: service.ResourcePolicyAction_READ, Subject: "test", Effect: service.ResourcePolicy_allow, JsonConditions: "{}"},
			{Action: service.ResourcePolicyAction_WRITE, Subject: "test2", Effect: service.ResourcePolicy_deny, JsonConditions: "{}"},
		}
		err := resDAO.AddPolicies(true, resourceId, policies)
		So(err, ShouldBeNil)
	})

	Convey("Test Get Policies For Resource", t, func() {
		resourceId := "testId"
		policies, err := resDAO.GetPoliciesForResource(resourceId)
		So(err, ShouldBeNil)
		So(len(policies), ShouldBeGreaterThan, 0)
	})

	Convey("Test Get Policies For Subject", t, func() {
		subject := "test"
		policies, err := resDAO.GetPoliciesForSubject(subject)
		So(err, ShouldBeNil)
		So(len(policies), ShouldBeGreaterThan, 0)
	})

	Convey("Test Replace Policies Subject", t, func() {
		oldSubject := "test"
		newSubject := "renamed"
		count, err := resDAO.ReplacePoliciesSubject(oldSubject, newSubject)
		So(err, ShouldBeNil)
		So(count, ShouldBeGreaterThan, 0)
		policies, err := resDAO.GetPoliciesForSubject("renamed")
		So(err, ShouldBeNil)
		So(len(policies), ShouldBeGreaterThan, 0)
	})

	Convey("Test Delete Policies For Resource", t, func() {
		resourceId := "testId"
		err := resDAO.DeletePoliciesForResource(resourceId)
		So(err, ShouldBeNil)
	})

	Convey("Test Delete Policies By Subject", t, func() {
		subject := "test"
		err := resDAO.DeletePoliciesBySubject(subject)
		So(err, ShouldBeNil)
	})

	Convey("Test Delete Policies For Resource And Action", t, func() {
		resourceId := "testId"
		action := service.ResourcePolicyAction_READ
		err := resDAO.DeletePoliciesForResourceAndAction(resourceId, action)
		So(err, ShouldBeNil)
	})
}
