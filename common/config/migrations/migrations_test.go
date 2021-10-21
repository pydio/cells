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

package migrations

import (
	"fmt"
	"testing"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/cells/x/configx"
	. "github.com/smartystreets/goconvey/convey"
)

func PrettyPrint(v interface{}) (err error) {
	b, err := json.MarshalIndent(v, "", "  ")
	if err == nil {
		fmt.Println(string(b))
	}
	return
}

func TestUpdateKeys(t *testing.T) {

	// Create new config
	conf := configx.New(configx.WithJSON())
	conf.Set(data)

	Convey("UpdateKeys", t, func() {

		// PrettyPrint(conf.Map())

		err := UpdateKeys(conf, map[string]string{"#non-existing": "new-value"})
		So(err, ShouldBeNil)
		// PrettyPrint(conf.Map())

		err = UpdateKeys(conf, map[string]string{"services/pydio.grpc.auth": "services/pydio.grpc.oauth"})
		So(err, ShouldBeNil)
		So(conf.Val("services/pydio.grpc.oauth").Get(), ShouldNotBeNil)
		// PrettyPrint(conf.Map())

	})
}
