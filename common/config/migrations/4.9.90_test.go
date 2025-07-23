/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

	version "github.com/hashicorp/go-version"

	"github.com/pydio/cells/v5/common/utils/configx"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMigration4990(t *testing.T) {
	tData := []byte(`{
		  "databases": {
			"f75c65a6c1abae235051ecb8df03ef317bc8ef69": {
			  "driver": "mysql",
			  "dsn": "root:cells@tcp(localhost:3306)/cells_migrate?parseTime=true"
			},
			"mongodb-471ec9ed": {
			  "driver": "mongodb",
			  "dsn": "mongodb://localhost:27017/cells2"
			}
		  },
		"version": "4.4.15"
	}`)

	Convey("Testing 4990 upgrade of config", t, func() {

		// Create new config
		conf := configx.New(configx.WithJSON())
		_ = conf.Set(tData)

		target, _ := version.NewVersion("5.0.0")
		b, err := UpgradeConfigsIfRequired(conf, target)
		So(b, ShouldBeTrue)
		So(err, ShouldBeNil)

		_ = PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)
	})

}
