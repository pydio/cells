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

package converter

import (
	"testing"

	"github.com/ory/ladon"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/idm/policy/conditions"
)

func TestProtoToLadonPolicy(t *testing.T) {

	Convey("Test Proto => Ladon", t, func() {

		protoPolicy := &idm.Policy{
			Id:          "policy-id",
			Description: "policy description",
			Resources:   []string{"resource1", "resource2"},
			Subjects:    []string{"subject1", "subject2", "subject3"},
			Actions:     []string{"action1", "action2", "action3", "action4"},
			Effect:      idm.PolicyEffect_allow,
			Conditions: map[string]*idm.PolicyCondition{
				"field": {
					Type:        "StringMatchCondition",
					JsonOptions: "{\"matches\":\"matching-regexp\"}",
				},
			},
		}

		test := ProtoToLadonPolicy(protoPolicy)
		So(test, ShouldNotBeNil)
		So(test.GetID(), ShouldEqual, "policy-id")
		So(test.GetDescription(), ShouldEqual, "policy description")
		So(test.GetResources(), ShouldHaveLength, 2)
		So(test.GetSubjects(), ShouldHaveLength, 3)
		So(test.GetActions(), ShouldHaveLength, 4)
		So(test.GetEffect(), ShouldEqual, ladon.AllowAccess)
		So(test.GetConditions(), ShouldHaveLength, 1)
		So(test.GetConditions(), ShouldContainKey, "field")
		cd := test.GetConditions()["field"]
		So(cd, ShouldResemble, &ladon.StringMatchCondition{Matches: "matching-regexp"})

		protoPolicy.Effect = idm.PolicyEffect_deny
		test2 := ProtoToLadonPolicy(protoPolicy)
		So(test2.GetEffect(), ShouldEqual, ladon.DenyAccess)
	})
}

func TestLadonToProtoPolicy(t *testing.T) {
	Convey("Test Ladon => Proto", t, func() {

		ladonPolicy := &ladon.DefaultPolicy{
			ID:          "acl-complex-rule2",
			Description: "ACL Rule example, preventing write on certain conditions",
			Subjects:    []string{"policy:sample-acl-policy"},
			Resources:   []string{"acl"},
			Actions:     []string{"write"},
			Effect:      ladon.DenyAccess,
			Conditions: ladon.Conditions{
				"RemoteAddress": &conditions.StringNotMatchCondition{
					Matches: "localhost|127.0.0.1|::1",
				},
				"NodeMetaName": &ladon.StringMatchCondition{
					Matches: "target",
				},
			},
		}

		test := LadonToProtoPolicy(ladonPolicy)
		So(test, ShouldNotBeNil)
		So(test.Id, ShouldEqual, "acl-complex-rule2")
		So(test.Conditions, ShouldHaveLength, 2)
		So(test.Conditions, ShouldContainKey, "RemoteAddress")
		cd := test.Conditions["RemoteAddress"]
		So(cd.Type, ShouldEqual, "StringNotMatchCondition")
		So(cd.JsonOptions, ShouldEqual, "{\"matches\":\"localhost|127.0.0.1|::1\"}")
		//So(cd, ShouldResemble, &idm.PolicyCondition{Type: "StringNotMatchCondition", JsonOptions: "{\"matches\":\"localhost|127.0.0.1|::1\"}"})
	})
}
