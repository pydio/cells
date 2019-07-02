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

package config

import (
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestTreeNode(t *testing.T) {

	PydioConfigDir = os.TempDir()

	// For the time being, we do not use env variable as option backend,
	// so the below test would fail.

	// Convey("Test Get env", t, func() {
	// 	os.Setenv("PYDIO_URL", "http://localhost:2015")
	// 	So(Get("url").String(""), ShouldEqual, "http://localhost:2015")
	// })

	Convey("Test Set", t, func() {

		Set("whatever", "url")
		So(Get("url").String(""), ShouldEqual, "whatever")

	})

	// Convey("Test Del", t, func() {
	// 	Del()
	// })
}
