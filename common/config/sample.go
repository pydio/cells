/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

import "github.com/pydio/cells/common"

var SampleConfig = `{
    "ports":{
        "nats": 4222
    },
    "frontend":{
        "secureHeaders":{
			"X-XSS-Protection": "1; mode=block"
		},
        "plugin": {
            "editor.libreoffice": {
                "LIBREOFFICE_HOST": "localhost",
                "LIBREOFFICE_PORT": "9980",
                "LIBREOFFICE_SSL": true
            }
        }
    },
    "services":{
        "pydio.grpc.config":{
            "dsn": "default"
        },
        "pydio.grpc.user":{
            "dsn": "default",
            "tables":{
                "tree": "idm_user_tree",
                "nodes":"idm_user_nodes",
                "roles":"idm_user_roles",
                "attributes":"idm_user_attributes"
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
			}
		},
        "pydio.grpc.role":{
            "dsn": "default"
        },
        "pydio.grpc.workspace":{
            "dsn": "default"
        },
        "pydio.grpc.acl":{
            "dsn": "default"
        },
        "pydio.grpc.auth":{
            "dsn": "default",
            "dex" : {
                "issuer": "http://127.0.0.1:5556/dex",
                "web"   : {
                    "http": "0.0.0.0:5556"
                },
                "frontend" : {
                    "Dir" : "idm/auth/web"
                },
                "logger" : {
                    "level" : "debug",
                    "format": "text"
                },
				"expiry": {
					"idTokens": "10m"
				},
                "oauth2" : {
                    "responseTypes": ["code", "token", "id_token"],
					"skipApprovalScreen": true
                },
                "staticClients" : [
                    {
                        "id": "example-app",
                        "redirectURIs" : ["http://127.0.0.1:5555/callback"],
                        "name" : "Example App",
                        "secret" : "ZXhhbXBsZS1hcHAtc2VjcmV0"
                    }
                ],
                "connectors": [
                    {
                        "type": "pydio",
                        "id"  : "pydio",
                        "name": "Pydio Aggregation Connector",
                        "config": {
                            "pydioconnectors": [
                                {
                                    "type": "pydio-api",
                                    "name": "pydioapi",
                                    "id"  : 1
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "pydio.grpc.tree":{
            "dsn":"default"
        },
        "pydio.grpc.meta":{
            "dsn":"default"
        },
        "pydio.thumbs_store":{
            "datasource" : "default",
            "bucket"     : "thumbs"
        },
        "pydio.docstore-binaries":{
            "datasource" : "default",
            "bucket"     : "binaries"
        },
        "pydio.versions-store":{
            "datasource" : "default",
            "bucket"     : "versions"
        },
        "pydio.grpc.search": {
            "indexContent": false
        },
		"pydio.grpc.policy": {
			"dsn": "databaseParseTime"
		},
        "pydio.grpc.data-key": {
            "dsn": "default"
        },
        "pydio.grpc.user-key": {
            "dsn": "default"
        },
        "pydio.grpc.changes": {
            "dsn": "default"
        },
		"pydio.grpc.update" : {
			"channel": "` + common.UpdateDefaultChannel + `",
			"publicKey": "` + common.UpdateDefaultPublicKey + `",
			"updateUrl": "` + common.UpdateDefaultServerUrl + `"
		},
		"pydio.grpc.user-meta": {
			"dsn": "default"
		},
        "pydio.grpc.tasks": {
            "fork": true
        },
		"pydio.web.oauth":{
			"cors": {
				"public": {
					"allowedOrigins": "*"
				}
			},
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
					"response_types": ["code", "token", "id_token"],
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
						"http://EXTERNAL_HOST/oauth2/oob"
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
}`
