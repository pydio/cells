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

package auth

import (
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/auth/claim"

	. "github.com/smartystreets/goconvey/convey"
)

func TestValidBasicUser(t *testing.T) {
	Convey("Cached basic users validate passwords and claim expiry", t, func() {
		now := time.Now()

		Convey("accepts a matching password when claims have no expiry", func() {
			entry := validBasicUser{Hash: "pw"}
			So(entry.valid("pw", now), ShouldBeTrue)
		})

		Convey("rejects an incorrect password", func() {
			entry := validBasicUser{Hash: "pw"}
			So(entry.valid("other", now), ShouldBeFalse)
		})

		Convey("rejects expired claims even when the password matches", func() {
			entry := validBasicUser{Hash: "pw", Claims: claim.Claims{Expiry: now.Add(-time.Second)}}
			So(entry.valid("pw", now), ShouldBeFalse)
		})

		Convey("accepts unexpired claims when the password matches", func() {
			entry := validBasicUser{Hash: "pw", Claims: claim.Claims{Expiry: now.Add(time.Minute)}}
			So(entry.valid("pw", now), ShouldBeTrue)
		})
	})
}
