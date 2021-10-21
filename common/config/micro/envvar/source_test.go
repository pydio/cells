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

package envvar

import (
	"os"
	"testing"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/go-os/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestTreeNode(t *testing.T) {

	testSrc := NewSource(
		config.SourceName("PYDIO"),
	)

	Convey("Test retrieval and transformation of env variables", t, func() {
		// Simple name
		os.Setenv("PYDIO_URL", "http://localhost:2001")
		result, err := testSrc.Read()
		So(err, ShouldBeNil)
		resConf := string(result.Data)
		So(resConf, ShouldEqual, `{"url":"http://localhost:2001"}`)

		// Test composed name and nested variables
		os.Setenv("PYDIO_PORTS_MICRO.API", "777")
		os.Setenv("PYDIO_PORTS_NATS", "666")
		result, err = testSrc.Read()
		So(err, ShouldBeNil)
		resConf = string(result.Data)

		var config map[string]interface{}
		err = json.Unmarshal(result.Data, &config)
		So(err, ShouldBeNil)
		value := (config["ports"].(map[string]interface{}))["micro.api"]
		So(value, ShouldEqual, "777")
		So(resConf, ShouldEqual, `{"ports":{"micro.api":"777","nats":"666"},"url":"http://localhost:2001"}`)
	})
}
