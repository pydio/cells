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

	"github.com/pydio/cells/v5/common"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

// SaveNewFromSample parses Json default sample and save it to context config
func SaveNewFromSample(ctx context.Context) error {
	var data interface{}
	if err := json.Unmarshal([]byte(SampleConfig), &data); err != nil {
		return err
	}
	if err := Set(ctx, data); err == nil {
		return Save(ctx, common.PydioSystemUsername, "Initialize with sample config")
	} else {
		return err
	}
}

// SampleConfig is the default config used during the first install
var SampleConfig = `{
	"version": "` + common.Version().String() + `",
	"defaults": {
		"update": {
			"publicKey": "` + common.UpdateDefaultPublicKey + `",
			"updateUrl": "` + common.UpdateDefaultServerUrl + `"
		},
		"layout": {
			"templates":[
				{"Uuid":"my-files","Path":"my-files","Type":2,"MetaStore":{"name":"my-files", "onDelete":"rename-uuid","resolution":"\/\/ Default node used for storing personal users data in separate folders. \n\/\/ Use Ctrl+Space to see the objects available for completion.\nSplitMode = true; DataSourceName = DataSources.personal; DataSourcePath = User.Name;","contentType":"text\/javascript"}},
				{"Uuid":"cells","Path":"cells","Type":2,"MetaStore":{"name":"cells","resolution":"\/\/ Default node used as parent for creating empty cells. \n\/\/ Use Ctrl+Space to see the objects available for completion.\nSplitMode = true; DataSourceName = DataSources.cellsdata; DataSourcePath = User.Name;","contentType":"text\/javascript"}}
			],
			"workspaces":[
				{"Label": "Personal Files", "Description": "User personal files", "Slug": "personal-files", "RootUUIDs": ["my-files"], "Attributes":"{\"DEFAULT_RIGHTS\":\"rw\"}"},
				{"Label": "Common Files", "Description": "Data shared by all users", "Slug": "common-files", "RootUUIDs": ["DATASOURCE:pydiods1"], "Attributes":"{\"DEFAULT_RIGHTS\":\"rw\"}"}
			]
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
