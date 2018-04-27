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

type (
	ServiceType   string
	ServiceTag    string
	ServiceName   string
	LogConfigType string
)

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

	SERVICE_USER_KEY = "user-key"
	SERVICE_TREE     = "tree"
	SERVICE_META     = "meta"
	SERVICE_ENC_KEY  = "data-key"
	SERVICE_SEARCH   = "search"
	SERVICE_CHANGES  = "changes"
	SERVICE_SYNC     = "sync"

	SERVICE_ACTIVITY   = "activity"
	SERVICE_MAILER     = "mailer"
	SERVICE_WEBSOCKET  = "websocket"
	SERVICE_CHAT       = "chat"
	SERVICE_FRONTEND   = "frontend"
	SERVICE_FRONTPLUGS = "front-plugins"

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

	SERVICE_GATEWAY       = "gateway"
	SERVICE_GATEWAY_PROXY = SERVICE_GATEWAY + ".proxy"
	SERVICE_GATEWAY_DATA  = SERVICE_GATEWAY + ".data"
	SERVICE_GATEWAY_DAV   = SERVICE_GATEWAY + ".dav"
	SERVICE_GATEWAY_WOPI  = SERVICE_GATEWAY + ".wopi"
	SERVICE_MICRO_API     = "micro.api"

	SERVICE_GRPC_NAMESPACE_ = "pydio.grpc."
	SERVICE_API_NAMESPACE_  = "pydio.api."
	SERVICE_REST_NAMESPACE_ = "pydio.rest."

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

	META_NAMESPACE_DATASOURCE_NAME        = "pydio:meta-data-source-name"
	META_NAMESPACE_DATASOURCE_PATH        = "pydio:meta-data-source-path"
	META_NAMESPACE_NODE_TEST_LOCAL_FOLDER = "pydio:test:local-folder-storage"

	PYDIO_THUMBSTORE_NAMESPACE        = "pydio-thumbstore"
	PYDIO_DOCSTORE_BINARIES_NAMESPACE = "pydio-binaries"
	PYDIO_VERSIONS_NAMESPACE          = "versions-store"

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
	NODE_FLAG_ETAG_TEMPORARY = "temporary"

	DB_MAX_OPEN_CONNS    = 30
	DB_MAX_IDLE_CONNS    = 20
	DB_CONN_MAX_LIFETIME = 5 * time.Minute

	LogConfigConsole    LogConfigType = "console"
	LogConfigProduction LogConfigType = "production"
)

var (
	// Will be initialized by main
	PackageType  string
	PackageLabel string

	// The 3 below vars are initialized by the go linker directly
	// in the resulting binary when doing 'make main'
	version       = "0.1.0"
	BuildStamp    string
	BuildRevision string

	// Logging Levels
	LogConfig        LogConfigType
	LogLevel         zapcore.Level
	LogCaptureStdOut bool

	ServicesDiscovery = []string{SERVICE_CONSUL, SERVICE_NATS}
	// Profiles order reflects the level of authorizations
	PydioUserProfiles = []string{
		PYDIO_PROFILE_ANON,
		PYDIO_PROFILE_SHARED,
		PYDIO_PROFILE_STANDARD,
		PYDIO_PROFILE_ADMIN,
	}
)

func Version() *hashiversion.Version {
	v, _ := hashiversion.NewVersion(version)
	return v
}
