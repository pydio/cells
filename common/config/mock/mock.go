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

package mock

import (
	"context"
	"fmt"
	"sync"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var json = `{
  "databases": {
    "adf1c786de879af52b30b1397b06ab66812a1269": {
      "driver": "mysql",
      "dsn": "pydio:cells@tcp(localhost:3306)/cells?parseTime=true"
    },
    "pydio.grpc.activity": {
      "driver": "boltdb",
      "dsn": "/home/user/.config/pydio/cells/services/pydio.grpc.activity/activities.db"
    },
    "pydio.grpc.chat": {
      "driver": "boltdb",
      "dsn": "/home/user/.config/pydio/cells/services/pydio.grpc.chat/chat.db"
    },
    "pydio.grpc.docstore": {
      "driver": "boltdb",
      "dsn": "/home/user/.config/pydio/cells/services/pydio.grpc.docstore/docstore.db"
    },
    "pydio.grpc.versions": {
      "driver": "boltdb",
      "dsn": "/home/user/.config/pydio/cells/services/pydio.grpc.versions/versions.db"
    }
  },
  "defaults": {
    "database": {
      "$ref": "#/databases/adf1c786de879af52b30b1397b06ab66812a1269"
    },
    "datasource": "pydiods1",
    "personalTokens": {
      "secureKey": "MXdD8+cvroEupov0fAd9IcznBjdJDVsstAtX50p7bsU="
    },
    "sites": [
      {
        "Binds": [
          "local.pydio:8080"
        ],
        "TLSConfig": {
          "SelfSigned": {}
        }
      }
    ],
    "update": {
      "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBCgKCAQEAwh/ofjZTITlQc4h/qDZMR3RquBxlG7UTunDKLG85JQwRtU7EL90v\nlWxamkpSQsaPeqho5Q6OGkhJvZkbWsLBJv6LZg+SBhk6ZSPxihD+Kfx8AwCcWZ46\nDTpKpw+mYnkNH1YEAedaSfJM8d1fyU1YZ+WM3P/j1wTnUGRgebK9y70dqZEo2dOK\nn98v3kBP7uEN9eP/wig63RdmChjCpPb5gK1/WKnY4NFLQ60rPAOBsXurxikc9N/3\nEvbIB/1vQNqm7yEwXk8LlOC6Fp8W/6A0DIxr2BnZAJntMuH2ulUfhJgw0yJalMNF\nDR0QNzGVktdLOEeSe8BSrASe9uZY2SDbTwIDAQAB\n-----END PUBLIC KEY-----",
      "updateUrl": "https://updatecells.pydio.com/"
    }
  },
  "frontend": {
    "plugin": {
      "core.pydio": {
        "APPLICATION_TITLE": "A Vanila Setup",
        "DEFAULT_LANGUAGE": "en-us"
      },
      "editor.libreoffice": {
        "LIBREOFFICE_HOST": "localhost",
        "LIBREOFFICE_PORT": "9980",
        "LIBREOFFICE_SSL": true
      }
    },
    "secureHeaders": {
      "X-XSS-Protection": "1; mode=block"
    },
    "session": {
      "secureKey": "xb8XpcifP0m8S2FhadUasgWq9xnhRE24hoZ6EwRc8FCFJNa8sbAy/J6f00nW5dCPCm6ZVAnQTldh/IS0LFCaHQ=="
    },
    "versionSeed": "4c58bd85-504a-457d-a8e7-5d5c607f178c"
  },
  "ports": {
    "nats": 4222
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
        "cellsdata",
        "versions",
        "thumbnails"
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
    "pydio.grpc.data.index.thumbnails": {
      "dsn": "default",
      "tables": {
        "commits": "data_thumbnails_commits",
        "nodes": "data_thumbnails_nodes",
        "tree": "data_thumbnails_tree"
      }
    },
    "pydio.grpc.data.index.versions": {
      "dsn": "default",
      "tables": {
        "commits": "data_versions_commits",
        "nodes": "data_versions_nodes",
        "tree": "data_versions_tree"
      }
    },
    "pydio.grpc.data.objects": {
      "sources": [
        "local1"
      ]
    },
    "pydio.grpc.data.objects.local1": {
      "ApiKey": "qdambpVlABRTHyl5",
      "ApiSecret": "f00de219-1834-4787-a722-9cb75d11ee17",
      "LocalFolder": "/home/user/.config/pydio/cells/data",
      "Name": "local1",
      "RunningPort": 55417
    },
    "pydio.grpc.data.sync": {
      "sources": [
        "pydiods1",
        "personal",
        "cellsdata",
        "versions",
        "thumbnails"
      ]
    },
    "pydio.grpc.data.sync.cellsdata": {
      "ApiKey": "qdambpVlABRTHyl5",
      "ApiSecret": "f00de219-1834-4787-a722-9cb75d11ee17",
      "FlatStorage": true,
      "Name": "cellsdata",
      "ObjectsBucket": "cellsdata",
      "ObjectsPort": 55417,
      "ObjectsServiceName": "local1",
      "StorageConfiguration": {
        "folder": "/home/user/.config/pydio/cells/data/cellsdata",
        "normalize": "true"
      }
    },
    "pydio.grpc.data.sync.personal": {
      "ApiKey": "qdambpVlABRTHyl5",
      "ApiSecret": "f00de219-1834-4787-a722-9cb75d11ee17",
      "FlatStorage": true,
      "Name": "personal",
      "ObjectsBucket": "personal",
      "ObjectsPort": 55417,
      "ObjectsServiceName": "local1",
      "StorageConfiguration": {
        "folder": "/home/user/.config/pydio/cells/data/personal",
        "normalize": "true"
      }
    },
    "pydio.grpc.data.sync.pydiods1": {
      "ApiKey": "qdambpVlABRTHyl5",
      "ApiSecret": "f00de219-1834-4787-a722-9cb75d11ee17",
      "FlatStorage": true,
      "Name": "pydiods1",
      "ObjectsBucket": "pydiods1",
      "ObjectsPort": 55417,
      "ObjectsServiceName": "local1",
      "StorageConfiguration": {
        "folder": "/home/user/.config/pydio/cells/data/pydiods1",
        "normalize": "true"
      }
    },
    "pydio.grpc.data.sync.thumbnails": {
      "ApiKey": "qdambpVlABRTHyl5",
      "ApiSecret": "f00de219-1834-4787-a722-9cb75d11ee17",
      "FlatStorage": true,
      "Name": "thumbnails",
      "ObjectsBucket": "thumbs",
      "ObjectsPort": 55417,
      "ObjectsServiceName": "local1",
      "StorageConfiguration": {
        "cellsInternal": "true",
        "folder": "/home/user/.config/pydio/cells/data/thumbs",
        "normalize": "true"
      }
    },
    "pydio.grpc.data.sync.versions": {
      "ApiKey": "qdambpVlABRTHyl5",
      "ApiSecret": "f00de219-1834-4787-a722-9cb75d11ee17",
      "FlatStorage": true,
      "Name": "versions",
      "ObjectsBucket": "versions",
      "ObjectsPort": 55417,
      "ObjectsServiceName": "local1",
      "StorageConfiguration": {
        "cellsInternal": "true",
        "folder": "/home/user/.config/pydio/cells/data/versions",
        "normalize": "true"
      }
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
      "datasource": "thumbnails"
    },
    "pydio.versions-store": {
      "bucket": "versions",
      "datasource": "versions"
    },
    "pydio.web.oauth": {
      "connectors": [
        {
          "id": "pydio",
          "name": "Pydio Cells",
          "type": "pydio"
        }
      ],
      "cors": {
        "public": {
          "allowedOrigins": "*"
        }
      },
      "insecureRedirects": [
        "#insecure_binds...#/auth/callback"
      ],
      "secret": "vbM9vRkjJsUtm0C.WryJl_c-eFAYYQCC",
      "staticClients": [
        {
          "client_id": "cells-frontend",
          "client_name": "CellsFrontend Application",
          "grant_types": [
            "authorization_code",
            "refresh_token"
          ],
          "post_logout_redirect_uris": [
            "#default_bind#/auth/logout"
          ],
          "redirect_uris": [
            "#default_bind#/auth/callback"
          ],
          "response_types": [
            "code",
            "token",
            "id_token"
          ],
          "revokeRefreshTokenAfterInactivity": "2h",
          "scope": "openid email profile pydio offline"
        },
        {
          "client_id": "cells-sync",
          "client_name": "CellsSync Application",
          "grant_types": [
            "authorization_code",
            "refresh_token"
          ],
          "redirect_uris": [
            "http://localhost:3000/servers/callback",
            "http://localhost:[3636-3666]/servers/callback"
          ],
          "response_types": [
            "code",
            "token",
            "id_token"
          ],
          "scope": "openid email profile pydio offline"
        },
        {
          "client_id": "cells-client",
          "client_name": "Cells Client CLI Tool",
          "grant_types": [
            "authorization_code",
            "refresh_token"
          ],
          "redirect_uris": [
            "http://localhost:3000/servers/callback",
            "#binds...#/oauth2/oob"
          ],
          "response_types": [
            "code",
            "token",
            "id_token"
          ],
          "scope": "openid email profile pydio offline"
        },
        {
          "client_id": "cells-mobile",
          "client_name": "Mobile Applications",
          "grant_types": [
            "authorization_code",
            "refresh_token"
          ],
          "redirect_uris": [
            "cellsauth://callback"
          ],
          "response_types": [
            "code",
            "token",
            "id_token"
          ],
          "scope": "openid email profile pydio offline"
        }
      ]
    }
  },
  "version": "4.0.0-dev"
}`

type MockStore struct {
	configx.Values
}

func (m *MockStore) As(out any) bool {
	return false
}

func (m *MockStore) Close(ctx context.Context) error {
	return nil
}

func (m *MockStore) Done() <-chan struct{} {
	return nil
}

func (m *MockStore) Lock() {
	// noop
}

func (m *MockStore) Unlock() {
	// noop
}

func (m *MockStore) NewLocker(name string) sync.Locker {
	return nil
}

func (m *MockStore) Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	return &Receiver{stop: make(chan struct{}, 1)}, nil
}

func (m *MockStore) Save(s string, s2 string) error {
	return nil
}

type Receiver struct {
	stop chan struct{}
}

func (r *Receiver) Next() (interface{}, error) {
	<-r.stop
	return nil, fmt.Errorf("watcher closed")
}

func (r *Receiver) Stop() {
	close(r.stop)
}

func RegisterMockConfig(ctx context.Context) (context.Context, error) {
	cfg := configx.New(configx.WithJSON())
	er := cfg.Set([]byte(json))
	if er != nil {
		return ctx, er
	}
	store := &MockStore{Values: cfg}
	ctx = propagator.With(ctx, config.ContextKey, store)
	return ctx, nil
}
