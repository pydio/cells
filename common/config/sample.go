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

import "github.com/pydio/cells/v4/common"

// SampleConfig is the default config used during the first install
var SampleConfig = `{
	"version": "` + common.Version().String() + `",
	"defaults": {
		"update": {
			"publicKey": "` + common.UpdateDefaultPublicKey + `",
			"updateUrl": "` + common.UpdateDefaultServerUrl + `"
		}
	},
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
				"@value": "disabled"
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
            "indexContent": false,
			"basenameAnalyzer": "standard",
			"contentAnalyzer": "en"
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
		"pydio.grpc.update" : {
			"channel": "` + common.UpdateDefaultChannel + `"
		},
		"pydio.grpc.user-meta": {
			"dsn": "default"
		},
        "pydio.grpc.tasks": {
            "fork": true
        },
		"pydio.web.oauth":{
			"connectors": [
				{
					"type": "pydio",
					"id"  : "pydio",
					"name": "Pydio Cells"
				}
			],
			"cors": {
				"public": {
					"allowedOrigins": "*"
				}
			},
			"staticClients": [
                {
					"client_id": "` + DefaultOAuthClientID + `",
					"client_name": "CellsFrontend Application",
					"revokeRefreshTokenAfterInactivity": "2h",
					"grant_types": [
						"authorization_code", 
						"refresh_token"
					],
					"redirect_uris": [
						"#default_bind#/auth/callback"
                    ],
                    "post_logout_redirect_uris": [
                        "#default_bind#/auth/logout"
                    ],
					"response_types": ["code", "token", "id_token"],
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
    }
}`
