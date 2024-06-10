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

package conditions

import (
	"testing"

	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"
	"github.com/stretchr/testify/require"

	errors "github.com/pydio/cells/v4/common/middleware/keys"

	. "github.com/smartystreets/goconvey/convey"
)

func TestDateWithinPeriodCondition(t *testing.T) {

	Convey("Canonical within period tests", t, func() {

		for _, c := range []struct {
			dateBegin string
			dateEnd   string
			value     interface{}
			pass      bool
		}{
			{dateBegin: "2006-01-02T15:04-0700", dateEnd: "2006-02-02T15:04-0700", value: "2006-02-01T15:04-0700", pass: true},
			{dateBegin: "2006-01-02T15:04-0700", dateEnd: "2006-02-02T15:04-0700", value: "2006-02-01T17:04-0100", pass: true},
			{dateBegin: "2006-01-02T15:04-0700", dateEnd: "2006-02-02T15:04-0700", value: "2006-02-03T15:04-0700", pass: false},
		} {
			condition := &DateWithinPeriodCondition{
				DateBegin: c.dateBegin,
				DateEnd:   c.dateEnd,
			}

			So(condition.Fulfills(c.value, new(ladon.Request)), ShouldEqual, c.pass)
		}
	})
}

func TestDateWithinPeriodPolicy(t *testing.T) {

	Convey("Test DateWithinPeriodPolicy", t, func() {

		ladonPolicy := &ladon.DefaultPolicy{
			ID:          "date-rule",
			Description: "ACL Rule example, allowing write only within a given period",
			Subjects:    []string{"max"},
			Resources:   []string{"resource1"},
			Actions:     []string{"write"},
			Effect:      ladon.AllowAccess,
			Conditions: ladon.Conditions{
				errors.ClientTime: &DateWithinPeriodCondition{
					DateBegin: "2006-01-02T15:04-0700",
					DateEnd:   "2006-02-02T15:04-0700",
				},
			},
		}

		// Instantiate ladon with the default in-memory store.
		warden := &ladon.Ladon{Manager: memory.NewMemoryManager()}

		// Add the policies defined above to the memory manager.
		require.Nil(t, warden.Manager.Create(ladonPolicy))

		requestOK := &ladon.Request{
			Subject:  "max",
			Resource: "resource1",
			Action:   "write",
			Context: ladon.Context{
				"ClientTime": "2006-02-01T15:04-0700",
			},
		}
		requestNotOK := &ladon.Request{
			Subject:  "max",
			Resource: "resource1",
			Action:   "write",
			Context: ladon.Context{
				"ClientTime": "2020-02-01T15:04-0700",
			},
		}

		// This is where we ask the warden if the access requests should be granted
		// Note IsAllowed returns null when access is granted and an error otherwise
		So(warden.IsAllowed(requestOK), ShouldBeNil)
		So(warden.IsAllowed(requestNotOK), ShouldNotBeNil)
	})
}
