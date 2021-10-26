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

package cmd

import (
	"fmt"
	"testing"

	"github.com/hashicorp/go-version"

	microconfig "github.com/pydio/go-os/config"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/common/config/micro/memory"
	"github.com/pydio/cells/common/config/migrations"
	"github.com/pydio/cells/x/filex"
)

func TestConfigUpgrade(t *testing.T) {
	data := []byte(`
	{
		"cert": {
		  "proxy": {
			"caUrl": "https://acme-v02.api.letsencrypt.org/directory",
			"email": "test@pydio.com",
			"httpRedir": true,
			"ssl": true
		  }
		},
		"databases": {
		  "f5eda2bacd38959a7b8533687cb063ad9677dd0b": {
			"driver": "mysql",
			"dsn": "root:root@tcp(localhost:3306)/cells200?parseTime=true"
		  },
		  "pydio.grpc.activity": {
			"driver": "boltdb",
			"dsn": "/home/pydio/.config/pydio/cells/services/pydio.grpc.activity/activities.db"
		  },
		  "pydio.grpc.chat": {
			"driver": "boltdb",
			"dsn": "/home/pydio/.config/pydio/cells/services/pydio.grpc.chat/chat.db"
		  }
		},
		"defaults": {
		  "database": "f5eda2bacd38959a7b8533687cb063ad9677dd0b",
		  "datasource": "pydiods1",
		  "url": "https://example.com",
		  "urlInternal": "https://example.com:443"
		},
		"frontend": {
		  "plugin": {
			"core.pydio": {
			  "APPLICATION_TITLE": "Pydio Cells",
			  "DEFAULT_LANGUAGE": "en"
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
			"secureKey": "my-secure-key"
		  },
		  "versionSeed": "39a06559-0a37-42ab-9555-73cd9b9d7583"
		},
		"ports": {
		  "nats": 4222,
		  "pydio.gateway.rest": 39657
		},
		"services": {
		  "pydio.docstore-binaries": {
			"bucket": "binaries",
			"datasource": "default"
		  },
		  "pydio.grpc.acl": {
			"dsn": "default"
		  },
		  "pydio.grpc.auth": {
			"dex": {
			  "connectors": [
				{
				  "config": {
					"pydioconnectors": [
					  {
						"id": 1,
						"name": "pydioapi",
						"type": "pydio-api"
					  }
					]
				  },
				  "id": "pydio",
				  "name": "Pydio Aggregation Connector",
				  "type": "pydio"
				},
				{
				  "config": {
					"clientID": "my-id.apps.googleusercontent.com",
					"clientSecret": "my-secret",
					"issuer": "https://accounts.google.com",
					"redirectURI": "https://example.com/auth/dex/callback"
				  },
				  "id": "google",
				  "name": "google",
				  "type": "oidc"
				}
			  ],
			  "expiry": {
				"idTokens": "10m"
			  },
			  "frontend": {
				"Dir": "idm/auth/web"
			  },
			  "issuer": "https://example.com/auth/dex",
			  "logger": {
				"format": "text",
				"level": "debug"
			  },
			  "oauth2": {
				"responseTypes": [
				  "code",
				  "token",
				  "id_token"
				],
				"skipApprovalScreen": true
			  },
			  "staticClients": [
				{
				  "Id": "cells-front",
				  "IdTokensExpiry": "10m",
				  "Name": "cells-front",
				  "OfflineSessionsSliding": true,
				  "RedirectURIs": [
					"https://example.com/login/callback"
				  ],
				  "RefreshTokensExpiry": "30m",
				  "Secret": "my-secret"
				}
			  ],
			  "web": {
				"http": "https://example.com/auth/dex"
			  }
			},
			"dsn": "default"
		  },
		  "pydio.grpc.changes": {
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
			"PeerAddress": "example.com",
			"dsn": "default",
			"tables": {
			  "commits": "data_cellsdata_commits",
			  "nodes": "data_cellsdata_nodes",
			  "tree": "data_cellsdata_tree"
			}
		  },
		  "pydio.grpc.data.index.personal": {
			"PeerAddress": "example.com",
			"dsn": "default",
			"tables": {
			  "commits": "data_personal_commits",
			  "nodes": "data_personal_nodes",
			  "tree": "data_personal_tree"
			}
		  },
		  "pydio.grpc.data.index.pydiods1": {
			"PeerAddress": "example.com",
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
			"ApiKey": "IHjMgaV7C9SMwsd7",
			"ApiSecret": "ABCYAJdJZDFhYYcHqTAuu9gT",
			"LocalFolder": "/home/pydio/.config/pydio/cells/data",
			"Name": "local1",
			"PeerAddress": "example.com",
			"RunningPort": 46603
		  },
		  "pydio.grpc.data.sync": {
			"sources": [
			  "pydiods1",
			  "personal",
			  "cellsdata"
			]
		  },
		  "pydio.grpc.data.sync.cellsdata": {
			"ApiKey": "IHjMgaV7C9SMwsd7",
			"ApiSecret": "ABCYAJdJZDFhYYcHqTAuu9gT",
			"Name": "cellsdata",
			"ObjectsBucket": "cellsdata",
			"ObjectsPort": 46603,
			"ObjectsServiceName": "local1",
			"PeerAddress": "example.com",
			"StorageConfiguration": {
			  "folder": "/home/pydio/.config/pydio/cells/data/cellsdata",
			  "normalize": "false"
			}
		  },
		  "pydio.grpc.data.sync.personal": {
			"ApiKey": "IHjMgaV7C9SMwsd7",
			"ApiSecret": "ABCYAJdJZDFhYYcHqTAuu9gT",
			"Name": "personal",
			"ObjectsBucket": "personal",
			"ObjectsPort": 46603,
			"ObjectsServiceName": "local1",
			"PeerAddress": "example.com",
			"StorageConfiguration": {
			  "folder": "/home/pydio/.config/pydio/cells/data/personal",
			  "normalize": "false"
			}
		  },
		  "pydio.grpc.data.sync.pydiods1": {
			"ApiKey": "IHjMgaV7C9SMwsd7",
			"ApiSecret": "ABCYAJdJZDFhYYcHqTAuu9gT",
			"Name": "pydiods1",
			"ObjectsBucket": "pydiods1",
			"ObjectsPort": 46603,
			"ObjectsServiceName": "local1",
			"PeerAddress": "example.com",
			"StorageConfiguration": {
			  "folder": "/home/pydio/.config/pydio/cells/data/pydiods1",
			  "normalize": "false"
			}
		  },
		  "pydio.grpc.mailer": {
			"queue": {
			  "@value": "boltdb"
			},
			"sender": {
			  "@value": "smtp",
			  "host": "my.smtp.server",
			  "password": "",
			  "port": 465,
			  "user": "name"
			},
			"valid": false
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
			"indexContent": false,
			"basenameAnalyzer": "standard",
			"contentAnalyzer": "en"
		  },
		  "pydio.grpc.tasks": {
			"fork": true
		  },
		  "pydio.grpc.tree": {
			"dsn": "default"
		  },
		  "pydio.grpc.update": {
			"channel": "dev",
			"publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBCgKCAQEAwh/ofjZTITlQc4h/qDZMR3RquBxlG7UTunDKLG85JQwRtU7EL90v\nlWxamkpSQsaPeqho5Q6OGkhJvZkbWsLBJv6LZg+SBhk6ZSPxihD+Kfx8AwCcWZ46\nDTpKpw+mYnkNH1YEAedaSfJM8d1fyU1YZ+WM3P/j1wTnUGRgebK9y70dqZEo2dOK\nn98v3kBP7uEN9eP/wig63RdmChjCpPb5gK1/WKnY4NFLQ60rPAOBsXurxikc9N/3\nEvbIB/1vQNqm7yEwXk8LlOC6Fp8W/6A0DIxr2BnZAJntMuH2ulUfhJgw0yJalMNF\nDR0QNzGVktdLOEeSe8BSrASe9uZY2SDbTwIDAQAB\n-----END PUBLIC KEY-----",
			"updateUrl": "https://updatecells.pydio.com/"
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
		  },
		  "pydio.web.oauth": {
			"cors": {
			  "public": {
				"allowedOrigins": "*"
			  }
			},
			"issuer": "https://example.com/oidc/",
			"secret": "my-secret",
			"staticClients": [
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
				  "https://example.com/oauth2/oob"
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
		}
	  }
	`)

	versionsStore := filex.NewStore("tmp/whatever")
	config.VersionsStore = versionsStore

	vaultConfig := config.New(
		micro.New(
			microconfig.NewConfig(
				microconfig.WithSource(
					memory.NewSource(memory.WithJSON(data)),
				),
			),
		),
	)

	_ = vaultConfig

	memorySource := memory.NewSource(memory.WithJSON(data))

	conf := config.New(micro.New(
		microconfig.NewConfig(
			microconfig.WithSource(
				memorySource,
			),
		),
	))

	conf = config.NewVersionStore(versionsStore, conf)
	conf = config.NewVault(vaultConfig, conf)

	val := conf.Val()

	// Need to do something for the versions
	target, _ := version.NewVersion("2.2.0")
	migrations.UpgradeConfigsIfRequired(val, target)

	conf.Save("test", "test")

	cs, _ := memorySource.Read()
	fmt.Println("New data IS ", string(cs.Data))

	// b, err := json.MarshalIndent(val, "", "   ")
	// fmt.Println(err)
	// fmt.Println("FINALLY ", string(b))
}
