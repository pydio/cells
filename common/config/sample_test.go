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

package config

import (
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

func TestLoadSampleConf(t *testing.T) {

	Convey("Testing json validity of sample config", t, func() {
		var data map[string]interface{}
		e := json.Unmarshal([]byte(SampleConfig), &data)
		So(e, ShouldBeNil)
		def, ok := data["defaults"]
		So(ok, ShouldBeTrue)
		testConf := configx.New()
		So(testConf.Set(data), ShouldBeNil)

		defaults := def.(map[string]interface{})
		layout := defaults["layout"].(map[string]interface{})
		templates := layout["templates"].([]interface{})
		bb, _ := json.Marshal(templates)
		var tpl []*tree.Node
		err := json.Unmarshal(bb, &tpl)
		So(err, ShouldBeNil)
		So(len(tpl), ShouldEqual, 2)
	})
}
