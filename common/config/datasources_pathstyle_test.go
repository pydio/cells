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
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/object"
)

func TestFactorizeMinioServersPathStyle(t *testing.T) {

	Convey("Testing FactorizeMinioServers path_style propagation", t, func() {

		Convey("New S3 config with path_style should store it in GatewayConfiguration", func() {
			newSource := &object.DataSource{
				Name:        "test",
				StorageType: object.StorageType_S3,
				ApiKey:      "mykey",
				ApiSecret:   "mysecret",
				StorageConfiguration: map[string]string{
					object.StorageKeyCustomEndpoint: "http://ceph.example.com:7480",
					object.StorageKeyPathStyle:      "true",
					object.StorageKeyForcePathStyle: "true",
				},
			}
			cfg, err := FactorizeMinioServers(context.Background(), map[string]*object.MinioConfig{}, newSource, false)
			So(err, ShouldBeNil)
			So(cfg, ShouldNotBeNil)
			So(cfg.GatewayConfiguration, ShouldNotBeNil)
			So(cfg.GatewayConfiguration[object.StorageKeyPathStyle], ShouldEqual, "true")
			So(cfg.GatewayConfiguration[object.StorageKeyForcePathStyle], ShouldEqual, "true")
		})

		Convey("New S3 config without path_style should not set GatewayConfiguration keys", func() {
			newSource := &object.DataSource{
				Name:        "test",
				StorageType: object.StorageType_S3,
				ApiKey:      "mykey",
				ApiSecret:   "mysecret",
				StorageConfiguration: map[string]string{
					object.StorageKeyCustomEndpoint: "http://s3.amazonaws.com",
				},
			}
			cfg, err := FactorizeMinioServers(context.Background(), map[string]*object.MinioConfig{}, newSource, false)
			So(err, ShouldBeNil)
			So(cfg, ShouldNotBeNil)
			// GatewayConfiguration should be nil or not contain path_style keys
			if cfg.GatewayConfiguration != nil {
				_, hasPs := cfg.GatewayConfiguration[object.StorageKeyPathStyle]
				_, hasFps := cfg.GatewayConfiguration[object.StorageKeyForcePathStyle]
				So(hasPs, ShouldBeFalse)
				So(hasFps, ShouldBeFalse)
			}
		})

		Convey("Update S3 config with existing gateway should propagate path_style", func() {
			existingName := "pydio-s3"
			existing := map[string]*object.MinioConfig{
				existingName: {
					Name:        existingName,
					StorageType: object.StorageType_S3,
					ApiKey:      "mykey",
					ApiSecret:   "mysecret",
				},
			}
			newSource := &object.DataSource{
				Name:                 "test",
				ObjectsServiceName:   existingName,
				StorageType:          object.StorageType_S3,
				ApiKey:               "mykey",
				ApiSecret:            "newsecret",
				StorageConfiguration: map[string]string{
					object.StorageKeyPathStyle:      "true",
					object.StorageKeyForcePathStyle: "true",
				},
			}
			cfg, err := FactorizeMinioServers(context.Background(), existing, newSource, true)
			So(err, ShouldBeNil)
			So(cfg, ShouldNotBeNil)
			So(cfg.GatewayConfiguration, ShouldNotBeNil)
			So(cfg.GatewayConfiguration[object.StorageKeyPathStyle], ShouldEqual, "true")
			So(cfg.GatewayConfiguration[object.StorageKeyForcePathStyle], ShouldEqual, "true")
		})

		Convey("AZURE storage type should not receive path_style in GatewayConfiguration", func() {
			newSource := &object.DataSource{
				Name:        "test-azure",
				StorageType: object.StorageType_AZURE,
				ApiKey:      "azurekey",
				ApiSecret:   "azuresecret",
				StorageConfiguration: map[string]string{
					object.StorageKeyPathStyle: "true",
				},
			}
			cfg, err := FactorizeMinioServers(context.Background(), map[string]*object.MinioConfig{}, newSource, false)
			So(err, ShouldBeNil)
			So(cfg, ShouldNotBeNil)
			// AZURE branch does not handle path_style
			if cfg.GatewayConfiguration != nil {
				_, hasPs := cfg.GatewayConfiguration[object.StorageKeyPathStyle]
				So(hasPs, ShouldBeFalse)
			}
		})
	})
}
