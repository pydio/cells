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

package rest

var SwaggerJson = `{
  "swagger": "2.0",
  "info": {
    "title": "Pydio Cells Rest API",
    "version": "1.0",
    "contact": {
      "name": "Pydio",
      "url": "https://pydio.com"
    }
  },
  "schemes": [
    "http",
    "https",
    "wss"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
"responses": {
    "401":{
      "description":"User is not authenticated",
      "schema":{
        "$ref": "#/definitions/restError"
      }
    },
    "403":{
      "description":"User has no permission to access this particular resource",
      "schema":{
        "$ref": "#/definitions/restError"
      }
    },
    "404":{
      "description":"Resource does not exist in the system",
      "schema":{
        "$ref": "#/definitions/restError"
      }
    },
    "500":{
      "description":"An internal error occurred in the backend",
      "schema":{
        "$ref": "#/definitions/restError"
      }
    }
  },
  "paths": {
    "/acl": {
      "post": {
        "summary": "Search Acls",
        "operationId": "SearchAcls",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restACLCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restSearchACLRequest"
            }
          }
        ],
        "tags": [
          "ACLService"
        ]
      },
      "put": {
        "summary": "Store an ACL",
        "operationId": "PutAcl",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmACL"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmACL"
            }
          }
        ],
        "tags": [
          "ACLService"
        ]
      }
    },
    "/acl/bulk/delete": {
      "post": {
        "summary": "Delete one or more ACLs",
        "operationId": "DeleteAcl",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmACL"
            }
          }
        ],
        "tags": [
          "ACLService"
        ]
      }
    },
    "/activity/stream": {
      "post": {
        "summary": "Load the the feeds of the currently logged user",
        "operationId": "Stream",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/activityObject"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/activityStreamActivitiesRequest"
            }
          }
        ],
        "tags": [
          "ActivityService"
        ]
      }
    },
    "/activity/subscribe": {
      "post": {
        "summary": "Manage subscriptions to other users/nodes feeds",
        "operationId": "Subscribe",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/activitySubscription"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/activitySubscription"
            }
          }
        ],
        "tags": [
          "ActivityService"
        ]
      }
    },
    "/activity/subscriptions": {
      "post": {
        "summary": "Load subscriptions to other users/nodes feeds",
        "operationId": "SearchSubscriptions",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restSubscriptionsCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/activitySearchSubscriptionsRequest"
            }
          }
        ],
        "tags": [
          "ActivityService"
        ]
      }
    },
    "/auth/reset-password": {
      "post": {
        "summary": "Finish up the reset password process by providing the unique token",
        "operationId": "ResetPassword",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restResetPasswordResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restResetPasswordRequest"
            }
          }
        ],
        "tags": [
          "TokenService"
        ]
      }
    },
    "/auth/reset-password-token/{UserLogin}": {
      "put": {
        "summary": "Generate a unique token for the reset password process",
        "operationId": "ResetPasswordToken",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restResetPasswordTokenResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "UserLogin",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "TokenService"
        ]
      }
    },
    "/auth/token/document": {
      "post": {
        "summary": "Generate a temporary access token for a specific document for the current user",
        "operationId": "GenerateDocumentAccessToken",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDocumentAccessTokenResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restDocumentAccessTokenRequest"
            }
          }
        ],
        "tags": [
          "TokenService"
        ]
      }
    },
    "/auth/token/revoke": {
      "post": {
        "summary": "Revoke a JWT token",
        "operationId": "Revoke",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restRevokeResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restRevokeRequest"
            }
          }
        ],
        "tags": [
          "TokenService"
        ]
      }
    },
    "/config/buckets": {
      "post": {
        "summary": "List Buckets on a given object storage",
        "operationId": "ListStorageBuckets",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restNodesCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restListStorageBucketsRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/ctl": {
      "get": {
        "summary": "List all services and their status",
        "operationId": "ListServices",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restServiceCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "StatusFilter",
            "description": "Filter services by a given status (ANY, STOPPED, STOPPING, RUNNING).",
            "in": "query",
            "required": false,
            "type": "string",
            "enum": [
              "ANY",
              "STOPPED",
              "STARTING",
              "STOPPING",
              "STARTED"
            ],
            "default": "ANY"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      },
      "post": {
        "summary": "[Not Implemented]  Start/Stop a service",
        "operationId": "ControlService",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/ctlService"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restControlServiceRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/datasource": {
      "get": {
        "summary": "List all defined datasources",
        "operationId": "ListDataSources",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDataSourceCollection"
            }
          }
        },
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/datasource/{Name}": {
      "get": {
        "summary": "Load datasource information",
        "operationId": "GetDataSource",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/objectDataSource"
            }
          }
        },
        "parameters": [
          {
            "name": "Name",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Disabled",
            "description": "Whether this data source is disabled or running.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "StorageType",
            "description": "Type of underlying storage (LOCAL, S3, AZURE, GCS).",
            "in": "query",
            "required": false,
            "type": "string",
            "enum": [
              "LOCAL",
              "S3",
              "SMB",
              "CELLS",
              "AZURE",
              "GCS",
              "B2",
              "MANTA",
              "SIA"
            ],
            "default": "LOCAL"
          },
          {
            "name": "ObjectsServiceName",
            "description": "Corresponding objects service name (underlying s3 service).",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "ObjectsHost",
            "description": "Corresponding objects service host.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "ObjectsPort",
            "description": "Corresponding objects service port.",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "ObjectsSecure",
            "description": "Corresponding objects service connection type.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "ObjectsBucket",
            "description": "Corresponding objects service bucket.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "ObjectsBaseFolder",
            "description": "Corresponding objects service base folder inside the bucket.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "ApiKey",
            "description": "Corresponding objects service api key.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "ApiSecret",
            "description": "Corresponding objects service api secret.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "PeerAddress",
            "description": "Peer address of the data source.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "Watch",
            "description": "Not implemented, whether to watch for underlying changes on the FS.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "FlatStorage",
            "description": "Store data in flat format (object-storage like).",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "SkipSyncOnRestart",
            "description": "Do not trigger resync at start.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "EncryptionMode",
            "description": "Type of encryption applied before sending data to storage.",
            "in": "query",
            "required": false,
            "type": "string",
            "enum": [
              "CLEAR",
              "MASTER",
              "USER",
              "USER_PWD"
            ],
            "default": "CLEAR"
          },
          {
            "name": "EncryptionKey",
            "description": "Encryption key used for encrypting data.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "VersioningPolicyName",
            "description": "Versioning policy describes how files are kept in the versioning queue.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "CreationDate",
            "description": "Data Source creation date.",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "LastSynchronizationDate",
            "description": "Data Source last synchronization date.",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      },
      "delete": {
        "summary": "Delete a datasource",
        "operationId": "DeleteDataSource",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteDataSourceResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Name",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      },
      "post": {
        "summary": "Create or update a datasource",
        "operationId": "PutDataSource",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/objectDataSource"
            }
          }
        },
        "parameters": [
          {
            "name": "Name",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/objectDataSource"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/discovery": {
      "get": {
        "summary": "Publish available endpoints",
        "operationId": "EndpointsDiscovery",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDiscoveryResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "EndpointType",
            "description": "Filter result to a specific endpoint type.",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/discovery/forms/{ServiceName}": {
      "get": {
        "summary": "Publish Forms definition for building screens in frontend",
        "operationId": "ConfigFormsDiscovery",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDiscoveryResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "ServiceName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/discovery/openapi": {
      "get": {
        "summary": "Publish available REST APIs",
        "operationId": "OpenApiDiscovery",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restOpenApiResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "EndpointType",
            "description": "Filter result to a specific endpoint type.",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/encryption/create": {
      "post": {
        "summary": "Create a new master key",
        "operationId": "CreateEncryptionKey",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/encryptionAdminCreateKeyResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/encryptionAdminCreateKeyRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/encryption/delete": {
      "post": {
        "summary": "Delete an existing master key",
        "operationId": "DeleteEncryptionKey",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/encryptionAdminDeleteKeyResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/encryptionAdminDeleteKeyRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/encryption/export": {
      "post": {
        "summary": "Export a master key for backup purpose, protected with a password",
        "operationId": "ExportEncryptionKey",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/encryptionAdminExportKeyResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/encryptionAdminExportKeyRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/encryption/import": {
      "put": {
        "summary": "Import a previously exported master key, requires the password created at export time",
        "operationId": "ImportEncryptionKey",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/encryptionAdminImportKeyResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/encryptionAdminImportKeyRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/encryption/list": {
      "post": {
        "summary": "List registered master keys",
        "operationId": "ListEncryptionKeys",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/encryptionAdminListKeysResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/encryptionAdminListKeysRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/peers": {
      "get": {
        "summary": "List all detected peers (servers on which the app is running)",
        "operationId": "ListPeersAddresses",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restListPeersAddressesResponse"
            }
          }
        },
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/peers/{PeerAddress}": {
      "post": {
        "summary": "List folders on a peer, starting from root",
        "operationId": "ListPeerFolders",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restNodesCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "PeerAddress",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restListPeerFoldersRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      },
      "put": {
        "summary": "Create a folder on a given path for a given peer (filesystem)",
        "operationId": "CreatePeerFolder",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restCreatePeerFolderResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "PeerAddress",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restCreatePeerFolderRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/processes": {
      "post": {
        "summary": "List running Processes, with option PeerId or ServiceName filter",
        "operationId": "ListProcesses",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restListProcessesResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restListProcessesRequest"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/scheduler/actions": {
      "get": {
        "summary": "Publish scheduler registered actions",
        "operationId": "SchedulerActionsDiscovery",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restSchedulerActionsResponse"
            }
          }
        },
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/scheduler/actions/{ActionName}": {
      "get": {
        "summary": "Publish scheduler action XML form for building screens in frontend",
        "operationId": "SchedulerActionFormDiscovery",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restSchedulerActionFormResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "ActionName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/sites/{Filter}": {
      "get": {
        "summary": "List configured sites",
        "operationId": "ListSites",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restListSitesResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Filter",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/versioning": {
      "get": {
        "summary": "List all defined versioning policies",
        "operationId": "ListVersioningPolicies",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restVersioningPolicyCollection"
            }
          }
        },
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/versioning/{Uuid}": {
      "get": {
        "summary": "Load a given versioning policy",
        "operationId": "GetVersioningPolicy",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/treeVersioningPolicy"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Name",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "Description",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "VersionsDataSourceName",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "VersionsDataSourceBucket",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "MaxTotalSize",
            "in": "query",
            "required": false,
            "type": "string",
            "format": "int64"
          },
          {
            "name": "MaxSizePerFile",
            "in": "query",
            "required": false,
            "type": "string",
            "format": "int64"
          },
          {
            "name": "IgnoreFilesGreaterThan",
            "in": "query",
            "required": false,
            "type": "string",
            "format": "int64"
          },
          {
            "name": "NodeDeletedStrategy",
            "in": "query",
            "required": false,
            "type": "string",
            "enum": [
              "KeepAll",
              "KeepLast",
              "KeepNone"
            ],
            "default": "KeepAll"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/virtualnodes": {
      "get": {
        "summary": "List all defined virtual nodes",
        "operationId": "ListVirtualNodes",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restNodesCollection"
            }
          }
        },
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/config/{FullPath}": {
      "get": {
        "summary": "Generic config Get using a full path in the config tree",
        "operationId": "GetConfig",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restConfiguration"
            }
          }
        },
        "parameters": [
          {
            "name": "FullPath",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Data",
            "description": "JSON-encoded data to store.",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "tags": [
          "ConfigService"
        ]
      },
      "put": {
        "summary": "Generic config Put, using a full path in the config tree",
        "operationId": "PutConfig",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restConfiguration"
            }
          }
        },
        "parameters": [
          {
            "name": "FullPath",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restConfiguration"
            }
          }
        ],
        "tags": [
          "ConfigService"
        ]
      }
    },
    "/frontend/binaries/{BinaryType}/{Uuid}": {
      "get": {
        "summary": "Serve frontend binaries directly (avatars / logos / bg images)",
        "operationId": "FrontServeBinary",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontBinaryResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "BinaryType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "FrontendService"
        ]
      },
      "post": {
        "summary": "Upload frontend binaries (avatars / logos / bg images)",
        "operationId": "FrontPutBinary",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontBinaryResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "BinaryType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restFrontBinaryRequest"
            }
          }
        ],
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/frontend/bootconf": {
      "get": {
        "summary": "Add some data to the initial set of parameters loaded by the frontend",
        "operationId": "FrontBootConf",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontBootConfResponse"
            }
          }
        },
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/frontend/enroll": {
      "post": {
        "summary": "Generic endpoint that can be implemented by 2FA systems for enrollment",
        "operationId": "FrontEnrollAuth",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontEnrollAuthResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restFrontEnrollAuthRequest"
            }
          }
        ],
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/frontend/messages/{Lang}": {
      "get": {
        "summary": "Serve list of I18n messages",
        "operationId": "FrontMessages",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontMessagesResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Lang",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/frontend/plugins/{Lang}": {
      "get": {
        "summary": "Serve list of I18n messages",
        "operationId": "FrontPlugins",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontPluginsResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Lang",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/frontend/session": {
      "post": {
        "summary": "Handle JWT",
        "operationId": "FrontSession",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontSessionResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restFrontSessionRequest"
            }
          }
        ],
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/frontend/settings-menu": {
      "get": {
        "summary": "Sends a tree of nodes to be used a menu in the Settings panel",
        "operationId": "SettingsMenu",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restSettingsMenuResponse"
            }
          }
        },
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/frontend/state": {
      "get": {
        "summary": "Send XML state registry",
        "operationId": "FrontState",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restFrontStateResponse"
            }
          }
        },
        "tags": [
          "FrontendService"
        ]
      }
    },
    "/graph/relation/{UserId}": {
      "get": {
        "summary": "Compute relation of context user with another user",
        "operationId": "Relation",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restRelationResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "UserId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "GraphService"
        ]
      }
    },
    "/graph/state/{Segment}": {
      "get": {
        "summary": "Compute accessible workspaces for a given user",
        "operationId": "UserState",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restUserStateResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Segment",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "GraphService"
        ]
      }
    },
    "/install": {
      "get": {
        "summary": "Loads default values for install form",
        "operationId": "GetInstall",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/installGetDefaultsResponse"
            }
          }
        },
        "tags": [
          "InstallService"
        ]
      },
      "post": {
        "summary": "Post values to be saved for install",
        "operationId": "PostInstall",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/installInstallResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/installInstallRequest"
            }
          }
        ],
        "tags": [
          "InstallService"
        ]
      }
    },
    "/install/agreement": {
      "get": {
        "summary": "Load a textual agreement for using the software",
        "operationId": "GetAgreement",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/installGetAgreementResponse"
            }
          }
        },
        "tags": [
          "InstallService"
        ]
      }
    },
    "/install/check": {
      "post": {
        "summary": "Perform a check during install (like a valid DB connection)",
        "operationId": "PerformInstallCheck",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/installPerformCheckResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/installPerformCheckRequest"
            }
          }
        ],
        "tags": [
          "InstallService"
        ]
      }
    },
    "/install/events": {
      "get": {
        "operationId": "InstallEvents",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/installInstallEventsResponse"
            }
          }
        },
        "tags": [
          "InstallService"
        ]
      }
    },
    "/jobs/tasks/delete": {
      "post": {
        "summary": "Send a control command to clean tasks on a given job",
        "operationId": "UserDeleteTasks",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/jobsDeleteTasksResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/jobsDeleteTasksRequest"
            }
          }
        ],
        "tags": [
          "JobsService"
        ]
      }
    },
    "/jobs/tasks/logs": {
      "post": {
        "summary": "Technical Logs, in Json or CSV format",
        "operationId": "ListTasksLogs",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restLogMessageCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/logListLogRequest"
            }
          }
        ],
        "tags": [
          "JobsService"
        ]
      }
    },
    "/jobs/user": {
      "post": {
        "summary": "List jobs associated with current user",
        "operationId": "UserListJobs",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restUserJobsCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/jobsListJobsRequest"
            }
          }
        ],
        "tags": [
          "JobsService"
        ]
      },
      "put": {
        "summary": "Send Control Commands to one or many jobs / tasks",
        "operationId": "UserControlJob",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/jobsCtrlCommandResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/jobsCtrlCommand"
            }
          }
        ],
        "tags": [
          "JobsService"
        ]
      }
    },
    "/jobs/user/{JobName}": {
      "put": {
        "summary": "Create a predefined job to be run directly",
        "operationId": "UserCreateJob",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restUserJobResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "JobName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restUserJobRequest"
            }
          }
        ],
        "tags": [
          "JobsService"
        ]
      }
    },
    "/log/sys": {
      "post": {
        "summary": "Technical Logs, in Json or CSV format",
        "operationId": "Syslog",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restLogMessageCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/logListLogRequest"
            }
          }
        ],
        "tags": [
          "LogService"
        ]
      }
    },
    "/mailer/send": {
      "post": {
        "summary": "Send an email to a user or any email address",
        "operationId": "Send",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/mailerSendMailResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/mailerMail"
            }
          }
        ],
        "tags": [
          "MailerService"
        ]
      }
    },
    "/meta/bulk/get": {
      "post": {
        "summary": "List meta for a list of nodes, or a full directory using /path/* syntax",
        "operationId": "GetBulkMeta",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restBulkMetaResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restGetBulkMetaRequest"
            }
          }
        ],
        "tags": [
          "MetaService"
        ]
      }
    },
    "/meta/delete/{NodePath}": {
      "post": {
        "summary": "Delete metadata of a given node",
        "operationId": "DeleteMeta",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/treeNode"
            }
          }
        },
        "parameters": [
          {
            "name": "NodePath",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restMetaNamespaceRequest"
            }
          }
        ],
        "tags": [
          "MetaService"
        ]
      }
    },
    "/meta/get/{NodePath}": {
      "post": {
        "summary": "Load metadata for a given node",
        "operationId": "GetMeta",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/treeNode"
            }
          }
        },
        "parameters": [
          {
            "name": "NodePath",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restMetaNamespaceRequest"
            }
          }
        ],
        "tags": [
          "MetaService"
        ]
      }
    },
    "/meta/set/{NodePath}": {
      "post": {
        "summary": "Update metadata for a given node",
        "operationId": "SetMeta",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/treeNode"
            }
          }
        },
        "parameters": [
          {
            "name": "NodePath",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restMetaCollection"
            }
          }
        ],
        "tags": [
          "MetaService"
        ]
      }
    },
    "/policy": {
      "post": {
        "summary": "List all defined security policies",
        "operationId": "ListPolicies",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmListPolicyGroupsResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmListPolicyGroupsRequest"
            }
          }
        ],
        "tags": [
          "PolicyService"
        ]
      }
    },
    "/role": {
      "post": {
        "summary": "Search Roles",
        "operationId": "SearchRoles",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restRolesCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restSearchRoleRequest"
            }
          }
        ],
        "tags": [
          "RoleService"
        ]
      }
    },
    "/role/{Uuid}": {
      "get": {
        "summary": "Get a Role by ID",
        "operationId": "GetRole",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmRole"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Label",
            "description": "Label of this role.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "IsTeam",
            "description": "Whether this role represents a user team or not.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "GroupRole",
            "description": "Whether this role is attached to a Group object.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "UserRole",
            "description": "Whether this role is attached to a User object.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "LastUpdated",
            "description": "Last modification date of the role.",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "AutoApplies",
            "description": "List of profiles (standard, shared, admin) on which the role will be automatically applied.",
            "in": "query",
            "required": false,
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          {
            "name": "PoliciesContextEditable",
            "description": "Whether the policies resolve into an editable state.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "ForceOverride",
            "description": "Is used in a stack of roles, this one will always be applied last.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          }
        ],
        "tags": [
          "RoleService"
        ]
      },
      "delete": {
        "summary": "Delete a Role by ID",
        "operationId": "DeleteRole",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmRole"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "RoleService"
        ]
      },
      "put": {
        "summary": "Create or update a Role",
        "operationId": "SetRole",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmRole"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmRole"
            }
          }
        ],
        "tags": [
          "RoleService"
        ]
      }
    },
    "/search/nodes": {
      "post": {
        "summary": "Search indexed nodes (files/folders) on various aspects",
        "operationId": "Nodes",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restSearchResults"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/treeSearchRequest"
            }
          }
        ],
        "tags": [
          "SearchService"
        ]
      }
    },
    "/share/cell": {
      "put": {
        "summary": "Put or Create a share room",
        "operationId": "PutCell",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restCell"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restPutCellRequest"
            }
          }
        ],
        "tags": [
          "ShareService"
        ]
      }
    },
    "/share/cell/{Uuid}": {
      "get": {
        "summary": "Load a share room",
        "operationId": "GetCell",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restCell"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ShareService"
        ]
      },
      "delete": {
        "summary": "Delete a share room",
        "operationId": "DeleteCell",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteCellResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ShareService"
        ]
      }
    },
    "/share/link": {
      "put": {
        "summary": "Put or Create a share room",
        "operationId": "PutShareLink",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restShareLink"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restPutShareLinkRequest"
            }
          }
        ],
        "tags": [
          "ShareService"
        ]
      }
    },
    "/share/link/{Uuid}": {
      "get": {
        "summary": "Load a share link with all infos",
        "operationId": "GetShareLink",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restShareLink"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ShareService"
        ]
      },
      "delete": {
        "summary": "Delete Share Link",
        "operationId": "DeleteShareLink",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteShareLinkResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Uuid",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "ShareService"
        ]
      }
    },
    "/share/policies": {
      "put": {
        "summary": "Updates policies associated to the underlying workspace for a Cell or a ShareLink",
        "operationId": "UpdateSharePolicies",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restUpdateSharePoliciesResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restUpdateSharePoliciesRequest"
            }
          }
        ],
        "tags": [
          "ShareService"
        ]
      }
    },
    "/share/resources": {
      "post": {
        "summary": "List Shared Resources for current user or all users",
        "operationId": "ListSharedResources",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restListSharedResourcesResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restListSharedResourcesRequest"
            }
          }
        ],
        "tags": [
          "ShareService"
        ]
      }
    },
    "/templates": {
      "get": {
        "summary": "List available templates",
        "operationId": "ListTemplates",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restListTemplatesResponse"
            }
          }
        },
        "tags": [
          "TemplatesService"
        ]
      }
    },
    "/tree/admin/list": {
      "post": {
        "summary": "List files and folders starting at the root (first level lists the datasources)",
        "operationId": "ListAdminTree",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restNodesCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/treeListNodesRequest"
            }
          }
        ],
        "tags": [
          "AdminTreeService"
        ]
      }
    },
    "/tree/admin/stat": {
      "post": {
        "summary": "Read a node information inside the admin tree",
        "operationId": "StatAdminTree",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/treeReadNodeResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/treeReadNodeRequest"
            }
          }
        ],
        "tags": [
          "AdminTreeService"
        ]
      }
    },
    "/tree/create": {
      "post": {
        "summary": "Create dirs or empty files inside the tree",
        "operationId": "CreateNodes",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restNodesCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restCreateNodesRequest"
            }
          }
        ],
        "tags": [
          "TreeService"
        ]
      }
    },
    "/tree/delete": {
      "post": {
        "summary": "Handle nodes deletion",
        "operationId": "DeleteNodes",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteNodesResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restDeleteNodesRequest"
            }
          }
        ],
        "tags": [
          "TreeService"
        ]
      }
    },
    "/tree/restore": {
      "post": {
        "summary": "Handle nodes restoration from recycle bin",
        "operationId": "RestoreNodes",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restRestoreNodesResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restRestoreNodesRequest"
            }
          }
        ],
        "tags": [
          "TreeService"
        ]
      }
    },
    "/tree/selection": {
      "post": {
        "summary": "Create a temporary selection for further action (namely download)",
        "operationId": "CreateSelection",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restCreateSelectionResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restCreateSelectionRequest"
            }
          }
        ],
        "tags": [
          "TreeService"
        ]
      }
    },
    "/tree/stat/{Node}": {
      "get": {
        "summary": "Return node meta without the node content itself",
        "operationId": "HeadNode",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restHeadNodeResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Node",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "TreeService"
        ]
      }
    },
    "/tree/stats": {
      "post": {
        "summary": "List meta for a list of nodes, or a full directory using /path/* syntax",
        "operationId": "BulkStatNodes",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restBulkMetaResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restGetBulkMetaRequest"
            }
          }
        ],
        "tags": [
          "TreeService"
        ]
      }
    },
    "/update": {
      "post": {
        "summary": "Check the remote server to see if there are available binaries",
        "operationId": "UpdateRequired",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/updateUpdateResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/updateUpdateRequest"
            }
          }
        ],
        "tags": [
          "UpdateService"
        ]
      }
    },
    "/update/{TargetVersion}": {
      "patch": {
        "summary": "Apply an update to a given version",
        "operationId": "ApplyUpdate",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/updateApplyUpdateResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "TargetVersion",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/updateApplyUpdateRequest"
            }
          }
        ],
        "tags": [
          "UpdateService"
        ]
      }
    },
    "/user": {
      "post": {
        "summary": "List/Search users",
        "operationId": "SearchUsers",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restUsersCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restSearchUserRequest"
            }
          }
        ],
        "tags": [
          "UserService"
        ]
      }
    },
    "/user-meta/bookmarks": {
      "post": {
        "summary": "Special API for Bookmarks, will load userMeta and the associated nodes, and return\nas a node list",
        "operationId": "UserBookmarks",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restBulkMetaResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restUserBookmarksRequest"
            }
          }
        ],
        "tags": [
          "UserMetaService"
        ]
      }
    },
    "/user-meta/namespace": {
      "get": {
        "summary": "List defined meta namespaces",
        "operationId": "ListUserMetaNamespace",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restUserMetaNamespaceCollection"
            }
          }
        },
        "tags": [
          "UserMetaService"
        ]
      },
      "put": {
        "summary": "Admin: update namespaces",
        "operationId": "UpdateUserMetaNamespace",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmUpdateUserMetaNamespaceResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmUpdateUserMetaNamespaceRequest"
            }
          }
        ],
        "tags": [
          "UserMetaService"
        ]
      }
    },
    "/user-meta/search": {
      "post": {
        "summary": "Search a list of meta by node Id or by User id and by namespace",
        "operationId": "SearchUserMeta",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restUserMetaCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmSearchUserMetaRequest"
            }
          }
        ],
        "tags": [
          "UserMetaService"
        ]
      }
    },
    "/user-meta/tags/{Namespace}": {
      "get": {
        "summary": "List Tags for a given namespace",
        "operationId": "ListUserMetaTags",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restListUserMetaTagsResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Namespace",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "UserMetaService"
        ]
      },
      "post": {
        "summary": "Add a new value to Tags for a given namespace",
        "operationId": "PutUserMetaTag",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restPutUserMetaTagResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Namespace",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restPutUserMetaTagRequest"
            }
          }
        ],
        "tags": [
          "UserMetaService"
        ]
      }
    },
    "/user-meta/tags/{Namespace}/{Tags}": {
      "delete": {
        "summary": "Delete one or all tags for a given namespace (use * for all tags)",
        "operationId": "DeleteUserMetaTags",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteUserMetaTagsResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Namespace",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Tags",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "UserMetaService"
        ]
      }
    },
    "/user-meta/update": {
      "put": {
        "summary": "Update/delete user meta",
        "operationId": "UpdateUserMeta",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmUpdateUserMetaResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmUpdateUserMetaRequest"
            }
          }
        ],
        "tags": [
          "UserMetaService"
        ]
      }
    },
    "/user/roles/{Login}": {
      "put": {
        "summary": "Just save a user roles, without other datas",
        "operationId": "PutRoles",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmUser"
            }
          }
        },
        "parameters": [
          {
            "name": "Login",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmUser"
            }
          }
        ],
        "tags": [
          "UserService"
        ]
      }
    },
    "/user/{Login}": {
      "get": {
        "summary": "Get a user by login",
        "operationId": "GetUser",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmUser"
            }
          }
        },
        "parameters": [
          {
            "name": "Login",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Uuid",
            "description": "User unique identifier.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "GroupPath",
            "description": "Path to the parent group.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "Password",
            "description": "Password can be passed to be updated (but never read back), field is empty for groups.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "OldPassword",
            "description": "OldPassword must be set when a user updates her own password.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "IsGroup",
            "description": "Whether this object is a group or a user.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          },
          {
            "name": "GroupLabel",
            "description": "Label of the group, field is empty for users.",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "LastConnected",
            "description": "Last successful connection timestamp.",
            "in": "query",
            "required": false,
            "type": "integer",
            "format": "int32"
          },
          {
            "name": "PoliciesContextEditable",
            "description": "Context-resolved to quickly check if user is editable or not.",
            "in": "query",
            "required": false,
            "type": "boolean",
            "format": "boolean"
          }
        ],
        "tags": [
          "UserService"
        ]
      },
      "delete": {
        "summary": "Delete a user",
        "operationId": "DeleteUser",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Login",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "UserService"
        ]
      },
      "put": {
        "summary": "Create or update a user",
        "operationId": "PutUser",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmUser"
            }
          }
        },
        "parameters": [
          {
            "name": "Login",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmUser"
            }
          }
        ],
        "tags": [
          "UserService"
        ]
      }
    },
    "/workspace": {
      "post": {
        "summary": "Search workspaces on certain keys",
        "operationId": "SearchWorkspaces",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restWorkspaceCollection"
            }
          }
        },
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/restSearchWorkspaceRequest"
            }
          }
        ],
        "tags": [
          "WorkspaceService"
        ]
      }
    },
    "/workspace/{Slug}": {
      "delete": {
        "summary": "Delete an existing workspace",
        "operationId": "DeleteWorkspace",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/restDeleteResponse"
            }
          }
        },
        "parameters": [
          {
            "name": "Slug",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "tags": [
          "WorkspaceService"
        ]
      },
      "put": {
        "summary": "Create or update a workspace",
        "operationId": "PutWorkspace",
        "responses": {
          "200": {
            "description": "",
            "schema": {
              "$ref": "#/definitions/idmWorkspace"
            }
          }
        },
        "parameters": [
          {
            "name": "Slug",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/idmWorkspace"
            }
          }
        ],
        "tags": [
          "WorkspaceService"
        ]
      }
    }
  },
  "definitions": {
    "ListLogRequestLogFormat": {
      "type": "string",
      "enum": [
        "JSON",
        "CSV",
        "XLSX"
      ],
      "default": "JSON",
      "title": "Output Format"
    },
    "ListSharedResourcesRequestListShareType": {
      "type": "string",
      "enum": [
        "ANY",
        "LINKS",
        "CELLS"
      ],
      "default": "ANY"
    },
    "ListSharedResourcesResponseSharedResource": {
      "type": "object",
      "properties": {
        "Node": {
          "$ref": "#/definitions/treeNode"
        },
        "Link": {
          "$ref": "#/definitions/restShareLink"
        },
        "Cells": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restCell"
          }
        }
      },
      "title": "Container for ShareLink or Cell"
    },
    "NodeChangeEventEventType": {
      "type": "string",
      "enum": [
        "CREATE",
        "READ",
        "UPDATE_PATH",
        "UPDATE_CONTENT",
        "UPDATE_META",
        "UPDATE_USER_META",
        "DELETE"
      ],
      "default": "CREATE"
    },
    "PackagePackageStatus": {
      "type": "string",
      "enum": [
        "Draft",
        "Pending",
        "Released"
      ],
      "default": "Draft"
    },
    "ResourcePolicyQueryQueryType": {
      "type": "string",
      "enum": [
        "CONTEXT",
        "ANY",
        "NONE",
        "USER"
      ],
      "default": "CONTEXT"
    },
    "UpdateUserMetaNamespaceRequestUserMetaNsOp": {
      "type": "string",
      "enum": [
        "PUT",
        "DELETE"
      ],
      "default": "PUT"
    },
    "UpdateUserMetaRequestUserMetaOp": {
      "type": "string",
      "enum": [
        "PUT",
        "DELETE"
      ],
      "default": "PUT"
    },
    "activityObject": {
      "type": "object",
      "properties": {
        "jsonLdContext": {
          "type": "string"
        },
        "type": {
          "$ref": "#/definitions/activityObjectType"
        },
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "summary": {
          "type": "string"
        },
        "markdown": {
          "type": "string"
        },
        "context": {
          "$ref": "#/definitions/activityObject"
        },
        "attachment": {
          "$ref": "#/definitions/activityObject"
        },
        "attributedTo": {
          "$ref": "#/definitions/activityObject"
        },
        "audience": {
          "$ref": "#/definitions/activityObject"
        },
        "content": {
          "$ref": "#/definitions/activityObject"
        },
        "startTime": {
          "type": "string",
          "format": "date-time"
        },
        "endTime": {
          "type": "string",
          "format": "date-time"
        },
        "published": {
          "type": "string",
          "format": "date-time"
        },
        "updated": {
          "type": "string",
          "format": "date-time"
        },
        "duration": {
          "type": "string",
          "format": "date-time"
        },
        "url": {
          "$ref": "#/definitions/activityObject"
        },
        "mediaType": {
          "type": "string"
        },
        "icon": {
          "$ref": "#/definitions/activityObject"
        },
        "image": {
          "$ref": "#/definitions/activityObject"
        },
        "preview": {
          "$ref": "#/definitions/activityObject"
        },
        "location": {
          "$ref": "#/definitions/activityObject"
        },
        "inReplyTo": {
          "$ref": "#/definitions/activityObject"
        },
        "replies": {
          "$ref": "#/definitions/activityObject"
        },
        "tag": {
          "$ref": "#/definitions/activityObject"
        },
        "generator": {
          "$ref": "#/definitions/activityObject"
        },
        "to": {
          "$ref": "#/definitions/activityObject"
        },
        "bto": {
          "$ref": "#/definitions/activityObject"
        },
        "cc": {
          "$ref": "#/definitions/activityObject"
        },
        "bcc": {
          "$ref": "#/definitions/activityObject"
        },
        "actor": {
          "$ref": "#/definitions/activityObject",
          "title": "Activity Properties"
        },
        "object": {
          "$ref": "#/definitions/activityObject"
        },
        "target": {
          "$ref": "#/definitions/activityObject"
        },
        "result": {
          "$ref": "#/definitions/activityObject"
        },
        "origin": {
          "$ref": "#/definitions/activityObject"
        },
        "instrument": {
          "$ref": "#/definitions/activityObject"
        },
        "href": {
          "type": "string",
          "title": "Link Properties"
        },
        "rel": {
          "type": "string"
        },
        "hreflang": {
          "type": "string"
        },
        "height": {
          "type": "integer",
          "format": "int32"
        },
        "width": {
          "type": "integer",
          "format": "int32"
        },
        "oneOf": {
          "$ref": "#/definitions/activityObject",
          "title": "Question Properties"
        },
        "anyOf": {
          "$ref": "#/definitions/activityObject"
        },
        "closed": {
          "type": "string",
          "format": "date-time"
        },
        "subject": {
          "$ref": "#/definitions/activityObject",
          "title": "Relationship Properties"
        },
        "relationship": {
          "$ref": "#/definitions/activityObject"
        },
        "formerType": {
          "$ref": "#/definitions/activityObjectType",
          "title": "Tombstone Properties"
        },
        "deleted": {
          "type": "string",
          "format": "date-time"
        },
        "accuracy": {
          "type": "number",
          "format": "float",
          "title": "Place Properties"
        },
        "altitude": {
          "type": "number",
          "format": "float"
        },
        "latitude": {
          "type": "number",
          "format": "float"
        },
        "longitude": {
          "type": "number",
          "format": "float"
        },
        "radius": {
          "type": "number",
          "format": "float"
        },
        "units": {
          "type": "string"
        },
        "items": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/activityObject"
          },
          "title": "Collection Properties"
        },
        "totalItems": {
          "type": "integer",
          "format": "int32"
        },
        "current": {
          "$ref": "#/definitions/activityObject"
        },
        "first": {
          "$ref": "#/definitions/activityObject"
        },
        "last": {
          "$ref": "#/definitions/activityObject"
        },
        "partOf": {
          "$ref": "#/definitions/activityObject"
        },
        "next": {
          "$ref": "#/definitions/activityObject"
        },
        "prev": {
          "$ref": "#/definitions/activityObject"
        }
      }
    },
    "activityObjectType": {
      "type": "string",
      "enum": [
        "BaseObject",
        "Activity",
        "Link",
        "Mention",
        "Collection",
        "OrderedCollection",
        "CollectionPage",
        "OrderedCollectionPage",
        "Application",
        "Group",
        "Organization",
        "Person",
        "Service",
        "Article",
        "Audio",
        "Document",
        "Event",
        "Image",
        "Note",
        "Page",
        "Place",
        "Profile",
        "Relationship",
        "Tombstone",
        "Video",
        "Accept",
        "Add",
        "Announce",
        "Arrive",
        "Block",
        "Create",
        "Delete",
        "Dislike",
        "Flag",
        "Follow",
        "Ignore",
        "Invite",
        "Join",
        "Leave",
        "Like",
        "Listen",
        "Move",
        "Offer",
        "Question",
        "Reject",
        "Read",
        "Remove",
        "TentativeReject",
        "TentativeAccept",
        "Travel",
        "Undo",
        "Update",
        "UpdateComment",
        "UpdateMeta",
        "View",
        "Workspace",
        "Digest",
        "Folder",
        "Cell",
        "Share"
      ],
      "default": "BaseObject",
      "title": "- Collection: CollectionTypes\n - Application: Actor Types\n - Article: Objects Types\n - Accept: Activity Types\n - Workspace: Pydio Types"
    },
    "activityOwnerType": {
      "type": "string",
      "enum": [
        "NODE",
        "USER"
      ],
      "default": "NODE"
    },
    "activitySearchSubscriptionsRequest": {
      "type": "object",
      "properties": {
        "UserIds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of UserIds for which we want to list"
        },
        "ObjectTypes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/activityOwnerType"
          },
          "title": "Filter by type of objects"
        },
        "ObjectIds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Filter by object Ids"
        }
      }
    },
    "activityStreamActivitiesRequest": {
      "type": "object",
      "properties": {
        "Context": {
          "$ref": "#/definitions/activityStreamContext",
          "title": "Define the context of the stream"
        },
        "ContextData": {
          "type": "string",
          "title": "Value for the context (e.g. User Id, Node Id)"
        },
        "StreamFilter": {
          "type": "string",
          "title": "Json-encoded filter"
        },
        "BoxName": {
          "type": "string",
          "title": "Target inbox or outbox for the given object"
        },
        "UnreadCountOnly": {
          "type": "boolean",
          "format": "boolean",
          "title": "Count last activities that were not loaded yet"
        },
        "Offset": {
          "type": "string",
          "format": "int64",
          "title": "Start listing at a given position"
        },
        "Limit": {
          "type": "string",
          "format": "int64",
          "title": "Limit the number of results"
        },
        "AsDigest": {
          "type": "boolean",
          "format": "boolean",
          "title": "Compute a digest of all unread activities"
        },
        "PointOfView": {
          "$ref": "#/definitions/activitySummaryPointOfView",
          "title": "Provide context for building the human-readable strings of each activity"
        },
        "Language": {
          "type": "string",
          "description": "Provide language information for building the human-readable strings."
        }
      }
    },
    "activityStreamContext": {
      "type": "string",
      "enum": [
        "MYFEED",
        "USER_ID",
        "NODE_ID"
      ],
      "default": "MYFEED"
    },
    "activitySubscription": {
      "type": "object",
      "properties": {
        "UserId": {
          "type": "string",
          "title": "Id of the user for this subscription"
        },
        "ObjectType": {
          "$ref": "#/definitions/activityOwnerType",
          "title": "Type of owner"
        },
        "ObjectId": {
          "type": "string",
          "title": "If of the owner"
        },
        "Events": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of events to listen to"
        }
      }
    },
    "activitySummaryPointOfView": {
      "type": "string",
      "enum": [
        "GENERIC",
        "ACTOR",
        "SUBJECT"
      ],
      "default": "GENERIC"
    },
    "authToken": {
      "type": "object",
      "properties": {
        "AccessToken": {
          "type": "string"
        },
        "IDToken": {
          "type": "string"
        },
        "RefreshToken": {
          "type": "string"
        },
        "ExpiresAt": {
          "type": "string"
        }
      }
    },
    "ctlPeer": {
      "type": "object",
      "properties": {
        "Id": {
          "type": "string"
        },
        "Address": {
          "type": "string"
        },
        "Port": {
          "type": "integer",
          "format": "int32"
        },
        "Metadata": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    },
    "ctlService": {
      "type": "object",
      "properties": {
        "Name": {
          "type": "string"
        },
        "Version": {
          "type": "string"
        },
        "Description": {
          "type": "string"
        },
        "Tag": {
          "type": "string"
        },
        "Controllable": {
          "type": "boolean",
          "format": "boolean"
        },
        "Status": {
          "$ref": "#/definitions/ctlServiceStatus"
        },
        "RunningPeers": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ctlPeer"
          }
        }
      }
    },
    "ctlServiceCommand": {
      "type": "string",
      "enum": [
        "START",
        "STOP"
      ],
      "default": "START"
    },
    "ctlServiceStatus": {
      "type": "string",
      "enum": [
        "ANY",
        "STOPPED",
        "STARTING",
        "STOPPING",
        "STARTED"
      ],
      "default": "ANY"
    },
    "encryptionAdminCreateKeyRequest": {
      "type": "object",
      "properties": {
        "KeyID": {
          "type": "string",
          "title": "Create a key with this ID"
        },
        "Label": {
          "type": "string",
          "title": "Provide label for the newly created key"
        }
      }
    },
    "encryptionAdminCreateKeyResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "encryptionAdminDeleteKeyRequest": {
      "type": "object",
      "properties": {
        "KeyID": {
          "type": "string",
          "title": "Id of the key to delete"
        }
      }
    },
    "encryptionAdminDeleteKeyResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "encryptionAdminExportKeyRequest": {
      "type": "object",
      "properties": {
        "KeyID": {
          "type": "string",
          "title": "Id of the key to export"
        },
        "StrPassword": {
          "type": "string",
          "title": "Associated password as string"
        }
      }
    },
    "encryptionAdminExportKeyResponse": {
      "type": "object",
      "properties": {
        "Key": {
          "$ref": "#/definitions/encryptionKey"
        }
      }
    },
    "encryptionAdminImportKeyRequest": {
      "type": "object",
      "properties": {
        "Key": {
          "$ref": "#/definitions/encryptionKey",
          "title": "Imported key data"
        },
        "StrPassword": {
          "type": "string",
          "title": "Key password"
        },
        "Override": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether to override if a key with same ID already exists"
        }
      }
    },
    "encryptionAdminImportKeyResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "encryptionAdminListKeysRequest": {
      "type": "object"
    },
    "encryptionAdminListKeysResponse": {
      "type": "object",
      "properties": {
        "Keys": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/encryptionKey"
          }
        }
      }
    },
    "encryptionExport": {
      "type": "object",
      "properties": {
        "By": {
          "type": "string",
          "title": "Name of exporter"
        },
        "Date": {
          "type": "integer",
          "format": "int32",
          "title": "Date of export"
        }
      }
    },
    "encryptionImport": {
      "type": "object",
      "properties": {
        "By": {
          "type": "string",
          "title": "Name of importer"
        },
        "Date": {
          "type": "integer",
          "format": "int32",
          "title": "Date of import"
        }
      }
    },
    "encryptionKey": {
      "type": "object",
      "properties": {
        "Owner": {
          "type": "string",
          "title": "Key owner"
        },
        "ID": {
          "type": "string",
          "title": "Key ID"
        },
        "Label": {
          "type": "string",
          "title": "Key label"
        },
        "Content": {
          "type": "string",
          "title": "Key content"
        },
        "CreationDate": {
          "type": "integer",
          "format": "int32",
          "title": "Key creation date"
        },
        "Info": {
          "$ref": "#/definitions/encryptionKeyInfo",
          "title": "Additional key info"
        }
      }
    },
    "encryptionKeyInfo": {
      "type": "object",
      "properties": {
        "Exports": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/encryptionExport"
          }
        },
        "Imports": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/encryptionImport"
          }
        }
      }
    },
    "idmACL": {
      "type": "object",
      "properties": {
        "ID": {
          "type": "string",
          "title": "Unique ID of this ACL"
        },
        "Action": {
          "$ref": "#/definitions/idmACLAction",
          "title": "Action on which this ACL provides control"
        },
        "RoleID": {
          "type": "string",
          "title": "Associated Role"
        },
        "WorkspaceID": {
          "type": "string",
          "title": "Associated Workspace"
        },
        "NodeID": {
          "type": "string",
          "title": "Associated Node"
        }
      },
      "description": "ACL are the basic flags that can be put anywhere in the tree to provide some specific rights to a given role.\nThe context of how they apply can be fine-tuned by workspace."
    },
    "idmACLAction": {
      "type": "object",
      "properties": {
        "Name": {
          "type": "string"
        },
        "Value": {
          "type": "string"
        }
      }
    },
    "idmACLSingleQuery": {
      "type": "object",
      "properties": {
        "Actions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmACLAction"
          }
        },
        "RoleIDs": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "WorkspaceIDs": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "NodeIDs": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "not": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "idmListPolicyGroupsRequest": {
      "type": "object"
    },
    "idmListPolicyGroupsResponse": {
      "type": "object",
      "properties": {
        "PolicyGroups": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmPolicyGroup"
          }
        },
        "Total": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "idmNodeType": {
      "type": "string",
      "enum": [
        "UNKNOWN",
        "USER",
        "GROUP"
      ],
      "default": "UNKNOWN"
    },
    "idmPolicy": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "subjects": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "resources": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "actions": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "effect": {
          "$ref": "#/definitions/idmPolicyEffect"
        },
        "conditions": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/idmPolicyCondition"
          }
        }
      }
    },
    "idmPolicyCondition": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string"
        },
        "jsonOptions": {
          "type": "string"
        }
      }
    },
    "idmPolicyEffect": {
      "type": "string",
      "enum": [
        "unknown",
        "deny",
        "allow"
      ],
      "default": "unknown"
    },
    "idmPolicyGroup": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string"
        },
        "Name": {
          "type": "string"
        },
        "Description": {
          "type": "string"
        },
        "OwnerUuid": {
          "type": "string"
        },
        "ResourceGroup": {
          "$ref": "#/definitions/idmPolicyResourceGroup"
        },
        "LastUpdated": {
          "type": "integer",
          "format": "int32"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmPolicy"
          }
        }
      }
    },
    "idmPolicyResourceGroup": {
      "type": "string",
      "enum": [
        "rest",
        "acl",
        "oidc"
      ],
      "default": "rest"
    },
    "idmRole": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "Unique identifier of this role"
        },
        "Label": {
          "type": "string",
          "title": "Label of this role"
        },
        "IsTeam": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether this role represents a user team or not"
        },
        "GroupRole": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether this role is attached to a Group object"
        },
        "UserRole": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether this role is attached to a User object"
        },
        "LastUpdated": {
          "type": "integer",
          "format": "int32",
          "title": "Last modification date of the role"
        },
        "AutoApplies": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of profiles (standard, shared, admin) on which the role will be automatically applied"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "List of policies for securing this role access"
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether the policies resolve into an editable state"
        },
        "ForceOverride": {
          "type": "boolean",
          "format": "boolean",
          "description": "Is used in a stack of roles, this one will always be applied last."
        }
      },
      "description": "Role represents a generic set of permissions that can be applied to any users or groups."
    },
    "idmRoleSingleQuery": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Look for roles by Uuid"
        },
        "Label": {
          "type": "string",
          "title": "Look for roles by label, eventually using wildchar"
        },
        "IsTeam": {
          "type": "boolean",
          "format": "boolean",
          "title": "Look for team roles only"
        },
        "IsGroupRole": {
          "type": "boolean",
          "format": "boolean",
          "title": "Look for group roles only"
        },
        "IsUserRole": {
          "type": "boolean",
          "format": "boolean",
          "title": "Look for user roles only"
        },
        "HasAutoApply": {
          "type": "boolean",
          "format": "boolean",
          "title": "Look for roles that have any value in the autoApplies field"
        },
        "not": {
          "type": "boolean",
          "format": "boolean",
          "title": "Negate the query"
        }
      },
      "description": "RoleSingleQuery is the basic unit for building queries to Roles."
    },
    "idmSearchUserMetaRequest": {
      "type": "object",
      "properties": {
        "MetaUuids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Look for meta by their unique identifier"
        },
        "NodeUuids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Look for all meta for a list of nodes"
        },
        "Namespace": {
          "type": "string",
          "title": "Filter meta by their namespace"
        },
        "ResourceSubjectOwner": {
          "type": "string",
          "title": "Filter meta by owner (in the sense of the policies)"
        },
        "ResourceQuery": {
          "$ref": "#/definitions/serviceResourcePolicyQuery",
          "title": "Filter meta by policies query"
        }
      },
      "title": "Request for searching UserMeta by NodeUuid or by Namespace"
    },
    "idmUpdateUserMetaNamespaceRequest": {
      "type": "object",
      "properties": {
        "Operation": {
          "$ref": "#/definitions/UpdateUserMetaNamespaceRequestUserMetaNsOp"
        },
        "Namespaces": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUserMetaNamespace"
          }
        }
      },
      "title": "Modify UserMetaNamespaces"
    },
    "idmUpdateUserMetaNamespaceResponse": {
      "type": "object",
      "properties": {
        "Namespaces": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUserMetaNamespace"
          }
        }
      },
      "title": "Response of the"
    },
    "idmUpdateUserMetaRequest": {
      "type": "object",
      "properties": {
        "Operation": {
          "$ref": "#/definitions/UpdateUserMetaRequestUserMetaOp",
          "title": "Type of operation to apply (PUT / DELETE)"
        },
        "MetaDatas": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUserMeta"
          },
          "title": "List of metadatas to update or delete"
        }
      },
      "title": "Request for modifying UserMeta"
    },
    "idmUpdateUserMetaResponse": {
      "type": "object",
      "properties": {
        "MetaDatas": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUserMeta"
          },
          "title": "List of metadatas"
        }
      },
      "title": "Response of UpdateUserMeta service"
    },
    "idmUser": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "User unique identifier"
        },
        "GroupPath": {
          "type": "string",
          "title": "Path to the parent group"
        },
        "Attributes": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "A free list of attributes"
        },
        "Roles": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmRole"
          },
          "title": "List of roles applied to this user or group"
        },
        "Login": {
          "type": "string",
          "title": "User login is used to connect, field is empty for groups"
        },
        "Password": {
          "type": "string",
          "title": "Password can be passed to be updated (but never read back), field is empty for groups"
        },
        "OldPassword": {
          "type": "string",
          "title": "OldPassword must be set when a user updates her own password"
        },
        "IsGroup": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether this object is a group or a user"
        },
        "GroupLabel": {
          "type": "string",
          "title": "Label of the group, field is empty for users"
        },
        "LastConnected": {
          "type": "integer",
          "format": "int32",
          "title": "Last successful connection timestamp"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "Policies securing access to this user"
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean",
          "description": "Context-resolved to quickly check if user is editable or not."
        }
      },
      "title": "User can represent either a User or a Group"
    },
    "idmUserMeta": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "Unique identifier of the metadata"
        },
        "NodeUuid": {
          "type": "string",
          "title": "Unique identifier of the node to which meta is attached"
        },
        "Namespace": {
          "type": "string",
          "title": "Namespace for the metadata"
        },
        "JsonValue": {
          "type": "string",
          "title": "Json encoded value used to pass any type of values"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "Policies for securing access"
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean",
          "title": "Context-resolved to quickly check if this meta is editable or not"
        },
        "ResolvedNode": {
          "$ref": "#/definitions/treeNode",
          "title": "Pass along resolved Node for advanced filtering"
        }
      },
      "title": "Piece of metadata attached to a node"
    },
    "idmUserMetaNamespace": {
      "type": "object",
      "properties": {
        "Namespace": {
          "type": "string",
          "title": "Namespace identifier, must be unique"
        },
        "Label": {
          "type": "string",
          "title": "Human-readable Label"
        },
        "Order": {
          "type": "integer",
          "format": "int32",
          "title": "Order is used for sorting lists of namesapces"
        },
        "Indexable": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether a modification of a metadata value for this namespace should trigger an indexation by the search engine"
        },
        "JsonDefinition": {
          "type": "string",
          "title": "Json-encoded type to provide accurate interface for edition"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "Policies securing this namespace"
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean",
          "title": "Context-resolved to quickly check if this meta is editable or not"
        }
      },
      "title": "Globally declared Namespace with associated policies"
    },
    "idmUserSingleQuery": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string"
        },
        "Login": {
          "type": "string"
        },
        "Password": {
          "type": "string"
        },
        "GroupPath": {
          "type": "string",
          "title": "Search on group path, and if so, search recursively"
        },
        "Recursive": {
          "type": "boolean",
          "format": "boolean"
        },
        "FullPath": {
          "type": "string",
          "title": "Search a specific group by path"
        },
        "AttributeName": {
          "type": "string",
          "title": "Search on attribute"
        },
        "AttributeValue": {
          "type": "string"
        },
        "AttributeAnyValue": {
          "type": "boolean",
          "format": "boolean"
        },
        "HasRole": {
          "type": "string",
          "title": "Search on roles"
        },
        "NodeType": {
          "$ref": "#/definitions/idmNodeType"
        },
        "HasProfile": {
          "type": "string",
          "title": "Shortcut for pydio:profile attribute"
        },
        "ConnectedSince": {
          "type": "string",
          "title": "Compare to last connection date, starting with \u003e or \u003c"
        },
        "not": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "idmWorkspace": {
      "type": "object",
      "properties": {
        "UUID": {
          "type": "string",
          "title": "Unique identifier of the workspace"
        },
        "Label": {
          "type": "string",
          "title": "Label of the workspace (max length 500)"
        },
        "Description": {
          "type": "string",
          "title": "Description of the workspace (max length 1000)"
        },
        "Slug": {
          "type": "string",
          "title": "Slug is an url-compatible form of the workspace label, or can be freely modified (max length 500)"
        },
        "Scope": {
          "$ref": "#/definitions/idmWorkspaceScope",
          "title": "Scope can be ADMIN, ROOM (=CELL) or LINK"
        },
        "LastUpdated": {
          "type": "integer",
          "format": "int32",
          "title": "Last modification time"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "Policies for securing access"
        },
        "Attributes": {
          "type": "string",
          "title": "JSON-encoded list of attributes"
        },
        "RootUUIDs": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Quick list of the RootNodes uuids"
        },
        "RootNodes": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "List of the Root Nodes in the tree that compose this workspace"
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean",
          "title": "Context-resolved to quickly check if workspace is editable or not"
        }
      },
      "description": "A Workspace is composed of a set of nodes UUIDs and is used to provide accesses to the tree via ACLs."
    },
    "idmWorkspaceScope": {
      "type": "string",
      "enum": [
        "ANY",
        "ADMIN",
        "ROOM",
        "LINK"
      ],
      "default": "ANY"
    },
    "idmWorkspaceSingleQuery": {
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "label": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "slug": {
          "type": "string"
        },
        "scope": {
          "$ref": "#/definitions/idmWorkspaceScope"
        },
        "LastUpdated": {
          "type": "string"
        },
        "HasAttribute": {
          "type": "string"
        },
        "AttributeName": {
          "type": "string"
        },
        "AttributeValue": {
          "type": "string"
        },
        "not": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "installCheckResult": {
      "type": "object",
      "properties": {
        "Name": {
          "type": "string"
        },
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "JsonResult": {
          "type": "string"
        }
      }
    },
    "installGetAgreementResponse": {
      "type": "object",
      "properties": {
        "Text": {
          "type": "string"
        }
      }
    },
    "installGetDefaultsResponse": {
      "type": "object",
      "properties": {
        "config": {
          "$ref": "#/definitions/installInstallConfig"
        }
      }
    },
    "installInstallConfig": {
      "type": "object",
      "properties": {
        "internalUrl": {
          "type": "string"
        },
        "dbConnectionType": {
          "type": "string"
        },
        "dbTCPHostname": {
          "type": "string"
        },
        "dbTCPPort": {
          "type": "string"
        },
        "dbTCPName": {
          "type": "string"
        },
        "dbTCPUser": {
          "type": "string"
        },
        "dbTCPPassword": {
          "type": "string"
        },
        "dbSocketFile": {
          "type": "string"
        },
        "dbSocketName": {
          "type": "string"
        },
        "dbSocketUser": {
          "type": "string"
        },
        "dbSocketPassword": {
          "type": "string"
        },
        "dbManualDSN": {
          "type": "string"
        },
        "dbUseDefaults": {
          "type": "boolean",
          "format": "boolean"
        },
        "dsName": {
          "type": "string"
        },
        "dsPort": {
          "type": "string"
        },
        "dsType": {
          "type": "string"
        },
        "dsS3Custom": {
          "type": "string"
        },
        "dsS3CustomRegion": {
          "type": "string"
        },
        "dsS3ApiKey": {
          "type": "string"
        },
        "dsS3ApiSecret": {
          "type": "string"
        },
        "dsS3BucketDefault": {
          "type": "string"
        },
        "dsS3BucketPersonal": {
          "type": "string"
        },
        "dsS3BucketCells": {
          "type": "string"
        },
        "dsS3BucketBinaries": {
          "type": "string"
        },
        "dsS3BucketThumbs": {
          "type": "string"
        },
        "dsS3BucketVersions": {
          "type": "string"
        },
        "dsFolder": {
          "type": "string"
        },
        "frontendHosts": {
          "type": "string"
        },
        "frontendLogin": {
          "type": "string"
        },
        "frontendPassword": {
          "type": "string"
        },
        "frontendRepeatPassword": {
          "type": "string"
        },
        "frontendApplicationTitle": {
          "type": "string"
        },
        "frontendDefaultLanguage": {
          "type": "string"
        },
        "licenseRequired": {
          "type": "boolean",
          "format": "boolean"
        },
        "licenseString": {
          "type": "string"
        },
        "CheckResults": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/installCheckResult"
          }
        },
        "ProxyConfig": {
          "$ref": "#/definitions/installProxyConfig",
          "title": "Additional proxy config (optional)"
        }
      }
    },
    "installInstallEventsResponse": {
      "type": "object"
    },
    "installInstallRequest": {
      "type": "object",
      "properties": {
        "config": {
          "$ref": "#/definitions/installInstallConfig"
        }
      }
    },
    "installInstallResponse": {
      "type": "object",
      "properties": {
        "success": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "installPerformCheckRequest": {
      "type": "object",
      "properties": {
        "Name": {
          "type": "string"
        },
        "Config": {
          "$ref": "#/definitions/installInstallConfig"
        }
      }
    },
    "installPerformCheckResponse": {
      "type": "object",
      "properties": {
        "Result": {
          "$ref": "#/definitions/installCheckResult"
        }
      }
    },
    "installProxyConfig": {
      "type": "object",
      "properties": {
        "Binds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "A list of [host]:port to bind to"
        },
        "ReverseProxyURL": {
          "type": "string",
          "title": "Optional URL of reverse proxy exposing this site"
        },
        "SelfSigned": {
          "$ref": "#/definitions/installTLSSelfSigned"
        },
        "LetsEncrypt": {
          "$ref": "#/definitions/installTLSLetsEncrypt"
        },
        "Certificate": {
          "$ref": "#/definitions/installTLSCertificate"
        },
        "SSLRedirect": {
          "type": "boolean",
          "format": "boolean",
          "title": "If TLS is set, whether to automatically redirect each http://host:port to https://host:port"
        },
        "Maintenance": {
          "type": "boolean",
          "format": "boolean",
          "title": "If set, this site will be in maintenance mode"
        },
        "MaintenanceConditions": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Append caddy directive to restrict maintenance mode"
        }
      },
      "title": "ProxyConfig gives necessary URL and TLS configurations to start proxy"
    },
    "installTLSCertificate": {
      "type": "object",
      "properties": {
        "CertFile": {
          "type": "string"
        },
        "KeyFile": {
          "type": "string"
        },
        "CellsRootCA": {
          "type": "string"
        }
      },
      "title": "TLSCertificate is a TLSConfig where user passes"
    },
    "installTLSLetsEncrypt": {
      "type": "object",
      "properties": {
        "Email": {
          "type": "string"
        },
        "AcceptEULA": {
          "type": "boolean",
          "format": "boolean"
        },
        "StagingCA": {
          "type": "boolean",
          "format": "boolean"
        }
      },
      "title": "TLSLetsEncrypt set up proxy to automatically get a valid certificate from let's encrypt servers"
    },
    "installTLSSelfSigned": {
      "type": "object",
      "properties": {
        "Hostnames": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "title": "TLSSelfSigned generates a selfsigned certificate"
    },
    "jobsAction": {
      "type": "object",
      "properties": {
        "ID": {
          "type": "string",
          "title": "String Identifier for specific action"
        },
        "Label": {
          "type": "string",
          "title": "User-defined label for this action"
        },
        "Description": {
          "type": "string",
          "title": "User-defined comment for this action"
        },
        "Bypass": {
          "type": "boolean",
          "format": "boolean",
          "title": "Bypass this action (forward input to output and do nothing)"
        },
        "BreakAfter": {
          "type": "boolean",
          "format": "boolean",
          "title": "Stop full chain now : do not carry on executing next actions"
        },
        "NodesSelector": {
          "$ref": "#/definitions/jobsNodesSelector",
          "title": "Nodes Selector"
        },
        "UsersSelector": {
          "$ref": "#/definitions/jobsUsersSelector",
          "title": "Users Selector (deprecated in favor of IdmSelector)"
        },
        "NodesFilter": {
          "$ref": "#/definitions/jobsNodesSelector",
          "title": "Node Filter"
        },
        "UsersFilter": {
          "$ref": "#/definitions/jobsUsersSelector",
          "title": "User Filter (deprecated in favor of IdmSelector)"
        },
        "IdmSelector": {
          "$ref": "#/definitions/jobsIdmSelector",
          "title": "Idm objects collector"
        },
        "IdmFilter": {
          "$ref": "#/definitions/jobsIdmSelector",
          "title": "Idm objects filter"
        },
        "DataSourceSelector": {
          "$ref": "#/definitions/jobsDataSourceSelector",
          "title": "DataSource objects collector"
        },
        "DataSourceFilter": {
          "$ref": "#/definitions/jobsDataSourceSelector",
          "title": "DataSource objects filter"
        },
        "ActionOutputFilter": {
          "$ref": "#/definitions/jobsActionOutputFilter",
          "title": "Previous action output filter"
        },
        "ContextMetaFilter": {
          "$ref": "#/definitions/jobsContextMetaFilter",
          "title": "Metadata policy-based filter"
        },
        "TriggerFilter": {
          "$ref": "#/definitions/jobsTriggerFilter",
          "title": "Filter on specific triggers"
        },
        "Parameters": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Defined parameters for this action"
        },
        "ChainedActions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsAction"
          },
          "title": "Other actions to perform after this one is finished,\nusing the Output of this action as Input for the next.\nIf there are many, it is considered they can be triggered\nin parallel"
        },
        "FailedFilterActions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsAction"
          },
          "title": "If any Filter is used, next actions can be triggered on Failure\nThis adds ability to create conditional Yes/No branches"
        }
      }
    },
    "jobsActionLog": {
      "type": "object",
      "properties": {
        "Action": {
          "$ref": "#/definitions/jobsAction"
        },
        "InputMessage": {
          "$ref": "#/definitions/jobsActionMessage"
        },
        "OutputMessage": {
          "$ref": "#/definitions/jobsActionMessage"
        }
      }
    },
    "jobsActionMessage": {
      "type": "object",
      "properties": {
        "Event": {
          "$ref": "#/definitions/protobufAny",
          "title": "Initial event that triggered the Job"
        },
        "Nodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "One or more Node"
        },
        "Users": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUser"
          },
          "title": "One or more User"
        },
        "Roles": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmRole"
          },
          "title": "One or more Role"
        },
        "Workspaces": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmWorkspace"
          },
          "title": "One or more Workspace"
        },
        "Acls": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmACL"
          },
          "title": "One or more ACL"
        },
        "Activities": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/activityObject"
          },
          "title": "One or more Activity"
        },
        "DataSources": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/objectDataSource"
          },
          "title": "One or more DataSource"
        },
        "OutputChain": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsActionOutput"
          },
          "title": "Stack of ActionOutput messages appended by all previous actions"
        }
      },
      "title": "Message passed along from one action to another, main properties\nare modified by the various actions.\nOutputChain is being stacked up when passing through actions"
    },
    "jobsActionOutput": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean",
          "title": "True if action succeeded"
        },
        "RawBody": {
          "type": "string",
          "format": "byte",
          "title": "Arbitrary bytes sequence"
        },
        "StringBody": {
          "type": "string",
          "title": "Arbitrary string"
        },
        "JsonBody": {
          "type": "string",
          "format": "byte",
          "title": "Arbitrary JSON-encoded bytes"
        },
        "ErrorString": {
          "type": "string",
          "title": "Error"
        },
        "Ignored": {
          "type": "boolean",
          "format": "boolean",
          "title": "If action was returned WithIgnore()"
        },
        "Time": {
          "type": "integer",
          "format": "int32",
          "title": "Time taken to run the action"
        }
      },
      "title": "Standard output of an action. Success value is required\nother are optional"
    },
    "jobsActionOutputFilter": {
      "type": "object",
      "properties": {
        "Query": {
          "$ref": "#/definitions/serviceQuery",
          "title": "Query built from ActionOutputSingleQuery"
        },
        "Label": {
          "type": "string",
          "title": "Selector custom label"
        },
        "Description": {
          "type": "string",
          "title": "Selector additional description"
        }
      },
      "title": "ActionOutputFilter can be used to filter last message output"
    },
    "jobsCommand": {
      "type": "string",
      "enum": [
        "None",
        "Pause",
        "Resume",
        "Stop",
        "Delete",
        "RunOnce",
        "Inactive",
        "Active"
      ],
      "default": "None"
    },
    "jobsContextMetaFilter": {
      "type": "object",
      "properties": {
        "Type": {
          "$ref": "#/definitions/jobsContextMetaFilterType",
          "title": "Type of context filter"
        },
        "Query": {
          "$ref": "#/definitions/serviceQuery",
          "title": "Can be built with ContextMetaSingleQuery"
        },
        "Label": {
          "type": "string",
          "title": "Selector custom label"
        },
        "Description": {
          "type": "string",
          "title": "Selector additional description"
        }
      },
      "title": "PolicyContextFilter can be used to filter request metadata"
    },
    "jobsContextMetaFilterType": {
      "type": "string",
      "enum": [
        "RequestMeta",
        "ContextUser"
      ],
      "default": "RequestMeta"
    },
    "jobsCtrlCommand": {
      "type": "object",
      "properties": {
        "Cmd": {
          "$ref": "#/definitions/jobsCommand",
          "title": "Type of command to send (None, Pause, Resume, Stop, Delete, RunOnce, Inactive, Active)"
        },
        "JobId": {
          "type": "string",
          "title": "Id of the job"
        },
        "TaskId": {
          "type": "string",
          "title": "Id of the associated task"
        },
        "OwnerId": {
          "type": "string",
          "title": "Owner of the job"
        },
        "RunParameters": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Parameters used for RunOnce command"
        }
      },
      "title": "Command sent to control a job or a task"
    },
    "jobsCtrlCommandResponse": {
      "type": "object",
      "properties": {
        "Msg": {
          "type": "string"
        }
      },
      "title": "Response to the CtrlCommand"
    },
    "jobsDataSourceSelector": {
      "type": "object",
      "properties": {
        "Label": {
          "type": "string",
          "title": "Selector custom label"
        },
        "Description": {
          "type": "string",
          "title": "Selector additional description"
        },
        "Type": {
          "$ref": "#/definitions/jobsDataSourceSelectorType",
          "title": "Selector type, either DataSource or Object service"
        },
        "All": {
          "type": "boolean",
          "format": "boolean",
          "title": "Select all"
        },
        "Collect": {
          "type": "boolean",
          "format": "boolean",
          "title": "Collect results"
        },
        "Query": {
          "$ref": "#/definitions/serviceQuery",
          "title": "Composition of DataSourceSingleQueries"
        }
      },
      "title": "Selector/Filter for DataSource objects"
    },
    "jobsDataSourceSelectorType": {
      "type": "string",
      "enum": [
        "DataSource",
        "Object"
      ],
      "default": "DataSource"
    },
    "jobsDeleteTasksRequest": {
      "type": "object",
      "properties": {
        "JobId": {
          "type": "string",
          "title": "Id of the job"
        },
        "TaskID": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Ids of tasks to delete"
        },
        "Status": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsTaskStatus"
          },
          "title": "If no TaskID and/or no JobID are passed, delete tasks by status"
        },
        "PruneLimit": {
          "type": "integer",
          "format": "int32",
          "title": "If deleting by status, optionally keep only a number of tasks"
        }
      }
    },
    "jobsDeleteTasksResponse": {
      "type": "object",
      "properties": {
        "Deleted": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "jobsIdmSelector": {
      "type": "object",
      "properties": {
        "Type": {
          "$ref": "#/definitions/jobsIdmSelectorType",
          "title": "Type of objects to look for"
        },
        "All": {
          "type": "boolean",
          "format": "boolean",
          "title": "Load all objects"
        },
        "Query": {
          "$ref": "#/definitions/serviceQuery",
          "title": "Serialized search query"
        },
        "Collect": {
          "type": "boolean",
          "format": "boolean",
          "title": "Pass a slice of objects to one action, or trigger all actions in parallel"
        },
        "Label": {
          "type": "string",
          "title": "Selector custom label"
        },
        "Description": {
          "type": "string",
          "title": "Selector additional description"
        }
      },
      "title": "Generic container for select/filter idm objects"
    },
    "jobsIdmSelectorType": {
      "type": "string",
      "enum": [
        "User",
        "Role",
        "Workspace",
        "Acl"
      ],
      "default": "User",
      "title": "Possible values for IdmSelector.Type"
    },
    "jobsJob": {
      "type": "object",
      "properties": {
        "ID": {
          "type": "string",
          "title": "Unique ID for this Job"
        },
        "Label": {
          "type": "string",
          "title": "Human-readable Label"
        },
        "Owner": {
          "type": "string",
          "title": "Who created this Job"
        },
        "Inactive": {
          "type": "boolean",
          "format": "boolean",
          "title": "Admin can temporarily disable this job"
        },
        "Custom": {
          "type": "boolean",
          "format": "boolean",
          "title": "Job created by application or by administrator"
        },
        "Languages": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Optional list of languages detected in the context at launch time"
        },
        "EventNames": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "How the job will be triggered.\nOne of these must be set (not exclusive)\nListen to a given set of events"
        },
        "Schedule": {
          "$ref": "#/definitions/jobsSchedule",
          "title": "Schedule a periodic repetition"
        },
        "AutoStart": {
          "type": "boolean",
          "format": "boolean",
          "title": "Start task as soon as job is inserted"
        },
        "AutoClean": {
          "type": "boolean",
          "format": "boolean",
          "title": "Remove job automatically once it is finished (success only)"
        },
        "Actions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsAction"
          },
          "title": "Chain of actions to perform"
        },
        "MaxConcurrency": {
          "type": "integer",
          "format": "int32",
          "title": "Task properties"
        },
        "TasksSilentUpdate": {
          "type": "boolean",
          "format": "boolean",
          "title": "Do not send notification on task update"
        },
        "Tasks": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsTask"
          },
          "title": "Filled with currently running tasks"
        },
        "NodeEventFilter": {
          "$ref": "#/definitions/jobsNodesSelector",
          "title": "Filter out specific events"
        },
        "UserEventFilter": {
          "$ref": "#/definitions/jobsUsersSelector",
          "title": "Deprecated in favor of more generic IdmSelector"
        },
        "IdmFilter": {
          "$ref": "#/definitions/jobsIdmSelector",
          "title": "Idm objects filter"
        },
        "ContextMetaFilter": {
          "$ref": "#/definitions/jobsContextMetaFilter",
          "title": "Event Context Filter"
        },
        "DataSourceFilter": {
          "$ref": "#/definitions/jobsDataSourceSelector",
          "title": "DataSource objects filter"
        },
        "Parameters": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsJobParameter"
          },
          "title": "Job-level parameters that can be passed to underlying actions"
        },
        "ResourcesDependencies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/protobufAny"
          },
          "title": "Additional dependencies that may be required when running the job"
        }
      }
    },
    "jobsJobParameter": {
      "type": "object",
      "properties": {
        "Name": {
          "type": "string",
          "title": "Parameter name"
        },
        "Description": {
          "type": "string",
          "title": "Additional description"
        },
        "Value": {
          "type": "string",
          "title": "Value saved for this parameter"
        },
        "Mandatory": {
          "type": "boolean",
          "format": "boolean",
          "title": "If mandatory, job cannot start without a value"
        },
        "Type": {
          "type": "string",
          "title": "Parameter type used in GUI forms"
        },
        "JsonChoices": {
          "type": "string",
          "title": "Additional data used by GUI elements"
        }
      }
    },
    "jobsListJobsRequest": {
      "type": "object",
      "properties": {
        "Owner": {
          "type": "string",
          "title": "Restrict to a specific owner (current user by default)"
        },
        "EventsOnly": {
          "type": "boolean",
          "format": "boolean",
          "title": "Filter with only event-based jobs"
        },
        "TimersOnly": {
          "type": "boolean",
          "format": "boolean",
          "title": "Filter with only timer-based jobs"
        },
        "LoadTasks": {
          "$ref": "#/definitions/jobsTaskStatus",
          "title": "Load tasks that correspond to the given TaskStatus"
        },
        "JobIDs": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Load jobs by their ID"
        },
        "TasksOffset": {
          "type": "integer",
          "format": "int32",
          "title": "Start listing at a given position"
        },
        "TasksLimit": {
          "type": "integer",
          "format": "int32",
          "title": "Lmit the number of results"
        }
      }
    },
    "jobsNodesSelector": {
      "type": "object",
      "properties": {
        "All": {
          "type": "boolean",
          "format": "boolean",
          "title": "Select all files - ignore any other condition"
        },
        "Pathes": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Preset list of node pathes"
        },
        "Query": {
          "$ref": "#/definitions/serviceQuery",
          "title": "Query to apply to select users (or filter a given node passed by event)"
        },
        "Collect": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether to trigger one action per node or one action\nwith all nodes as selection"
        },
        "Label": {
          "type": "string",
          "title": "Selector custom label"
        },
        "Description": {
          "type": "string",
          "title": "Selector additional description"
        }
      },
      "title": "/////////////////\nJOB  SERVICE  //\n/////////////////"
    },
    "jobsSchedule": {
      "type": "object",
      "properties": {
        "Iso8601Schedule": {
          "type": "string",
          "description": "ISO 8601 Description of the scheduling for instance \"R2/2015-06-04T19:25:16.828696-07:00/PT4S\"\nwhere first part is the number of repetitions (if 0, infinite repetition), \nsecond part the starting date and last part, the duration between 2 occurrences."
        },
        "Iso8601MinDelta": {
          "type": "string",
          "title": "Minimum time between two runs"
        }
      }
    },
    "jobsTask": {
      "type": "object",
      "properties": {
        "ID": {
          "type": "string"
        },
        "JobID": {
          "type": "string"
        },
        "Status": {
          "$ref": "#/definitions/jobsTaskStatus"
        },
        "StatusMessage": {
          "type": "string"
        },
        "TriggerOwner": {
          "type": "string"
        },
        "StartTime": {
          "type": "integer",
          "format": "int32"
        },
        "EndTime": {
          "type": "integer",
          "format": "int32"
        },
        "CanStop": {
          "type": "boolean",
          "format": "boolean",
          "title": "Can be interrupted"
        },
        "CanPause": {
          "type": "boolean",
          "format": "boolean",
          "title": "Can be paused/resumed"
        },
        "HasProgress": {
          "type": "boolean",
          "format": "boolean",
          "title": "Tasks publish a progress"
        },
        "Progress": {
          "type": "number",
          "format": "float",
          "title": "Float value of the progress between 0 and 1"
        },
        "ActionsLogs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsActionLog"
          },
          "title": "Logs of all the actions performed"
        }
      }
    },
    "jobsTaskStatus": {
      "type": "string",
      "enum": [
        "Unknown",
        "Idle",
        "Running",
        "Finished",
        "Interrupted",
        "Paused",
        "Any",
        "Error",
        "Queued"
      ],
      "default": "Unknown",
      "title": "/////////////////\nTASK SERVICE  //\n/////////////////"
    },
    "jobsTriggerFilter": {
      "type": "object",
      "properties": {
        "Label": {
          "type": "string",
          "title": "Filter custom label"
        },
        "Description": {
          "type": "string",
          "title": "Filter additional description"
        },
        "Query": {
          "$ref": "#/definitions/serviceQuery",
          "title": "Filter type"
        }
      },
      "title": "Filter for events, can be applied on action branches"
    },
    "jobsUsersSelector": {
      "type": "object",
      "properties": {
        "All": {
          "type": "boolean",
          "format": "boolean",
          "title": "Select all users"
        },
        "Users": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUser"
          },
          "title": "Preset set of Users"
        },
        "Query": {
          "$ref": "#/definitions/serviceQuery",
          "title": "Filter users using this query"
        },
        "Collect": {
          "type": "boolean",
          "format": "boolean",
          "title": "Wether to trigger one action per user or one action\nwith all user as a selection"
        },
        "Label": {
          "type": "string",
          "title": "Selector custom label"
        },
        "Description": {
          "type": "string",
          "title": "Selector additional description"
        }
      },
      "title": "Select or filter users - should be replaced by more generic IdmSelector"
    },
    "logListLogRequest": {
      "type": "object",
      "properties": {
        "Query": {
          "type": "string",
          "title": "Bleve-type Query stsring"
        },
        "Page": {
          "type": "integer",
          "format": "int32",
          "title": "Start at page"
        },
        "Size": {
          "type": "integer",
          "format": "int32",
          "title": "Number of results"
        },
        "Format": {
          "$ref": "#/definitions/ListLogRequestLogFormat"
        }
      },
      "description": "ListLogRequest launches a parameterised query in the log repository and streams the results."
    },
    "logLogMessage": {
      "type": "object",
      "properties": {
        "Ts": {
          "type": "integer",
          "format": "int32",
          "title": "Generic zap fields"
        },
        "Level": {
          "type": "string"
        },
        "Logger": {
          "type": "string"
        },
        "Msg": {
          "type": "string"
        },
        "MsgId": {
          "type": "string",
          "title": "Pydio specific"
        },
        "UserName": {
          "type": "string",
          "title": "User Info"
        },
        "UserUuid": {
          "type": "string"
        },
        "GroupPath": {
          "type": "string"
        },
        "Profile": {
          "type": "string"
        },
        "RoleUuids": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "RemoteAddress": {
          "type": "string",
          "title": "Client info"
        },
        "UserAgent": {
          "type": "string"
        },
        "HttpProtocol": {
          "type": "string"
        },
        "NodeUuid": {
          "type": "string",
          "title": "Tree Info"
        },
        "NodePath": {
          "type": "string"
        },
        "WsUuid": {
          "type": "string"
        },
        "WsScope": {
          "type": "string"
        },
        "SpanUuid": {
          "type": "string",
          "title": "Span Info"
        },
        "SpanParentUuid": {
          "type": "string"
        },
        "SpanRootUuid": {
          "type": "string"
        },
        "OperationUuid": {
          "type": "string",
          "title": "High Level Operation Info"
        },
        "OperationLabel": {
          "type": "string"
        },
        "SchedulerJobUuid": {
          "type": "string"
        },
        "SchedulerTaskUuid": {
          "type": "string"
        },
        "SchedulerTaskActionPath": {
          "type": "string"
        },
        "JsonZaps": {
          "type": "string",
          "title": "Other Unkown Fields"
        }
      },
      "description": "LogMessage is the format used to transmit log messages to clients via the REST API."
    },
    "mailerMail": {
      "type": "object",
      "properties": {
        "From": {
          "$ref": "#/definitions/mailerUser",
          "title": "User object used to compute the From header"
        },
        "To": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/mailerUser"
          },
          "title": "List of target users to send the mail to"
        },
        "Cc": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/mailerUser"
          },
          "title": "List of target users to put in CC"
        },
        "DateSent": {
          "type": "string",
          "format": "int64",
          "title": "Date of sending"
        },
        "Subject": {
          "type": "string",
          "title": "String used as subject for the email"
        },
        "ContentPlain": {
          "type": "string",
          "title": "Plain-text content used for the body, if not set will be generated from the ContentHtml"
        },
        "ContentHtml": {
          "type": "string",
          "title": "HTML content used for the body"
        },
        "ContentMarkdown": {
          "type": "string",
          "title": "Markdown content used for the body"
        },
        "Attachments": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of attachments"
        },
        "ThreadUuid": {
          "type": "string",
          "title": "Not used, could be used to create conversations"
        },
        "ThreadIndex": {
          "type": "string",
          "title": "Not used, could be used to create conversations"
        },
        "TemplateId": {
          "type": "string",
          "title": "Mail Template Id refers to predefined templates"
        },
        "TemplateData": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Key/values to pass to the template"
        },
        "Retries": {
          "type": "integer",
          "format": "int32",
          "title": "Number of retries after failed attempts (used internally)"
        },
        "sendErrors": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Errors stacked on failed attempts"
        },
        "Sender": {
          "$ref": "#/definitions/mailerUser",
          "title": "User object used to compute the Sender header"
        }
      }
    },
    "mailerSendMailResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "mailerUser": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string"
        },
        "Address": {
          "type": "string"
        },
        "Name": {
          "type": "string"
        },
        "Language": {
          "type": "string"
        }
      }
    },
    "objectDataSource": {
      "type": "object",
      "properties": {
        "Name": {
          "type": "string",
          "title": "Name of the data source (max length 34)"
        },
        "Disabled": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether this data source is disabled or running"
        },
        "StorageType": {
          "$ref": "#/definitions/objectStorageType",
          "title": "Type of underlying storage (LOCAL, S3, AZURE, GCS)"
        },
        "StorageConfiguration": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "List of key values describing storage configuration"
        },
        "ObjectsServiceName": {
          "type": "string",
          "title": "Corresponding objects service name (underlying s3 service)"
        },
        "ObjectsHost": {
          "type": "string",
          "title": "Corresponding objects service host"
        },
        "ObjectsPort": {
          "type": "integer",
          "format": "int32",
          "title": "Corresponding objects service port"
        },
        "ObjectsSecure": {
          "type": "boolean",
          "format": "boolean",
          "title": "Corresponding objects service connection type"
        },
        "ObjectsBucket": {
          "type": "string",
          "title": "Corresponding objects service bucket"
        },
        "ObjectsBaseFolder": {
          "type": "string",
          "title": "Corresponding objects service base folder inside the bucket"
        },
        "ApiKey": {
          "type": "string",
          "title": "Corresponding objects service api key"
        },
        "ApiSecret": {
          "type": "string",
          "title": "Corresponding objects service api secret"
        },
        "PeerAddress": {
          "type": "string",
          "title": "Peer address of the data source"
        },
        "Watch": {
          "type": "boolean",
          "format": "boolean",
          "title": "Not implemented, whether to watch for underlying changes on the FS"
        },
        "FlatStorage": {
          "type": "boolean",
          "format": "boolean",
          "title": "Store data in flat format (object-storage like)"
        },
        "SkipSyncOnRestart": {
          "type": "boolean",
          "format": "boolean",
          "title": "Do not trigger resync at start"
        },
        "EncryptionMode": {
          "$ref": "#/definitions/objectEncryptionMode",
          "title": "Type of encryption applied before sending data to storage"
        },
        "EncryptionKey": {
          "type": "string",
          "title": "Encryption key used for encrypting data"
        },
        "VersioningPolicyName": {
          "type": "string",
          "title": "Versioning policy describes how files are kept in the versioning queue"
        },
        "CreationDate": {
          "type": "integer",
          "format": "int32",
          "title": "Data Source creation date"
        },
        "LastSynchronizationDate": {
          "type": "integer",
          "format": "int32",
          "title": "Data Source last synchronization date"
        }
      },
      "title": "DataSource Object description"
    },
    "objectEncryptionMode": {
      "type": "string",
      "enum": [
        "CLEAR",
        "MASTER",
        "USER",
        "USER_PWD"
      ],
      "default": "CLEAR",
      "title": "Type of Encryption"
    },
    "objectStorageType": {
      "type": "string",
      "enum": [
        "LOCAL",
        "S3",
        "SMB",
        "CELLS",
        "AZURE",
        "GCS",
        "B2",
        "MANTA",
        "SIA"
      ],
      "default": "LOCAL",
      "title": "Type of Gateway"
    },
    "protobufAny": {
      "type": "object",
      "properties": {
        "type_url": {
          "type": "string",
          "description": "A URL/resource name whose content describes the type of the\nserialized protocol buffer message.\n\nFor URLs which use the scheme http, https, or no scheme, the\nfollowing restrictions and interpretations apply:\n\n* If no scheme is provided, https is assumed.\n* The last segment of the URL's path must represent the fully\n  qualified name of the type (as in path/google.protobuf.Duration).\n  The name should be in a canonical form (e.g., leading \".\" is\n  not accepted).\n* An HTTP GET on the URL must yield a [google.protobuf.Type][]\n  value in binary format, or produce an error.\n* Applications are allowed to cache lookup results based on the\n  URL, or have them precompiled into a binary to avoid any\n  lookup. Therefore, binary compatibility needs to be preserved\n  on changes to types. (Use versioned type names to manage\n  breaking changes.)\n\nSchemes other than http, https (or the empty scheme) might be\nused with implementation specific semantics."
        },
        "value": {
          "type": "string",
          "format": "byte",
          "description": "Must be a valid serialized protocol buffer of the above specified type."
        }
      },
      "description": "Any contains an arbitrary serialized protocol buffer message along with a\nURL that describes the type of the serialized message.\n\nProtobuf library provides support to pack/unpack Any values in the form\nof utility functions or additional generated methods of the Any type.\n\nExample 1: Pack and unpack a message in C++.\n\n    Foo foo = ...;\n    Any any;\n    any.PackFrom(foo);\n    ...\n    if (any.UnpackTo(\u0026foo)) {\n      ...\n    }\n\nExample 2: Pack and unpack a message in Java.\n\n    Foo foo = ...;\n    Any any = Any.pack(foo);\n    ...\n    if (any.is(Foo.class)) {\n      foo = any.unpack(Foo.class);\n    }\n\n Example 3: Pack and unpack a message in Python.\n\n    foo = Foo(...)\n    any = Any()\n    any.Pack(foo)\n    ...\n    if any.Is(Foo.DESCRIPTOR):\n      any.Unpack(foo)\n      ...\n\n Example 4: Pack and unpack a message in Go\n\n     foo := \u0026pb.Foo{...}\n     any, err := ptypes.MarshalAny(foo)\n     ...\n     foo := \u0026pb.Foo{}\n     if err := ptypes.UnmarshalAny(any, foo); err != nil {\n       ...\n     }\n\nThe pack methods provided by protobuf library will by default use\n'type.googleapis.com/full.type.name' as the type URL and the unpack\nmethods only use the fully qualified type name after the last '/'\nin the type URL, for example \"foo.bar.com/x/y.z\" will yield type\nname \"y.z\".\n\n\nJSON\n====\nThe JSON representation of an Any value uses the regular\nrepresentation of the deserialized, embedded message, with an\nadditional field @type which contains the type URL. Example:\n\n    package google.profile;\n    message Person {\n      string first_name = 1;\n      string last_name = 2;\n    }\n\n    {\n      \"@type\": \"type.googleapis.com/google.profile.Person\",\n      \"firstName\": \u003cstring\u003e,\n      \"lastName\": \u003cstring\u003e\n    }\n\nIf the embedded message type is well-known and has a custom JSON\nrepresentation, that representation will be embedded adding a field\nvalue which holds the custom JSON in addition to the @type\nfield. Example (for message [google.protobuf.Duration][]):\n\n    {\n      \"@type\": \"type.googleapis.com/google.protobuf.Duration\",\n      \"value\": \"1.212s\"\n    }"
    },
    "restACLCollection": {
      "type": "object",
      "properties": {
        "ACLs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmACL"
          },
          "title": "List of ACLs"
        },
        "Total": {
          "type": "integer",
          "format": "int32",
          "title": "Total number of results"
        }
      },
      "title": "Response for search request"
    },
    "restActionDescription": {
      "type": "object",
      "properties": {
        "Name": {
          "type": "string",
          "title": "Unique name of the action"
        },
        "Icon": {
          "type": "string",
          "title": "Mdi reference name for displaying icon"
        },
        "Label": {
          "type": "string",
          "title": "Human-readable label"
        },
        "Description": {
          "type": "string",
          "title": "Long description and help text"
        },
        "SummaryTemplate": {
          "type": "string",
          "title": "Template for building a short summary of the action configuration"
        },
        "HasForm": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether this action has a form or not"
        },
        "FormModule": {
          "type": "string",
          "title": "JS module name to be used instead of loading standard form"
        },
        "FormModuleProps": {
          "type": "string",
          "title": "JSON props used to init the FormModule (optional)"
        },
        "Category": {
          "type": "string",
          "title": "User-defined category to organize actions list"
        },
        "Tint": {
          "type": "string",
          "title": "User-defined hexa or rgb color"
        },
        "InputDescription": {
          "type": "string",
          "title": "Additional description for expected inputs"
        },
        "OutputDescription": {
          "type": "string",
          "title": "Additional description describing the action output"
        },
        "IsInternal": {
          "type": "boolean",
          "format": "boolean",
          "description": "If action is declared internal, it is hidden to avoid polluting the list."
        }
      }
    },
    "restBackgroundJobResult": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string"
        },
        "Label": {
          "type": "string"
        },
        "NodeUuid": {
          "type": "string"
        }
      }
    },
    "restBulkMetaResponse": {
      "type": "object",
      "properties": {
        "Nodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          }
        },
        "Pagination": {
          "$ref": "#/definitions/restPagination"
        }
      }
    },
    "restCell": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "Unique Id of the Cell"
        },
        "Label": {
          "type": "string",
          "title": "Label of the Cell (max 500 chars)"
        },
        "Description": {
          "type": "string",
          "title": "Long description of the Cell (max 1000 chars)"
        },
        "RootNodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "Nodes attached as roots to this Cell"
        },
        "ACLs": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/restCellAcl"
          },
          "title": "Access control for this Cell"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "Associated access policies"
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether these policies are currently editable"
        }
      },
      "title": "Model for representing a Cell"
    },
    "restCellAcl": {
      "type": "object",
      "properties": {
        "RoleId": {
          "type": "string",
          "title": "Associated Role ID"
        },
        "Actions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmACLAction"
          },
          "title": "List of Acl Actions and their effect"
        },
        "IsUserRole": {
          "type": "boolean",
          "format": "boolean",
          "title": "Flag for detecting if it's a user role or not"
        },
        "User": {
          "$ref": "#/definitions/idmUser",
          "title": "Associated User"
        },
        "Group": {
          "$ref": "#/definitions/idmUser",
          "title": "Associated Group"
        },
        "Role": {
          "$ref": "#/definitions/idmRole",
          "title": "Associated Role"
        }
      },
      "title": "Group collected acls by subjects"
    },
    "restConfiguration": {
      "type": "object",
      "properties": {
        "FullPath": {
          "type": "string",
          "title": "Full slash-separated path to the config key"
        },
        "Data": {
          "type": "string",
          "title": "JSON-encoded data to store"
        }
      },
      "title": "Configuration message. Data is an Json representation of any value"
    },
    "restControlServiceRequest": {
      "type": "object",
      "properties": {
        "ServiceName": {
          "type": "string",
          "title": "Name of the service to stop"
        },
        "NodeName": {
          "type": "string",
          "title": "Name of the node"
        },
        "Command": {
          "$ref": "#/definitions/ctlServiceCommand",
          "title": "Command to apply (START or STOP)"
        }
      }
    },
    "restCreateNodesRequest": {
      "type": "object",
      "properties": {
        "Nodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "A list of nodes that must be created"
        },
        "Recursive": {
          "type": "boolean",
          "format": "boolean",
          "title": "If nodes are created inside non-existing folders, whether the parents should be created automatically or not"
        },
        "TemplateUUID": {
          "type": "string",
          "title": "Use a template to create this node"
        }
      }
    },
    "restCreatePeerFolderRequest": {
      "type": "object",
      "properties": {
        "PeerAddress": {
          "type": "string",
          "title": "Restrict listing to a given peer"
        },
        "Path": {
          "type": "string",
          "title": "Path to the folder to be created"
        }
      }
    },
    "restCreatePeerFolderResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "Node": {
          "$ref": "#/definitions/treeNode"
        }
      }
    },
    "restCreateSelectionRequest": {
      "type": "object",
      "properties": {
        "Nodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "Create a temporary selection out of this list of nodes"
        },
        "TargetAction": {
          "type": "string",
          "title": "Associated target action for this selection"
        },
        "Persist": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether to save the selection or just get a temporary Uuid in return"
        }
      }
    },
    "restCreateSelectionResponse": {
      "type": "object",
      "properties": {
        "SelectionUUID": {
          "type": "string"
        },
        "Nodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          }
        }
      }
    },
    "restDataSourceCollection": {
      "type": "object",
      "properties": {
        "DataSources": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/objectDataSource"
          }
        },
        "Total": {
          "type": "integer",
          "format": "int32"
        }
      },
      "title": "Collection of datasources"
    },
    "restDeleteCellResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean",
          "title": "Delete result"
        }
      }
    },
    "restDeleteDataSourceResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "restDeleteNodesRequest": {
      "type": "object",
      "properties": {
        "Nodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "List of nodes to delete"
        },
        "Recursive": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether to delete all the children if node is a folder"
        },
        "RemovePermanently": {
          "type": "boolean",
          "format": "boolean",
          "title": "Force permanent deletion even if a recycle bin is defined"
        }
      }
    },
    "restDeleteNodesResponse": {
      "type": "object",
      "properties": {
        "DeleteJobs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restBackgroundJobResult"
          }
        }
      }
    },
    "restError": {
      "type": "object",
      "properties": {
        "Code": {
          "type": "string",
          "title": "Unique ID of the error"
        },
        "Title": {
          "type": "string",
          "title": "Human-readable, short label"
        },
        "Detail": {
          "type": "string",
          "title": "Human-readable, longer description"
        },
        "Source": {
          "type": "string",
          "title": "Cells service name or other quickly useful info"
        },
        "Meta": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Additional Metadata"
        }
      },
      "title": "Generic error message"
    },
    "restDeleteResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean",
          "title": "If delete was successfull"
        },
        "NumRows": {
          "type": "string",
          "format": "int64",
          "title": "Number of records deleted during operation"
        }
      },
      "title": "Generic Message"
    },
    "restDeleteShareLinkResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean",
          "title": "If delete sucess or failed"
        }
      },
      "title": "Response for deleting a share link"
    },
    "restDeleteUserMetaTagsResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "restDiscoveryResponse": {
      "type": "object",
      "properties": {
        "PackageType": {
          "type": "string",
          "title": "Current Package Type, empty if user is not authenticated"
        },
        "PackageLabel": {
          "type": "string",
          "title": "Current Package Label, empty if user is not authenticated"
        },
        "Version": {
          "type": "string",
          "title": "Current Package Version, empty if user is not authenticated"
        },
        "BuildStamp": {
          "type": "integer",
          "format": "int32",
          "title": "Build stamp of the binary build, empty if user is not authenticated"
        },
        "BuildRevision": {
          "type": "string",
          "title": "Revision of the current binary build, empty if user is not authenticated"
        },
        "Endpoints": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "List of endpoints and their corresponding URL access. Special case for grpc that just send back its port"
        }
      }
    },
    "restDocumentAccessTokenRequest": {
      "type": "object",
      "properties": {
        "Path": {
          "type": "string"
        },
        "ClientID": {
          "type": "string"
        }
      }
    },
    "restDocumentAccessTokenResponse": {
      "type": "object",
      "properties": {
        "AccessToken": {
          "type": "string"
        }
      }
    },
    "restFrontBinaryRequest": {
      "type": "object",
      "properties": {
        "BinaryType": {
          "type": "string",
          "title": "Currently supported values are USER and GLOBAL"
        },
        "Uuid": {
          "type": "string",
          "title": "Id of the binary"
        }
      },
      "title": "Download binary"
    },
    "restFrontBinaryResponse": {
      "type": "object",
      "title": "Not used, endpoint returns octet-stream"
    },
    "restFrontBootConfResponse": {
      "type": "object",
      "properties": {
        "JsonData": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    },
    "restFrontEnrollAuthRequest": {
      "type": "object",
      "properties": {
        "EnrollType": {
          "type": "string"
        },
        "EnrollInfo": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    },
    "restFrontEnrollAuthResponse": {
      "type": "object",
      "properties": {
        "Info": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Any parameters can be returned"
        }
      }
    },
    "restFrontMessagesResponse": {
      "type": "object",
      "properties": {
        "Messages": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    },
    "restFrontPluginsResponse": {
      "type": "object"
    },
    "restFrontSessionRequest": {
      "type": "object",
      "properties": {
        "ClientTime": {
          "type": "integer",
          "format": "int32",
          "title": "Time reference for computing jwt expiry"
        },
        "AuthInfo": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Data sent back by specific auth steps"
        },
        "Logout": {
          "type": "boolean",
          "format": "boolean",
          "title": "Kill session now"
        }
      }
    },
    "restFrontSessionResponse": {
      "type": "object",
      "properties": {
        "JWT": {
          "type": "string",
          "title": "Legacy information (now in token)"
        },
        "ExpireTime": {
          "type": "integer",
          "format": "int32"
        },
        "Trigger": {
          "type": "string",
          "title": "Trigger a specific Auth step"
        },
        "TriggerInfo": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "Additional data for the trigger"
        },
        "Token": {
          "$ref": "#/definitions/authToken"
        },
        "RedirectTo": {
          "type": "string"
        },
        "Error": {
          "type": "string"
        }
      }
    },
    "restFrontStateResponse": {
      "type": "object"
    },
    "restGetBulkMetaRequest": {
      "type": "object",
      "properties": {
        "NodePaths": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of node paths to query (use paths ending with /* to load the children)"
        },
        "AllMetaProviders": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether to query all services for the metadata they can contribute to enrich the node"
        },
        "Versions": {
          "type": "boolean",
          "format": "boolean",
          "title": "Load Versions of the given node"
        },
        "Offset": {
          "type": "integer",
          "format": "int32",
          "title": "Start listing at a given position"
        },
        "Limit": {
          "type": "integer",
          "format": "int32",
          "title": "Limit number of results"
        }
      }
    },
    "restHeadNodeResponse": {
      "type": "object",
      "properties": {
        "Node": {
          "$ref": "#/definitions/treeNode"
        }
      }
    },
    "restListPeerFoldersRequest": {
      "type": "object",
      "properties": {
        "PeerAddress": {
          "type": "string",
          "title": "Restrict listing to a given peer"
        },
        "Path": {
          "type": "string",
          "title": "Path to the parent folder for listing"
        }
      }
    },
    "restListPeersAddressesResponse": {
      "type": "object",
      "properties": {
        "PeerAddresses": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of peer addresses"
        }
      }
    },
    "restListProcessesRequest": {
      "type": "object",
      "properties": {
        "PeerId": {
          "type": "string",
          "title": "Id of the peer node"
        },
        "ServiceName": {
          "type": "string",
          "title": "Look for a service name"
        }
      }
    },
    "restListProcessesResponse": {
      "type": "object",
      "properties": {
        "Processes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restProcess"
          }
        }
      }
    },
    "restListSharedResourcesRequest": {
      "type": "object",
      "properties": {
        "ShareType": {
          "$ref": "#/definitions/ListSharedResourcesRequestListShareType",
          "title": "Filter output to a given type"
        },
        "Subject": {
          "type": "string",
          "title": "Will restrict the list to the shares readable by a specific subject.\nIn user-context, current user is used by default. In admin-context, this can\nbe any resource policy subject"
        },
        "OwnedBySubject": {
          "type": "boolean",
          "format": "boolean",
          "title": "If true, will also check filter the output to shares actually owned by subject"
        },
        "Offset": {
          "type": "integer",
          "format": "int32",
          "title": "Start listing at a given offset"
        },
        "Limit": {
          "type": "integer",
          "format": "int32",
          "title": "Limit number of results"
        }
      }
    },
    "restListSharedResourcesResponse": {
      "type": "object",
      "properties": {
        "Resources": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ListSharedResourcesResponseSharedResource"
          },
          "title": "Actual results"
        },
        "Offset": {
          "type": "integer",
          "format": "int32",
          "title": "Cursor informations"
        },
        "Limit": {
          "type": "integer",
          "format": "int32"
        },
        "Total": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "restListSitesResponse": {
      "type": "object",
      "properties": {
        "Sites": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/installProxyConfig"
          }
        }
      },
      "title": "Response with declared sites"
    },
    "restListStorageBucketsRequest": {
      "type": "object",
      "properties": {
        "DataSource": {
          "$ref": "#/definitions/objectDataSource"
        },
        "BucketsRegexp": {
          "type": "string"
        }
      }
    },
    "restListTemplatesResponse": {
      "type": "object",
      "properties": {
        "Templates": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restTemplate"
          }
        }
      }
    },
    "restListUserMetaTagsResponse": {
      "type": "object",
      "properties": {
        "Tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of existing tags values"
        }
      }
    },
    "restLogMessageCollection": {
      "type": "object",
      "properties": {
        "Logs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/logLogMessage"
          }
        }
      },
      "title": "Collection of serialized log messages"
    },
    "restMetaCollection": {
      "type": "object",
      "properties": {
        "NodePath": {
          "type": "string"
        },
        "Metadatas": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restMetadata"
          }
        }
      }
    },
    "restMetaNamespaceRequest": {
      "type": "object",
      "properties": {
        "NodePath": {
          "type": "string",
          "title": "Path to the requested node"
        },
        "Namespace": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of namespaces to load"
        }
      }
    },
    "restMetadata": {
      "type": "object",
      "properties": {
        "Namespace": {
          "type": "string"
        },
        "JsonMeta": {
          "type": "string"
        }
      }
    },
    "restNodesCollection": {
      "type": "object",
      "properties": {
        "Parent": {
          "$ref": "#/definitions/treeNode"
        },
        "Children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          }
        }
      }
    },
    "restOpenApiResponse": {
      "type": "object"
    },
    "restPagination": {
      "type": "object",
      "properties": {
        "Limit": {
          "type": "integer",
          "format": "int32",
          "title": "Current Limit parameter, either passed by request or default value"
        },
        "CurrentOffset": {
          "type": "integer",
          "format": "int32",
          "title": "Current Offset value"
        },
        "Total": {
          "type": "integer",
          "format": "int32",
          "title": "Total number of records"
        },
        "CurrentPage": {
          "type": "integer",
          "format": "int32",
          "title": "Current number of Page"
        },
        "TotalPages": {
          "type": "integer",
          "format": "int32",
          "title": "Number of detected pages"
        },
        "NextOffset": {
          "type": "integer",
          "format": "int32",
          "title": "Offset value for next page if there is one"
        },
        "PrevOffset": {
          "type": "integer",
          "format": "int32",
          "title": "Offset value for previous page, if there is one"
        }
      },
      "title": "Generic container for responses sending pagination information"
    },
    "restProcess": {
      "type": "object",
      "properties": {
        "ID": {
          "type": "string",
          "title": "Process ID"
        },
        "ParentID": {
          "type": "string",
          "title": "Parent Process ID"
        },
        "MetricsPort": {
          "type": "integer",
          "format": "int32",
          "title": "Port to access the metrics api"
        },
        "PeerId": {
          "type": "string",
          "title": "Id of peer node"
        },
        "PeerAddress": {
          "type": "string",
          "title": "Address of peer node"
        },
        "StartTag": {
          "type": "string",
          "title": "Parameters used to start this process"
        },
        "Services": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "List of services running inside this process"
        }
      }
    },
    "restPutCellRequest": {
      "type": "object",
      "properties": {
        "Room": {
          "$ref": "#/definitions/restCell",
          "title": "Content of the Cell (Room is legacy name)"
        },
        "CreateEmptyRoot": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether to create a dedicated folder for this cell at creation"
        }
      },
      "title": "Request for creating a Cell"
    },
    "restPutShareLinkRequest": {
      "type": "object",
      "properties": {
        "ShareLink": {
          "$ref": "#/definitions/restShareLink",
          "title": "Content of the link to create"
        },
        "PasswordEnabled": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether it has Password enabled"
        },
        "CreatePassword": {
          "type": "string",
          "title": "Set if switching from no password to password"
        },
        "UpdatePassword": {
          "type": "string",
          "title": "Set if updating an existing password"
        },
        "UpdateCustomHash": {
          "type": "string",
          "title": "Change the ShareLink Hash with a custom value"
        }
      },
      "title": "Request for create/update a link"
    },
    "restPutUserMetaTagRequest": {
      "type": "object",
      "properties": {
        "Namespace": {
          "type": "string",
          "title": "Add a tag value for this namespace"
        },
        "Tag": {
          "type": "string",
          "title": "New tag value"
        }
      }
    },
    "restPutUserMetaTagResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean",
          "title": "Operation success"
        }
      }
    },
    "restRelationResponse": {
      "type": "object",
      "properties": {
        "SharedCells": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmWorkspace"
          }
        },
        "BelongsToTeams": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmRole"
          }
        }
      }
    },
    "restResetPasswordRequest": {
      "type": "object",
      "properties": {
        "ResetPasswordToken": {
          "type": "string",
          "title": "Token generated by the previous step of the reset password workflow"
        },
        "UserLogin": {
          "type": "string",
          "title": "User Login"
        },
        "NewPassword": {
          "type": "string",
          "title": "New password to be stored for this user"
        }
      }
    },
    "restResetPasswordResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "Message": {
          "type": "string"
        }
      }
    },
    "restResetPasswordTokenResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "Message": {
          "type": "string"
        }
      }
    },
    "restResourcePolicyQuery": {
      "type": "object",
      "properties": {
        "Type": {
          "$ref": "#/definitions/ResourcePolicyQueryQueryType",
          "title": "The type can be CONTEXT, ANY, NODE or USER. This restricts the may filter out the result set based on their policies"
        },
        "UserId": {
          "type": "string",
          "title": "Limit to one given user ID"
        }
      },
      "title": "Generic Query for limiting results based on resource permissions"
    },
    "restRestoreNodesRequest": {
      "type": "object",
      "properties": {
        "Nodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "Restore this node from the recycle bin to its original location"
        }
      }
    },
    "restRestoreNodesResponse": {
      "type": "object",
      "properties": {
        "RestoreJobs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restBackgroundJobResult"
          }
        }
      }
    },
    "restRevokeRequest": {
      "type": "object",
      "properties": {
        "TokenId": {
          "type": "string",
          "title": "Pass a specific Token ID to be revoked. If empty, request will use current JWT"
        }
      },
      "title": "Rest request for revocation. Token is not mandatory, if not set\nrequest will use current JWT token"
    },
    "restRevokeResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "Message": {
          "type": "string"
        }
      },
      "title": "Rest response"
    },
    "restRolesCollection": {
      "type": "object",
      "properties": {
        "Roles": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmRole"
          },
          "title": "List of Roles"
        },
        "Total": {
          "type": "integer",
          "format": "int32",
          "title": "Total in DB"
        }
      },
      "title": "Roles Collection"
    },
    "restSchedulerActionFormResponse": {
      "type": "object"
    },
    "restSchedulerActionsResponse": {
      "type": "object",
      "properties": {
        "Actions": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/restActionDescription"
          },
          "title": "List of all registered actions"
        }
      }
    },
    "restSearchACLRequest": {
      "type": "object",
      "properties": {
        "Queries": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmACLSingleQuery"
          },
          "title": "Atomic queries that will be combined using the OperationType (AND or OR)"
        },
        "Offset": {
          "type": "string",
          "format": "int64",
          "title": "Start listing at a given position"
        },
        "Limit": {
          "type": "string",
          "format": "int64",
          "title": "Limit the number of results"
        },
        "GroupBy": {
          "type": "integer",
          "format": "int32",
          "title": "Group results"
        },
        "CountOnly": {
          "type": "boolean",
          "format": "boolean",
          "title": "Return counts only, no actual results"
        },
        "Operation": {
          "$ref": "#/definitions/serviceOperationType",
          "title": "Single queries will be combined using this operation AND or OR logic"
        }
      },
      "title": "Rest request for ACL's"
    },
    "restSearchResults": {
      "type": "object",
      "properties": {
        "Results": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          }
        },
        "Facets": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeSearchFacet"
          }
        },
        "Total": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "restSearchRoleRequest": {
      "type": "object",
      "properties": {
        "Queries": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmRoleSingleQuery"
          },
          "title": "List of atomic queries that will be combined using the Operation type (AND / OR)"
        },
        "ResourcePolicyQuery": {
          "$ref": "#/definitions/restResourcePolicyQuery",
          "title": "Policies query for specifying the search context"
        },
        "Offset": {
          "type": "string",
          "format": "int64",
          "title": "Start listing at a given position"
        },
        "Limit": {
          "type": "string",
          "format": "int64",
          "title": "Limit number of results"
        },
        "GroupBy": {
          "type": "integer",
          "format": "int32",
          "title": "Group results by"
        },
        "CountOnly": {
          "type": "boolean",
          "format": "boolean",
          "title": "Return counts only, no actual results"
        },
        "Operation": {
          "$ref": "#/definitions/serviceOperationType",
          "title": "Combine Single Queries with AND or OR"
        }
      },
      "title": "Roles Search"
    },
    "restSearchUserRequest": {
      "type": "object",
      "properties": {
        "Queries": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUserSingleQuery"
          },
          "title": "Atomic queries that will be combined using the Operation Type (AND or OR)"
        },
        "ResourcePolicyQuery": {
          "$ref": "#/definitions/restResourcePolicyQuery",
          "title": "Policies queries to filter the search context"
        },
        "Offset": {
          "type": "string",
          "format": "int64",
          "title": "Start listing at a given position"
        },
        "Limit": {
          "type": "string",
          "format": "int64",
          "title": "Limit number of results"
        },
        "GroupBy": {
          "type": "integer",
          "format": "int32",
          "description": "Group by ..."
        },
        "CountOnly": {
          "type": "boolean",
          "format": "boolean",
          "title": "Return counts only, no actual results"
        },
        "Operation": {
          "$ref": "#/definitions/serviceOperationType",
          "title": "Combine single queries with AND or OR logic"
        }
      },
      "title": "Users Search"
    },
    "restSearchWorkspaceRequest": {
      "type": "object",
      "properties": {
        "Queries": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmWorkspaceSingleQuery"
          },
          "title": "Atomic queries that will be combined using the OperationType (AND or OR)"
        },
        "ResourcePolicyQuery": {
          "$ref": "#/definitions/restResourcePolicyQuery",
          "title": "Policies queries to filter the search context"
        },
        "Offset": {
          "type": "string",
          "format": "int64",
          "title": "Start listing at a given position"
        },
        "Limit": {
          "type": "string",
          "format": "int64",
          "title": "Limit the number of results"
        },
        "GroupBy": {
          "type": "integer",
          "format": "int32",
          "title": "Group results"
        },
        "CountOnly": {
          "type": "boolean",
          "format": "boolean",
          "title": "Return counts only, no actual results"
        },
        "Operation": {
          "$ref": "#/definitions/serviceOperationType",
          "title": "Single queries will be combined using this operation AND or OR logic"
        }
      },
      "title": "Rest request for searching workspaces"
    },
    "restServiceCollection": {
      "type": "object",
      "properties": {
        "Services": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ctlService"
          }
        },
        "Total": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "restSettingsAccess": {
      "type": "object",
      "properties": {
        "Label": {
          "type": "string"
        },
        "Description": {
          "type": "string"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restSettingsAccessRestPolicy"
          }
        }
      }
    },
    "restSettingsAccessRestPolicy": {
      "type": "object",
      "properties": {
        "Action": {
          "type": "string"
        },
        "Resource": {
          "type": "string"
        }
      }
    },
    "restSettingsEntry": {
      "type": "object",
      "properties": {
        "Key": {
          "type": "string"
        },
        "Label": {
          "type": "string"
        },
        "Description": {
          "type": "string"
        },
        "Manager": {
          "type": "string"
        },
        "Alias": {
          "type": "string"
        },
        "Metadata": {
          "$ref": "#/definitions/restSettingsEntryMeta"
        },
        "Accesses": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/restSettingsAccess"
          }
        },
        "Feature": {
          "type": "string"
        }
      }
    },
    "restSettingsEntryMeta": {
      "type": "object",
      "properties": {
        "IconClass": {
          "type": "string"
        },
        "Component": {
          "type": "string"
        },
        "Props": {
          "type": "string"
        },
        "Advanced": {
          "type": "boolean",
          "format": "boolean"
        },
        "Indexed": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "restSettingsMenuResponse": {
      "type": "object",
      "properties": {
        "RootMetadata": {
          "$ref": "#/definitions/restSettingsEntryMeta"
        },
        "Sections": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restSettingsSection"
          }
        }
      }
    },
    "restSettingsSection": {
      "type": "object",
      "properties": {
        "Key": {
          "type": "string"
        },
        "Label": {
          "type": "string"
        },
        "Description": {
          "type": "string"
        },
        "Children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restSettingsEntry"
          }
        }
      }
    },
    "restShareLink": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "Internal identifier of the link"
        },
        "LinkHash": {
          "type": "string",
          "title": "Unique Hash for accessing the link"
        },
        "LinkUrl": {
          "type": "string",
          "title": "Full URL for accessing the link"
        },
        "Label": {
          "type": "string",
          "title": "Label of the Link (max 500 chars)"
        },
        "Description": {
          "type": "string",
          "title": "Description of the Link (max 1000 chars)"
        },
        "UserUuid": {
          "type": "string",
          "title": "Temporary user Uuid used to login automatically when accessing this link"
        },
        "UserLogin": {
          "type": "string",
          "title": "Temporary user Login used to login automatically when accessing this link"
        },
        "PasswordRequired": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether a password is required or not to access the link"
        },
        "AccessStart": {
          "type": "string",
          "format": "int64",
          "title": "Timestamp of start date for enabling the share (not implemented yet)"
        },
        "AccessEnd": {
          "type": "string",
          "format": "int64",
          "title": "Timestamp after which the share is disabled"
        },
        "MaxDownloads": {
          "type": "string",
          "format": "int64",
          "title": "Maximum number of downloads until expiration"
        },
        "CurrentDownloads": {
          "type": "string",
          "format": "int64",
          "title": "Current number of downloads"
        },
        "ViewTemplateName": {
          "type": "string",
          "title": "Display Template for loading the public link"
        },
        "TargetUsers": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/restShareLinkTargetUser"
          },
          "title": "TargetUsers can be used to restrict access"
        },
        "RestrictToTargetUsers": {
          "type": "boolean",
          "format": "boolean",
          "title": "RestrictToTargetUsers enable users restriction"
        },
        "RootNodes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeNode"
          },
          "title": "Nodes in the tree that serve as root to this link"
        },
        "Permissions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restShareLinkAccessType"
          },
          "title": "Specific permissions for public links"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "Security policies"
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether policies are currently editable or not"
        }
      },
      "title": "Model for representing a public link"
    },
    "restShareLinkAccessType": {
      "type": "string",
      "enum": [
        "NoAccess",
        "Preview",
        "Download",
        "Upload"
      ],
      "default": "NoAccess",
      "title": "Known values for link permissions"
    },
    "restShareLinkTargetUser": {
      "type": "object",
      "properties": {
        "Display": {
          "type": "string"
        },
        "DownloadCount": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "restSubscriptionsCollection": {
      "type": "object",
      "properties": {
        "subscriptions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/activitySubscription"
          }
        }
      }
    },
    "restTemplate": {
      "type": "object",
      "properties": {
        "UUID": {
          "type": "string",
          "title": "Unique identifier for this template"
        },
        "Label": {
          "type": "string",
          "title": "Human friendly label"
        },
        "Node": {
          "$ref": "#/definitions/restTemplateNode",
          "title": "Template node, can be a file or a tree of folders"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "Associated policies"
        }
      },
      "title": "A template can be used to create files or tree from scratch"
    },
    "restTemplateNode": {
      "type": "object",
      "properties": {
        "IsFile": {
          "type": "boolean",
          "format": "boolean",
          "title": "Whether it's a file or a folder"
        },
        "BinaryUUUID": {
          "type": "string",
          "title": "If stored in binary store, the binary Uuid"
        },
        "EmbedPath": {
          "type": "string",
          "title": "If it's embedded in binary"
        },
        "Children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/restTemplateNode"
          },
          "title": "One or more children"
        }
      },
      "title": "A template node is representing a file or a folder"
    },
    "restUpdateSharePoliciesRequest": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "Cell or Link UUID"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          },
          "title": "List of policies to update"
        }
      }
    },
    "restUpdateSharePoliciesResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/serviceResourcePolicy"
          }
        },
        "PoliciesContextEditable": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "restUserBookmarksRequest": {
      "type": "object"
    },
    "restUserJobRequest": {
      "type": "object",
      "properties": {
        "JobName": {
          "type": "string",
          "title": "Name of the job to create in the user space"
        },
        "JsonParameters": {
          "type": "string",
          "title": "Json-encoded parameters for this job"
        }
      }
    },
    "restUserJobResponse": {
      "type": "object",
      "properties": {
        "JobUuid": {
          "type": "string"
        }
      }
    },
    "restUserJobsCollection": {
      "type": "object",
      "properties": {
        "Jobs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/jobsJob"
          }
        }
      }
    },
    "restUserMetaCollection": {
      "type": "object",
      "properties": {
        "Metadatas": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUserMeta"
          }
        }
      },
      "title": "Collection of UserMeta"
    },
    "restUserMetaNamespaceCollection": {
      "type": "object",
      "properties": {
        "Namespaces": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUserMetaNamespace"
          },
          "title": "List of user meta Namespaces"
        }
      },
      "title": "Collection of Meta Namespaces"
    },
    "restUserStateResponse": {
      "type": "object",
      "properties": {
        "Workspaces": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmWorkspace"
          }
        },
        "WorkspacesAccesses": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    },
    "restUsersCollection": {
      "type": "object",
      "properties": {
        "Groups": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUser"
          },
          "title": "List of Groups"
        },
        "Users": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmUser"
          },
          "title": "List of Users"
        },
        "Total": {
          "type": "integer",
          "format": "int32",
          "title": "Total number of results"
        }
      },
      "title": "Users Collection"
    },
    "restVersioningPolicyCollection": {
      "type": "object",
      "properties": {
        "Policies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeVersioningPolicy"
          }
        }
      }
    },
    "restWorkspaceCollection": {
      "type": "object",
      "properties": {
        "Workspaces": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/idmWorkspace"
          },
          "title": "List of workspaces"
        },
        "Total": {
          "type": "integer",
          "format": "int32",
          "title": "Total number of results"
        }
      },
      "title": "Rest response for workspace search"
    },
    "serviceOperationType": {
      "type": "string",
      "enum": [
        "OR",
        "AND"
      ],
      "default": "OR"
    },
    "serviceQuery": {
      "type": "object",
      "properties": {
        "SubQueries": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/protobufAny"
          }
        },
        "Operation": {
          "$ref": "#/definitions/serviceOperationType"
        },
        "ResourcePolicyQuery": {
          "$ref": "#/definitions/serviceResourcePolicyQuery"
        },
        "Offset": {
          "type": "string",
          "format": "int64"
        },
        "Limit": {
          "type": "string",
          "format": "int64"
        },
        "groupBy": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "serviceResourcePolicy": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "int64"
        },
        "Resource": {
          "type": "string"
        },
        "Action": {
          "$ref": "#/definitions/serviceResourcePolicyAction"
        },
        "Subject": {
          "type": "string"
        },
        "Effect": {
          "$ref": "#/definitions/serviceResourcePolicyPolicyEffect"
        },
        "JsonConditions": {
          "type": "string"
        }
      }
    },
    "serviceResourcePolicyAction": {
      "type": "string",
      "enum": [
        "ANY",
        "OWNER",
        "READ",
        "WRITE",
        "EDIT_RULES"
      ],
      "default": "ANY"
    },
    "serviceResourcePolicyPolicyEffect": {
      "type": "string",
      "enum": [
        "deny",
        "allow"
      ],
      "default": "deny"
    },
    "serviceResourcePolicyQuery": {
      "type": "object",
      "properties": {
        "Subjects": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "Empty": {
          "type": "boolean",
          "format": "boolean"
        },
        "Any": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "treeChangeLog": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "Unique commit ID"
        },
        "Description": {
          "type": "string",
          "title": "Human-readable description of what happened"
        },
        "MTime": {
          "type": "string",
          "format": "int64",
          "title": "Unix Timestamp"
        },
        "Size": {
          "type": "string",
          "format": "int64",
          "title": "Content Size at that moment"
        },
        "Data": {
          "type": "string",
          "format": "byte",
          "title": "Arbitrary additional data"
        },
        "OwnerUuid": {
          "type": "string",
          "title": "Who performed this action"
        },
        "Event": {
          "$ref": "#/definitions/treeNodeChangeEvent",
          "title": "Event that triggered this change"
        },
        "Location": {
          "$ref": "#/definitions/treeNode",
          "title": "Actual location of the stored version"
        }
      }
    },
    "treeGeoPoint": {
      "type": "object",
      "properties": {
        "Lat": {
          "type": "number",
          "format": "double"
        },
        "Lon": {
          "type": "number",
          "format": "double"
        }
      }
    },
    "treeGeoQuery": {
      "type": "object",
      "properties": {
        "Center": {
          "$ref": "#/definitions/treeGeoPoint",
          "title": "Either use a center point and a distance"
        },
        "Distance": {
          "type": "string",
          "description": "Example formats supported:\n\"5in\" \"5inch\" \"7yd\" \"7yards\" \"9ft\" \"9feet\" \"11km\" \"11kilometers\"\n\"3nm\" \"3nauticalmiles\" \"13mm\" \"13millimeters\" \"15cm\" \"15centimeters\"\n\"17mi\" \"17miles\" \"19m\" \"19meters\"\nIf the unit cannot be determined, the entire string is parsed and the\nunit of meters is assumed."
        },
        "TopLeft": {
          "$ref": "#/definitions/treeGeoPoint",
          "title": "Or use a bounding box with TopLeft and BottomRight points"
        },
        "BottomRight": {
          "$ref": "#/definitions/treeGeoPoint"
        }
      }
    },
    "treeListNodesRequest": {
      "type": "object",
      "properties": {
        "Node": {
          "$ref": "#/definitions/treeNode",
          "title": "Main node used as a parent"
        },
        "Recursive": {
          "type": "boolean",
          "format": "boolean",
          "title": "Send back all children of the node"
        },
        "Ancestors": {
          "type": "boolean",
          "format": "boolean",
          "title": "Send back a list of parent nodes, until the root, including the original node"
        },
        "WithVersions": {
          "type": "boolean",
          "format": "boolean",
          "title": "Sends the list of versions for a given node"
        },
        "WithCommits": {
          "type": "boolean",
          "format": "boolean",
          "title": "Sends the list of commits for a given node (not used)"
        },
        "Limit": {
          "type": "string",
          "format": "int64",
          "title": "Limit the number of results"
        },
        "Offset": {
          "type": "string",
          "format": "int64",
          "title": "Start listing at a given position"
        },
        "FilterType": {
          "$ref": "#/definitions/treeNodeType",
          "title": "Filter by node type (LEAF / COLLECTION)"
        }
      }
    },
    "treeNode": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string",
          "title": "------------------------------------\nCore identification of the node\n------------------------------------"
        },
        "Path": {
          "type": "string"
        },
        "Type": {
          "$ref": "#/definitions/treeNodeType"
        },
        "Size": {
          "type": "string",
          "format": "int64",
          "title": "Size of the file, or cumulated size of folder"
        },
        "MTime": {
          "type": "string",
          "format": "int64",
          "title": "Last modification Timestamp"
        },
        "Mode": {
          "type": "integer",
          "format": "int32",
          "title": "Permission mode, like 0777"
        },
        "Etag": {
          "type": "string",
          "title": "Hash of the content if node is a LEAF, Uuid or"
        },
        "Commits": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeChangeLog"
          },
          "title": "List of successive commits"
        },
        "MetaStore": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "------------------------------------\nThen a free K =\u003e V representation of any kind of metadata\n------------------------------------"
        },
        "AppearsIn": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeWorkspaceRelativePath"
          },
          "title": "Can be used for output when node is appearing in multiple workspaces"
        }
      }
    },
    "treeNodeChangeEvent": {
      "type": "object",
      "properties": {
        "Type": {
          "$ref": "#/definitions/NodeChangeEventEventType"
        },
        "Source": {
          "$ref": "#/definitions/treeNode"
        },
        "Target": {
          "$ref": "#/definitions/treeNode"
        },
        "Metadata": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        },
        "Silent": {
          "type": "boolean",
          "format": "boolean"
        },
        "Optimistic": {
          "type": "boolean",
          "format": "boolean"
        }
      }
    },
    "treeNodeType": {
      "type": "string",
      "enum": [
        "UNKNOWN",
        "LEAF",
        "COLLECTION"
      ],
      "default": "UNKNOWN",
      "title": "==========================================================\n* Standard Messages\n=========================================================="
    },
    "treeQuery": {
      "type": "object",
      "properties": {
        "Paths": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Preset list of nodes by Path"
        },
        "PathPrefix": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Limit to a given subtree"
        },
        "MinSize": {
          "type": "string",
          "format": "int64",
          "title": "Range for size"
        },
        "MaxSize": {
          "type": "string",
          "format": "int64"
        },
        "MinDate": {
          "type": "string",
          "format": "int64",
          "title": "Range for date"
        },
        "MaxDate": {
          "type": "string",
          "format": "int64"
        },
        "DurationDate": {
          "type": "string",
          "title": "Pass a duration with \u003e or \u003c to compute MinDate / MaxDate"
        },
        "Type": {
          "$ref": "#/definitions/treeNodeType",
          "title": "Limit to a given node type"
        },
        "FileName": {
          "type": "string",
          "title": "Search in filename"
        },
        "Content": {
          "type": "string",
          "title": "Search in content"
        },
        "FileNameOrContent": {
          "type": "string",
          "title": "Search in either filename or content (but at least one of them)"
        },
        "FreeString": {
          "type": "string",
          "title": "Free Query String (for metadata)"
        },
        "Extension": {
          "type": "string",
          "title": "Search files by extension"
        },
        "GeoQuery": {
          "$ref": "#/definitions/treeGeoQuery",
          "title": "Search geographically"
        },
        "PathDepth": {
          "type": "integer",
          "format": "int32",
          "title": "Limit to a given level of the tree - can be used in filters"
        },
        "UUIDs": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "title": "Preset list of Node by UUIDs"
        },
        "Not": {
          "type": "boolean",
          "format": "boolean",
          "title": "Negate this query"
        }
      },
      "title": "Search Queries"
    },
    "treeReadNodeRequest": {
      "type": "object",
      "properties": {
        "Node": {
          "$ref": "#/definitions/treeNode",
          "title": "Input node"
        },
        "WithCommits": {
          "type": "boolean",
          "format": "boolean",
          "title": "Gather commit information"
        },
        "WithExtendedStats": {
          "type": "boolean",
          "format": "boolean",
          "title": "Get extended stats - For folders, computes ChildrenCount"
        },
        "ObjectStats": {
          "type": "boolean",
          "format": "boolean",
          "title": "Used internally for the router ReadNode request, stat the datasource instead of index"
        }
      },
      "title": "Request / Responses Messages"
    },
    "treeReadNodeResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "Node": {
          "$ref": "#/definitions/treeNode"
        }
      }
    },
    "treeSearchFacet": {
      "type": "object",
      "properties": {
        "FieldName": {
          "type": "string",
          "title": "Facet field name"
        },
        "Label": {
          "type": "string",
          "title": "Segment Label"
        },
        "Count": {
          "type": "integer",
          "format": "int32",
          "title": "Segment results count"
        },
        "Term": {
          "type": "string",
          "title": "For string facets, term value"
        },
        "Min": {
          "type": "string",
          "format": "int64",
          "title": "For NumericRange facets, min/max values"
        },
        "Max": {
          "type": "string",
          "format": "int64"
        },
        "Start": {
          "type": "integer",
          "format": "int32",
          "title": "For DateRange facets, start/end values"
        },
        "End": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "treeSearchRequest": {
      "type": "object",
      "properties": {
        "Query": {
          "$ref": "#/definitions/treeQuery",
          "title": "The query object"
        },
        "Size": {
          "type": "integer",
          "format": "int32",
          "title": "Limit the number of results"
        },
        "From": {
          "type": "integer",
          "format": "int32",
          "title": "Start at given position"
        },
        "Details": {
          "type": "boolean",
          "format": "boolean",
          "title": "Load node details"
        }
      }
    },
    "treeVersioningKeepPeriod": {
      "type": "object",
      "properties": {
        "IntervalStart": {
          "type": "string"
        },
        "MaxNumber": {
          "type": "integer",
          "format": "int32"
        }
      }
    },
    "treeVersioningNodeDeletedStrategy": {
      "type": "string",
      "enum": [
        "KeepAll",
        "KeepLast",
        "KeepNone"
      ],
      "default": "KeepAll"
    },
    "treeVersioningPolicy": {
      "type": "object",
      "properties": {
        "Uuid": {
          "type": "string"
        },
        "Name": {
          "type": "string"
        },
        "Description": {
          "type": "string"
        },
        "VersionsDataSourceName": {
          "type": "string"
        },
        "VersionsDataSourceBucket": {
          "type": "string"
        },
        "MaxTotalSize": {
          "type": "string",
          "format": "int64"
        },
        "MaxSizePerFile": {
          "type": "string",
          "format": "int64"
        },
        "IgnoreFilesGreaterThan": {
          "type": "string",
          "format": "int64"
        },
        "KeepPeriods": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/treeVersioningKeepPeriod"
          }
        },
        "NodeDeletedStrategy": {
          "$ref": "#/definitions/treeVersioningNodeDeletedStrategy"
        }
      }
    },
    "treeWorkspaceRelativePath": {
      "type": "object",
      "properties": {
        "WsUuid": {
          "type": "string",
          "title": "Workspace Id"
        },
        "WsLabel": {
          "type": "string",
          "title": "Workspace Label"
        },
        "Path": {
          "type": "string",
          "title": "Relative Path inside workspace"
        },
        "WsSlug": {
          "type": "string",
          "title": "Workspace slug"
        },
        "WsScope": {
          "type": "string",
          "title": "Workspace Scope"
        }
      },
      "title": "Used in AppearsIn to signal a node is\nappearing in multiple workspaces in the current context"
    },
    "updateApplyUpdateRequest": {
      "type": "object",
      "properties": {
        "TargetVersion": {
          "type": "string",
          "title": "Version of the target binary"
        },
        "PackageName": {
          "type": "string",
          "title": "Name of the package if it's not the same as the current binary"
        }
      }
    },
    "updateApplyUpdateResponse": {
      "type": "object",
      "properties": {
        "Success": {
          "type": "boolean",
          "format": "boolean"
        },
        "Message": {
          "type": "string"
        }
      }
    },
    "updatePackage": {
      "type": "object",
      "properties": {
        "PackageName": {
          "type": "string",
          "title": "Name of the application"
        },
        "Version": {
          "type": "string",
          "title": "Version of this new binary"
        },
        "ReleaseDate": {
          "type": "integer",
          "format": "int32",
          "title": "Release date of the binary"
        },
        "Label": {
          "type": "string",
          "title": "Short human-readable description"
        },
        "Description": {
          "type": "string",
          "title": "Long human-readable description (markdown)"
        },
        "ChangeLog": {
          "type": "string",
          "title": "List or public URL of change logs"
        },
        "License": {
          "type": "string",
          "title": "License of this package"
        },
        "BinaryURL": {
          "type": "string",
          "title": "Https URL where to download the binary"
        },
        "BinaryChecksum": {
          "type": "string",
          "title": "Checksum of the binary to verify its integrity"
        },
        "BinarySignature": {
          "type": "string",
          "title": "Signature of the binary"
        },
        "BinaryHashType": {
          "type": "string",
          "title": "Hash type used for the signature"
        },
        "BinarySize": {
          "type": "string",
          "format": "int64",
          "title": "Size of the binary to download"
        },
        "BinaryOS": {
          "type": "string",
          "title": "GOOS value used at build time"
        },
        "BinaryArch": {
          "type": "string",
          "title": "GOARCH value used at build time"
        },
        "IsPatch": {
          "type": "boolean",
          "format": "boolean",
          "title": "Not used : if binary is a patch"
        },
        "PatchAlgorithm": {
          "type": "string",
          "title": "Not used : if a patch, how to patch (bsdiff support)"
        },
        "ServiceName": {
          "type": "string",
          "title": "Not used : at a point we may deliver services only updates"
        },
        "Status": {
          "$ref": "#/definitions/PackagePackageStatus"
        }
      }
    },
    "updateUpdateRequest": {
      "type": "object",
      "properties": {
        "Channel": {
          "type": "string",
          "title": "Channel name"
        },
        "PackageName": {
          "type": "string",
          "title": "Name of the currently running application"
        },
        "CurrentVersion": {
          "type": "string",
          "title": "Current version of the application"
        },
        "GOOS": {
          "type": "string",
          "title": "Current GOOS"
        },
        "GOARCH": {
          "type": "string",
          "title": "Current GOARCH"
        },
        "ServiceName": {
          "type": "string",
          "title": "Not Used : specific service to get updates for"
        },
        "LicenseInfo": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "title": "For enterprise version, info about the current license"
        }
      }
    },
    "updateUpdateResponse": {
      "type": "object",
      "properties": {
        "Channel": {
          "type": "string"
        },
        "AvailableBinaries": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/updatePackage"
          },
          "title": "List of available binaries"
        }
      }
    }
  },
  "externalDocs": {
    "description": "More about Pydio Cells Apis",
    "url": "https://pydio.com"
  }
}
`
