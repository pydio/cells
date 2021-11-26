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

	config2 "github.com/pydio/cells/common/config"

	"github.com/pydio/cells/x/configx"

	. "github.com/smartystreets/goconvey/convey"
)

func TestUpdateVersionStore(t *testing.T) {
	Convey("Test update 2.2.99", t, func() {
		data = []byte(`{
  "defaults": {
    "database": {
      "$ref": "#/databases/bc1ffe07aa51180396883a100ca989df3e3430e8"
    },
    "datasource": "pydiods1",
    "update": {
      "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBCgKCAQEAwh/ofjZTITlQc4h/qDZMR3RquBxlG7UTunDKLG85JQwRtU7EL90v\nlWxamkpSQsaPeqho5Q6OGkhJvZkbWsLBJv6LZg+SBhk6ZSPxihD+Kfx8AwCcWZ46\nDTpKpw+mYnkNH1YEAedaSfJM8d1fyU1YZ+WM3P/j1wTnUGRgebK9y70dqZEo2dOK\nn98v3kBP7uEN9eP/wig63RdmChjCpPb5gK1/WKnY4NFLQ60rPAOBsXurxikc9N/3\nEvbIB/1vQNqm7yEwXk8LlOC6Fp8W/6A0DIxr2BnZAJntMuH2ulUfhJgw0yJalMNF\nDR0QNzGVktdLOEeSe8BSrASe9uZY2SDbTwIDAQAB\n-----END PUBLIC KEY-----",
      "updateUrl": "https://updatecells.pydio.com/"
    }
  },
  "services": {
    "pydio.docstore-binaries": {
      "bucket": "binaries",
      "datasource": "default"
    },
    "pydio.grpc.acl": {
      "dsn": "default"
    },
    "pydio.grpc.config": {
      "dsn": "default"
    },
    "pydio.grpc.data-key": {
      "dsn": "default"
    },
    "pydio.grpc.data.index": {
      "sources": [
        "pydiods1",
        "personal",
        "cellsdata"
      ]
    },
    "pydio.grpc.data.index.cellsdata": {
      "dsn": "default",
      "tables": {
        "commits": "data_cellsdata_commits",
        "nodes": "data_cellsdata_nodes",
        "tree": "data_cellsdata_tree"
      }
    },
    "pydio.grpc.data.index.personal": {
      "dsn": "default",
      "tables": {
        "commits": "data_personal_commits",
        "nodes": "data_personal_nodes",
        "tree": "data_personal_tree"
      }
    },
    "pydio.grpc.data.index.pydiods1": {
      "dsn": "default",
      "tables": {
        "commits": "data_pydiods1_commits",
        "nodes": "data_pydiods1_nodes",
        "tree": "data_pydiods1_tree"
      }
    },
    "pydio.grpc.data.objects": {
      "sources": [
        "local1"
      ]
    },
    "pydio.grpc.data.objects.local1": {
      "ApiKey": "ac3AvS73Bi6LQgXZ",
      "ApiSecret": "51e30e5c-a0e7-4fb8-abe7-3c38b804717a",
      "LocalFolder": "/local",
      "Name": "local1",
      "RunningPort": 62394
    },
    "pydio.grpc.data.sync": {
      "sources": [
        "pydiods1",
        "personal",
        "cellsdata"
      ]
    },
    "pydio.grpc.data.sync.cellsdata": {
      "ApiKey": "ac3AvS73Bi6LQgXZ",
      "ApiSecret": "51e30e5c-a0e7-4fb8-abe7-3c38b804717a",
      "FlatStorage": true,
      "Name": "cellsdata",
      "ObjectsBucket": "cellsdata",
      "ObjectsPort": 62394,
      "ObjectsServiceName": "local1",
      "StorageConfiguration": {
        "folder": "/Users/charles/Library/Application Support/Pydio/cells/data/cellsdata",
        "normalize": "true"
      }
    },
    "pydio.grpc.data.sync.personal": {
      "ApiKey": "ac3AvS73Bi6LQgXZ",
      "ApiSecret": "51e30e5c-a0e7-4fb8-abe7-3c38b804717a",
      "FlatStorage": true,
      "Name": "personal",
      "ObjectsBucket": "personal",
      "ObjectsPort": 62394,
      "ObjectsServiceName": "local1",
      "StorageConfiguration": {
        "folder": "/Users/charles/Library/Application Support/Pydio/cells/data/personal",
        "normalize": "true"
      }
    },
    "pydio.grpc.data.sync.pydiods1": {
      "ApiKey": "ac3AvS73Bi6LQgXZ",
      "ApiSecret": "51e30e5c-a0e7-4fb8-abe7-3c38b804717a",
      "FlatStorage": true,
      "Name": "pydiods1",
      "ObjectsBucket": "pydiods1",
      "ObjectsPort": 62394,
      "ObjectsServiceName": "local1"
    },
    "pydio.grpc.mailer": {
      "queue": {
        "@value": "boltdb"
      },
      "sender": {
        "@value": "disabled"
      }
    },
    "pydio.grpc.meta": {
      "dsn": "default"
    },
    "pydio.grpc.policy": {
      "dsn": "databaseParseTime"
    },
    "pydio.grpc.role": {
      "dsn": "default"
    },
    "pydio.grpc.search": {
      "basenameAnalyzer": "standard",
      "contentAnalyzer": "en",
      "indexContent": false
    },
    "pydio.grpc.tasks": {
      "fork": true
    },
    "pydio.grpc.tree": {
      "dsn": "default"
    },
    "pydio.grpc.update": {
      "channel": "stable"
    },
    "pydio.grpc.user": {
      "dsn": "default",
      "tables": {
        "attributes": "idm_user_attributes",
        "nodes": "idm_user_nodes",
        "roles": "idm_user_roles",
        "tree": "idm_user_tree"
      }
    },
    "pydio.grpc.user-key": {
      "dsn": "default"
    },
    "pydio.grpc.user-meta": {
      "dsn": "default"
    },
    "pydio.grpc.workspace": {
      "dsn": "default"
    },
    "pydio.thumbs_store": {
      "bucket": "thumbs",
      "datasource": "default"
    },
    "pydio.versions-store": {
      "bucket": "versions",
      "datasource": "default"
    }
  },
  "version": "2.2.12"
}
`)
		conf := configx.New(configx.WithJSON())
		er := conf.Set(data)
		So(er, ShouldBeNil)
		config2.Set(conf.Get())

		e := updateVersionsStore(conf)
		So(e, ShouldBeNil)

		e = updateThumbsStore(conf)
		So(e, ShouldBeNil)

	})
}
