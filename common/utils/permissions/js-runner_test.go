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

package permissions

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRunJavaScript(t *testing.T) {
	Convey("Test RunJavascript expect string", t, func() {
		script := `Path = "test/" + User.Name;`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"Path": "",
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldBeNil)
		So(out["Path"], ShouldEqual, "test/john")
	})
	Convey("Test RunJavascript expect bool", t, func() {
		script := `bVal = User.Name === "john";`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"bVal": false,
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldBeNil)
		So(out["bVal"], ShouldBeTrue)
	})
	Convey("Test unexpected output format", t, func() {
		script := `bVal = User.Name === "john";`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"bVal": 18,
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldNotBeNil)
	})
	Convey("Test invalid Javascript", t, func() {
		script := `Value = User/Name === john;`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"Value": false,
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldNotBeNil)
	})
}
