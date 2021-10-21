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

	"github.com/hashicorp/go-version"

	"github.com/pydio/cells/x/configx"
	. "github.com/smartystreets/goconvey/convey"
)

func TestMigration2_2_0(t *testing.T) {

	data := []byte(`{
		"defaults": {
			"urlInternal": "http://192.168.1.1:8080",
			"url": "http://example.com"
		},
		"services": {
			"pydio.grpc.data.sync": {
			  "sources": "[\"mnt\",\"pydiods1\",\"personal\",\"cellsdata\",\"updated:1589793099\"]"
			}
		},
		"version": "2.1.0"
	}`)

	Convey("Testing initial upgrade of config", t, func() {

		// Create new config
		conf := configx.New(configx.WithJSON())
		conf.Set(data)

		target, _ := version.NewVersion("2.2.0")
		save, err := UpgradeConfigsIfRequired(conf, target)
		So(save, ShouldBeTrue)
		So(err, ShouldBeNil)

		PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)
	})

}

func TestMigration2_2_0_Self(t *testing.T) {

	data := []byte(`{
		"cert": {
			"proxy": {
			  "self": true,
			  "ssl": true
			}
   	    },
		"defaults": {
			"urlInternal": "http://192.168.1.1:8080",
			"url": "http://example.com"
		},
		"services": {
			"pydio.grpc.data.sync": {
			  "sources": "[\"mnt\",\"pydiods1\",\"personal\",\"cellsdata\",\"updated:1589793099\"]"
			}
		},
		"version": "2.1.0"
	}`)

	Convey("Testing initial upgrade of config", t, func() {

		// Create new config
		conf := configx.New(configx.WithJSON())
		conf.Set(data)

		target, _ := version.NewVersion("2.2.0")
		b, err := UpgradeConfigsIfRequired(conf, target)
		So(b, ShouldBeTrue)
		So(err, ShouldBeNil)

		PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)
	})

}
