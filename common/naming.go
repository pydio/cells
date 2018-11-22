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

package common

import (
	"time"

	hashiversion "github.com/hashicorp/go-version"
	"go.uber.org/zap/zapcore"
)

// Various custom types internally used by Pydio.
type (
	ServiceType   string
	ServiceTag    string
	ServiceName   string
	LogConfigType string
)

// Defines all constants for services names.
const (
	SERVICE_CONSUL = "consul"
	SERVICE_NATS   = "nats"

	SERVICE_LOG     = "log"
	SERVICE_CONFIG  = "config"
	SERVICE_INSTALL = "install"
	SERVICE_UPDATE  = "update"

	SERVICE_TAG_IDM        = "idm"
	SERVICE_TAG_SCHEDULER  = "scheduler"
	SERVICE_TAG_DATA       = "data"
	SERVICE_TAG_DATASOURCE = "datasource"
	SERVICE_TAG_BROKER     = "broker"
	SERVICE_TAG_GATEWAY    = "gateway"
	SERVICE_TAG_DISCOVERY  = "discovery"
	SERVICE_TAG_FRONTEND   = "frontend"

	SERVICE_ACL       = "acl"
	SERVICE_SHARE     = "share"
	SERVICE_ROLE      = "role"
	SERVICE_USER      = "user"
	SERVICE_AUTH      = "auth"
	SERVICE_WORKSPACE = "workspace"
	SERVICE_POLICY    = "policy"
	SERVICE_GRAPH     = "graph"
	SERVICE_USER_META = "user-meta"

	SERVICE_USER_KEY  = "user-key"
	SERVICE_TREE      = "tree"
	SERVICE_META      = "meta"
	SERVICE_ENC_KEY   = "data-key"
	SERVICE_SEARCH    = "search"
	SERVICE_CHANGES   = "changes"
	SERVICE_SYNC      = "sync"
	SERVICE_TEMPLATES = "templates"

	SERVICE_ACTIVITY      = "activity"
	SERVICE_MAILER        = "mailer"
	SERVICE_WEBSOCKET     = "websocket"
	SERVICE_CHAT          = "chat"
	SERVICE_FRONTEND      = "frontend"
	SERVICE_FRONT_STATICS = "statics"

	SERVICE_TIMER    = "timer"
	SERVICE_JOBS     = "jobs"
	SERVICE_TASKS    = "tasks"
	SERVICE_VERSIONS = "versions"
	SERVICE_DOCSTORE = "docstore"

	SERVICE_DATA_         = "data."
	SERVICE_DATA_INDEX    = SERVICE_DATA_ + "index"
	SERVICE_DATA_OBJECTS  = SERVICE_DATA_ + "objects"
	SERVICE_DATA_SYNC     = SERVICE_DATA_ + "sync"
	SERVICE_DATA_INDEX_   = SERVICE_DATA_INDEX + "."
	SERVICE_DATA_OBJECTS_ = SERVICE_DATA_OBJECTS + "."
	SERVICE_DATA_SYNC_    = SERVICE_DATA_SYNC + "."

	SERVICE_GRPC_NAMESPACE_    = "pydio.grpc."
	SERVICE_WEB_NAMESPACE_     = "pydio.web."
	SERVICE_REST_NAMESPACE_    = "pydio.rest."
	SERVICE_GATEWAY_NAMESPACE_ = "pydio.gateway."
	SERVICE_TEST_NAMESPACE_    = "pydio.test."

	SERVICE_GATEWAY_PROXY = SERVICE_GATEWAY_NAMESPACE_ + "proxy"
	SERVICE_GATEWAY_DATA  = SERVICE_GATEWAY_NAMESPACE_ + "data"
	SERVICE_GATEWAY_DAV   = SERVICE_GATEWAY_NAMESPACE_ + "dav"
	SERVICE_GATEWAY_WOPI  = SERVICE_GATEWAY_NAMESPACE_ + "wopi"
	SERVICE_MICRO_API     = SERVICE_GATEWAY_NAMESPACE_ + "rest"
)

// Define constants for Event Bus Topics
const (
	TOPIC_SERVICE_START    = "topic.pydio.service.start"
	TOPIC_SERVICE_STOP     = "topic.pydio.service.stop"
	TOPIC_INDEX_CHANGES    = "topic.pydio.index.nodes.changes"
	TOPIC_TREE_CHANGES     = "topic.pydio.tree.nodes.changes"
	TOPIC_META_CHANGES     = "topic.pydio.meta.nodes.changes"
	TOPIC_TIMER_EVENT      = "topic.pydio.meta.timer.event"
	TOPIC_JOB_CONFIG_EVENT = "topic.pydio.jobconfig.event"
	TOPIC_JOB_TASK_EVENT   = "topic.pydio.jobconfig.event"
	TOPIC_IDM_EVENT        = "topic.pydio.idm.event"
	TOPIC_ACTIVITY_EVENT   = "topic.pydio.activity.event"
	TOPIC_CHAT_EVENT       = "topic.pydio.chat.event"
	TOPIC_DATASOURCE_EVENT = "topic.pydio.datasource.event"
)

// Define constants for metadata and fixed datasources
const (
	META_NAMESPACE_DATASOURCE_NAME        = "pydio:meta-data-source-name"
	META_NAMESPACE_DATASOURCE_PATH        = "pydio:meta-data-source-path"
	META_NAMESPACE_NODE_TEST_LOCAL_FOLDER = "pydio:test:local-folder-storage"
	META_NAMESPACE_RECYCLE_RESTORE        = "pydio:recycle_restore"
	RECYCLE_BIN_NAME                      = "recycle_bin"

	PYDIO_THUMBSTORE_NAMESPACE        = "pydio-thumbstore"
	PYDIO_DOCSTORE_BINARIES_NAMESPACE = "pydio-binaries"
	PYDIO_VERSIONS_NAMESPACE          = "versions-store"
)

// Additional constants for authentication/authorization aspects
const (
	PYDIO_CONTEXT_USER_KEY      = "X-Pydio-User"
	PYDIO_SYSTEM_USERNAME       = "pydio.system.user"
	PYDIO_S3ANON_USERNAME       = "pydio.anon.user"
	PYDIO_S3ANON_PROFILE        = "anon"
	PYDIO_SYNC_HIDDEN_FILE_META = ".pydio"

	PYDIO_PROFILE_ADMIN    = "admin"
	PYDIO_PROFILE_STANDARD = "standard"
	PYDIO_PROFILE_SHARED   = "shared"
	PYDIO_PROFILE_ANON     = "anon"

	KEYRING_MASTER_KEY       = "keyring.master"
	META_FLAG_READONLY       = "node_readonly"
	META_FLAG_ENCRYPTED      = "datasource_encrypted"
	META_FLAG_VERSIONING     = "datasource_versioning"
	NODE_FLAG_ETAG_TEMPORARY = "temporary"
)

// DocStore constants for StoreID's
const (
	DOCSTORE_ID_SELECTIONS          = "selections"
	DOCSTORE_ID_VIRTUALNODES        = "virtualnodes"
	DOCSTORE_ID_VERSIONING_POLICIES = "versioningPolicies"
	DOCSTORE_ID_SHARES              = "share"
	DOCSTORE_ID_RESET_PASS_KEYS     = "resetPasswordKeys"
)

// Define constants for Loggging configuration
const (
	LogConfigConsole    LogConfigType = "console"
	LogConfigProduction LogConfigType = "production"
)

// Defaults for DB connexions.
const (
	DB_MAX_OPEN_CONNS    = 0
	DB_MAX_IDLE_CONNS    = 20
	DB_CONN_MAX_LIFETIME = 5 * time.Minute
)

// Main code information. Set by the go linker in the resulting binary when doing 'make main'
var (
	BuildStamp    string
	BuildRevision string
	version       = "0.1.0"
)

// Package info. Initialised by main.
var (
	PackageType  string
	PackageLabel string
)

// Update Server default values.
var (
	UpdateDefaultChannel   = "stable"
	UpdateDefaultServerUrl = "https://updatecells.pydio.com/"
	UpdateDefaultPublicKey = `-----BEGIN PUBLIC KEY-----\nMIIBCgKCAQEAwh/ofjZTITlQc4h/qDZMR3RquBxlG7UTunDKLG85JQwRtU7EL90v\nlWxamkpSQsaPeqho5Q6OGkhJvZkbWsLBJv6LZg+SBhk6ZSPxihD+Kfx8AwCcWZ46\nDTpKpw+mYnkNH1YEAedaSfJM8d1fyU1YZ+WM3P/j1wTnUGRgebK9y70dqZEo2dOK\nn98v3kBP7uEN9eP/wig63RdmChjCpPb5gK1/WKnY4NFLQ60rPAOBsXurxikc9N/3\nEvbIB/1vQNqm7yEwXk8LlOC6Fp8W/6A0DIxr2BnZAJntMuH2ulUfhJgw0yJalMNF\nDR0QNzGVktdLOEeSe8BSrASe9uZY2SDbTwIDAQAB\n-----END PUBLIC KEY-----`
)

// Logging Levels.
var (
	LogConfig        LogConfigType
	LogLevel         zapcore.Level
	LogCaptureStdOut bool
)

var (
	// PydioUserProfiles order reflects the level of authorizations
	PydioUserProfiles = []string{
		PYDIO_PROFILE_ANON,
		PYDIO_PROFILE_SHARED,
		PYDIO_PROFILE_STANDARD,
		PYDIO_PROFILE_ADMIN,
	}
)

// Version returns the current code version as an object.
func Version() *hashiversion.Version {
	v, _ := hashiversion.NewVersion(version)
	return v
}
