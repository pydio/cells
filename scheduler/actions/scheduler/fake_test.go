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

package scheduler

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/scheduler/actions"
)

func TestGetActionsManager(t *testing.T) {

	Convey("Test GetActionsManager", t, func() {
		manager := actions.GetActionsManager()
		So(manager, ShouldNotBeNil)
		// So(manager.registeredActions, ShouldHaveLength, 1)

		manager.Register("fakeAction", func() actions.ConcreteAction {
			return &FakeAction{}
		})
		// So(manager.registeredActions, ShouldHaveLength, 2)

		act, ok := manager.ActionById("fakeAction")
		So(ok, ShouldBeTrue)
		So(act, ShouldResemble, &FakeAction{})

		act, ok = manager.ActionById("otherAction")
		So(ok, ShouldBeFalse)
		So(act, ShouldBeNil)
	})
}
