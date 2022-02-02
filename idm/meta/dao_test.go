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

package meta

import (
	"fmt"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	mockDAO DAO
)

func TestMain(m *testing.M) {
	var options = configx.New()

	sqlDAO := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test")
	if sqlDAO == nil {
		fmt.Print("Could not start test")
		return
	}

	d := NewDAO(sqlDAO)
	if err := d.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	mockDAO = d.(DAO)

	m.Run()
}

func TestCrud(t *testing.T) {

	Convey("Create Meta", t, func() {
		// Insert a meta
		metaWithId, _, err := mockDAO.Set(&idm.UserMeta{
			NodeUuid:  "node-uuid",
			Namespace: "namespace",
			JsonValue: "stringvalue",
			Policies: []*service.ResourcePolicy{
				{Subject: "user:owner", Action: service.ResourcePolicyAction_OWNER},
			},
		})
		So(err, ShouldBeNil)
		So(metaWithId.Uuid, ShouldNotBeEmpty)

		// Insert a similar meta with another user
		_, _, err = mockDAO.Set(&idm.UserMeta{
			NodeUuid:  "node-uuid",
			Namespace: "namespace",
			JsonValue: "stringvalue",
			Policies: []*service.ResourcePolicy{
				{Subject: "user:owner2", Action: service.ResourcePolicyAction_OWNER},
			},
		})
		So(err, ShouldBeNil)

		// Update the first meta
		_, _, err = mockDAO.Set(&idm.UserMeta{
			NodeUuid:  "node-uuid",
			Namespace: "namespace",
			JsonValue: "newvalue",
			Policies: []*service.ResourcePolicy{
				{Subject: "user:owner", Action: service.ResourcePolicyAction_OWNER},
			},
		})
		So(err, ShouldBeNil)

		// List meta for the node
		result, er := mockDAO.Search([]string{}, []string{"node-uuid"}, "", "", nil)
		So(er, ShouldBeNil)
		So(result, ShouldHaveLength, 2)

		// List meta for the node, restricting by owner
		result, er = mockDAO.Search([]string{}, []string{"node-uuid"}, "", "user:owner", nil)
		So(er, ShouldBeNil)
		So(result, ShouldHaveLength, 1)

		_, e := mockDAO.Del(&idm.UserMeta{Uuid: metaWithId.Uuid})
		So(e, ShouldBeNil)

		// List meta for the node
		result, er = mockDAO.Search([]string{}, []string{"node-uuid"}, "", "", nil)
		So(er, ShouldBeNil)
		So(result, ShouldHaveLength, 1)
	})

	Convey("Test Meta and Policies", t, func() {

		// Insert a meta
		metaWithId, _, err := mockDAO.Set(&idm.UserMeta{
			NodeUuid:  "node-policy",
			Namespace: "namespace",
			JsonValue: "stringvalue",
			Policies: []*service.ResourcePolicy{
				{Subject: "user:owner", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
				{Subject: "user:owner", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
			},
		})
		So(err, ShouldBeNil)
		So(metaWithId.Uuid, ShouldNotBeEmpty)

		// Insert a similar meta with another user
		otherMeta, _, err := mockDAO.Set(&idm.UserMeta{
			NodeUuid:  "node-policy",
			Namespace: "namespace",
			JsonValue: "stringvalue",
			Policies: []*service.ResourcePolicy{
				{Subject: "user:owner2", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
				{Subject: "user:owner2", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
			},
		})
		So(err, ShouldBeNil)
		So(otherMeta.Uuid, ShouldNotBeEmpty)
		So(otherMeta.Uuid, ShouldNotEqual, metaWithId.Uuid)

		// List meta for the node, restricting by owner
		result, er := mockDAO.Search([]string{}, []string{}, "namespace", "", &service.ResourcePolicyQuery{
			Subjects: []string{"user:owner"},
		})
		//result, er = mockDAO.Search([]string{}, []string{"node-policy"}, "namespace", "", nil)
		So(er, ShouldBeNil)
		So(result[0].GetPolicies(), ShouldHaveLength, 2)
	})
}

func TestResourceRules(t *testing.T) {

	Convey("Test Add Rule", t, func() {

		err := mockDAO.AddPolicy("resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
		So(err, ShouldBeNil)

	})

	Convey("Select Rules", t, func() {

		rules, err := mockDAO.GetPoliciesForResource("resource-id")
		So(rules, ShouldHaveLength, 1)
		So(err, ShouldBeNil)

	})

	Convey("Delete Rules", t, func() {

		err := mockDAO.DeletePoliciesForResource("resource-id")
		So(err, ShouldBeNil)

		rules, err := mockDAO.GetPoliciesForResource("resource-id")
		So(rules, ShouldHaveLength, 0)
		So(err, ShouldBeNil)

	})

	Convey("Delete Rules For Action", t, func() {

		mockDAO.AddPolicy("resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
		mockDAO.AddPolicy("resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"})

		rules, err := mockDAO.GetPoliciesForResource("resource-id")
		So(rules, ShouldHaveLength, 2)

		err = mockDAO.DeletePoliciesForResourceAndAction("resource-id", service.ResourcePolicyAction_READ)
		So(err, ShouldBeNil)

		rules, err = mockDAO.GetPoliciesForResource("resource-id")
		So(rules, ShouldHaveLength, 1)
		So(err, ShouldBeNil)

	})

}
