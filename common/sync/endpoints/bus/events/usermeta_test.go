/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

package events

import (
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/merger"
)

func TestUserMetaToModelEvent(t *testing.T) {
	Convey("The metadata node keeps the exact parent path, whatever the characters", t, func() {
		p := `folder/double "quotes" \ back – é.txt`
		ev, err := UserMetaToModelEvent(&idm.UpdateUserMetaEvent{
			Operation: idm.UpdateUserMetaEvent_PUT,
			UserMeta: &idm.UserMeta{
				Uuid: "m1", Namespace: "usermeta-x", JsonValue: `"v"`,
				ResolvedNode: &tree.Node{Path: p, Uuid: "n1"},
			},
		}, time.Now(), nil)
		So(err, ShouldBeNil)
		n := ev.MoveTarget.AsProto()
		So(n.GetStringMeta(merger.MetaNodeParentPathMeta), ShouldEqual, p)
		So(n.GetStringMeta(merger.MetaNodeParentUUIDMeta), ShouldEqual, "n1")
	})
}
