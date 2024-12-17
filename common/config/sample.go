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
	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/runtime"
)

// SampleConfig is the default config used during the first install
var SampleConfig = `{
	"version": "` + common.Version().String() + `",
	"defaults": {
		"update": {
			"publicKey": "` + common.UpdateDefaultPublicKey + `",
			"updateUrl": "` + common.UpdateDefaultServerUrl + `"
		},
		"sites": [
		  {
			"Binds": [
			  "0.0.0.0:8080"
			],
			"Routing": [
			  {
				"Effect": 1,
				"Matcher": "*"
			  }
			],
			"TLSConfig": {
			  "SelfSigned": {}
			}
		  }
		],
        "telemetry": {
		  "loggers": [
			{
			  "encoding": "console",
			  "level": "info",
			  "outputs": [
				"stdout:///"
			  ]
			},
			{
			  "encoding": "json",
			  "level": "info",
			  "outputs": [
				"file://` + runtime.ApplicationWorkingDir(runtime.ApplicationDirLogs) + `/pydio.log",
				"service:///?service=pydio.grpc.log"
			  ]
			}
		  ],
		  "metrics": {
			"readers": []
		  },
		  "otelService": {
			"attributes": {
			  "deployment": "local"
			},
			"name": "cells"
		  },
		  "profiling": {
			"publishers": [
			  "pull://"
			]
		  },
		  "tracing": {
			"outputs": []
		  }
		}
	}
}`

//"frontend":{
//"$ref": "rp#/frontend"
//},
//"services":{
//"$ref": "rp#/services"
//},
//"versions": {
//"$ref": "rp#/versions"
//}
