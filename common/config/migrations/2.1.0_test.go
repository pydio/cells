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
	"testing"

	hashiversion "github.com/hashicorp/go-version"

	"github.com/pydio/cells/v5/common/utils/configx"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	data = []byte(`{
		"services": {
			"pydio.grpc.auth": {
				"dex": {
					"connectors": [{
						"id": "pydio",
						"name": "pydio",
						"type": "pydio",
						"config": {
							"pydioconnectors": [{
								"id": "pydioapi",
								"type": "pydioapi",
								"name": "Pydio API"
							}, {
								"id": "othertype",
								"type": "othertype",
								"name": "othertype"
							}]
						}
					}]
				}
			}
		}
	}`)
)

func TestMigration2_1_0(t *testing.T) {

	// Create new config
	conf := configx.New(configx.WithJSON())
	conf.Set(data)

	Convey("Testing initial upgrade of config", t, func() {

		// PrettyPrint(conf.Map())

		target, _ := hashiversion.NewVersion("2.1.0")
		_, err := UpgradeConfigsIfRequired(conf, target)

		So(err, ShouldBeNil)

		// PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)

		So(conf.Val("services/pydio.web.oauth/connectors[0]/id").String(), ShouldEqual, "pydio")
		So(conf.Val("services/pydio.grpc.auth/connectors[0]/config").Get(), ShouldBeNil)
	})
}
