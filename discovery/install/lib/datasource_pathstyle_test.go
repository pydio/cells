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

package lib

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/install"
	"github.com/pydio/cells/v5/common/proto/object"
)

func TestAddDatasourceS3PathStyle(t *testing.T) {

	Convey("Testing addDatasourceS3 path_style settings", t, func() {

		Convey("Custom endpoint should enable path_style and force_path_style", func() {
			c := &install.InstallConfig{
				DsS3ApiKey:    "mykey",
				DsS3ApiSecret: "mysecret",
				DsS3Custom:    "http://ceph.example.com:7480",
			}
			ds, err := addDatasourceS3(c)
			So(err, ShouldBeNil)
			So(ds, ShouldNotBeNil)
			So(ds.StorageConfiguration[object.StorageKeyPathStyle], ShouldEqual, "true")
			So(ds.StorageConfiguration[object.StorageKeyForcePathStyle], ShouldEqual, "true")
		})

		Convey("No custom endpoint should not set path_style or force_path_style", func() {
			c := &install.InstallConfig{
				DsS3ApiKey:    "mykey",
				DsS3ApiSecret: "mysecret",
				DsS3Custom:    "",
			}
			ds, err := addDatasourceS3(c)
			So(err, ShouldBeNil)
			So(ds, ShouldNotBeNil)
			_, hasPs := ds.StorageConfiguration[object.StorageKeyPathStyle]
			_, hasFps := ds.StorageConfiguration[object.StorageKeyForcePathStyle]
			So(hasPs, ShouldBeFalse)
			So(hasFps, ShouldBeFalse)
		})

		Convey("Custom endpoint with region should propagate region", func() {
			c := &install.InstallConfig{
				DsS3ApiKey:       "mykey",
				DsS3ApiSecret:    "mysecret",
				DsS3Custom:       "http://ceph.example.com:7480",
				DsS3CustomRegion: "us-east-1",
			}
			ds, err := addDatasourceS3(c)
			So(err, ShouldBeNil)
			So(ds.StorageConfiguration[object.StorageKeyCustomRegion], ShouldEqual, "us-east-1")
		})
	})
}
