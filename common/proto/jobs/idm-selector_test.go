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

package jobs

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
)

func TestIdmSelector_Filter1(t *testing.T) {

	Convey("Test user single query", t, func() {
		q, _ := anypb.New(&idm.UserSingleQuery{Login: "test"})
		m := &IdmSelector{
			Type:  IdmSelectorType_User,
			Query: &service.Query{SubQueries: []*anypb.Any{q}},
		}
		ctx := context.Background()
		// Simple test
		input := &ActionMessage{Users: []*idm.User{{Login: "test"}}}
		message, opposite, pass := m.Filter(ctx, input)
		So(message, ShouldNotBeNil)
		So(message.Users, ShouldHaveLength, 1)
		So(pass, ShouldBeTrue)
		So(opposite, ShouldBeNil)

		// Opposite test
		input = &ActionMessage{Users: []*idm.User{{Login: "other"}}}
		message, opposite, pass = m.Filter(ctx, input)
		So(message, ShouldNotBeNil)
		So(message.Users, ShouldHaveLength, 0)
		So(pass, ShouldBeFalse)
		So(opposite, ShouldNotBeNil)
		So(opposite.Users, ShouldHaveLength, 1)
	})
}

func TestIdmSelector_Filter2(t *testing.T) {

	Convey("Test user two single queries", t, func() {
		q1, _ := anypb.New(&idm.UserSingleQuery{Login: "test"})
		q2, _ := anypb.New(&idm.UserSingleQuery{HasProfile: "standard"})
		m := &IdmSelector{
			Type: IdmSelectorType_User,
			Query: &service.Query{
				SubQueries: []*anypb.Any{q1, q2},
				Operation:  service.OperationType_AND,
			},
		}
		ctx := context.Background()
		// Simple test
		input := &ActionMessage{Users: []*idm.User{{
			Login: "test",
			Attributes: map[string]string{
				idm.UserAttrProfile: "standard",
			},
		}}}
		message, opposite, pass := m.Filter(ctx, input)
		So(message, ShouldNotBeNil)
		So(message.Users, ShouldHaveLength, 1)
		So(pass, ShouldBeTrue)
		So(opposite, ShouldBeNil)
	})
}

func TestIdmSelector_Filter3(t *testing.T) {

	Convey("Test user complex query", t, func() {
		q1, _ := anypb.New(&idm.UserSingleQuery{Login: "test"})
		q2, _ := anypb.New(&idm.UserSingleQuery{HasProfile: "standard"})
		subQ, _ := anypb.New(&service.Query{
			SubQueries: []*anypb.Any{q1, q2},
			Operation:  service.OperationType_AND,
		})
		m := &IdmSelector{
			Type:  IdmSelectorType_User,
			Query: &service.Query{SubQueries: []*anypb.Any{subQ}},
		}
		ctx := context.Background()
		// Simple test
		input := &ActionMessage{Users: []*idm.User{{
			Login: "test",
			Attributes: map[string]string{
				idm.UserAttrProfile: "standard",
			},
		}}}
		message, opposite, pass := m.Filter(ctx, input)
		So(message, ShouldNotBeNil)
		So(message.Users, ShouldHaveLength, 1)
		So(pass, ShouldBeTrue)
		So(opposite, ShouldBeNil)
	})

}
