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
	"github.com/hashicorp/go-version"
	"github.com/pydio/cells/v4/common/utils/configx"
	. "github.com/smartystreets/goconvey/convey"
	"testing"
)

func TestMigration401(t *testing.T) {
	tData := []byte(`{
		"services": {
			"pydio.grpc.data.objects": {
			  "sources": [
				"gateway2",
				"local1",
				"local2",
				"local3",
				"local4",
				"gateway1",
				"updated:1668512540"
			  ]
			},			
			"pydio.grpc.data.objects.gateway1": {
			  "ApiKey": "004d4aaf216b8660000000001",
			  "ApiSecret": "de04dad2-7b94-4f2d-8f0d-6757b7c0a617",
			  "EndpointUrl": "https://s3.us-west-004.backblazeb2.com",
			  "GatewayConfiguration": {
				"signatureVersion": "v4"
			  },
			  "Name": "gateway1",
			  "RunningPort": 9001,
			  "StorageType": 1
			},
			"pydio.grpc.data.objects.gateway2": {
			  "ApiKey": "AKIAYRTINZJCCKSFV243",
			  "ApiSecret": "da088b20-fdd9-4600-9029-aaa8775b02d7",
			  "Name": "gateway2",
			  "RunningPort": 9002,
			  "StorageType": 1
			},
			"pydio.grpc.data.objects.local1": {
			  "ApiKey": "RtbKjn5uBgZUfStB",
			  "ApiSecret": "9967efe5-d994-42d9-b572-49421fe266c6",
			  "LocalFolder": "/Users/charles/Library/Application Support/Pydio/cells/data",
			  "Name": "local1",
			  "RunningPort": 62002
			},
			"pydio.grpc.data.objects.local2": {
			  "ApiKey": "RtbKjn5uBgZUfStB",
			  "ApiSecret": "9967efe5-d994-42d9-b572-49421fe266c6",
			  "LocalFolder": "/Users/charles/Library/Application Support/Pydio/cells/data",
			  "Name": "local2",
			  "PeerAddress": "127.0.0.1",
			  "RunningPort": 62002
			},
			"pydio.grpc.data.objects.local3": {
			  "ApiKey": "RtbKjn5uBgZUfStB",
			  "ApiSecret": "9967efe5-d994-42d9-b572-49421fe266c6",
			  "LocalFolder": "/Users/charles/Library/Application Support/Pydio/cells/other",
			  "Name": "local3",
			  "RunningPort": 62002
			},
			"pydio.grpc.data.objects.local4": {
			  "ApiKey": "RtbKjn5uBgZUfStB",
			  "ApiSecret": "9967efe5-d994-42d9-b572-49421fe266c6",
			  "LocalFolder": "/Users/charles/Library/Application Support/Pydio/cells/other",
			  "Name": "local4",
			  "PeerAddress": "127.0.0.1",
			  "RunningPort": 62002
			}
   	    },
		"version": "3.0.10"
	}`)

	Convey("Testing 401 upgrade of config", t, func() {

		// Create new config
		conf := configx.New(configx.WithJSON())
		_ = conf.Set(tData)

		target, _ := version.NewVersion("4.0.5")
		b, err := UpgradeConfigsIfRequired(conf, target)
		So(b, ShouldBeTrue)
		So(err, ShouldBeNil)

		PrettyPrint(conf.Map())
		So(conf, ShouldNotBeNil)
	})

	/*
		Convey("Testing 401 upgrade with empty conf", t, func() {

			// Create new config
			conf := configx.New(configx.WithJSON())
			_ = conf.Set(data)

			target, _ := version.NewVersion("4.0.5")
			b, err := UpgradeConfigsIfRequired(conf, target)
			So(b, ShouldBeTrue)
			So(err, ShouldBeNil)

			PrettyPrint(conf.Map())
			So(conf, ShouldNotBeNil)
		})
	*/

}
