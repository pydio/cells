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
	SERVICE_NATS = "nats"

	SERVICE_LOG         = "log"
	SERVICE_CONFIG      = "config"
	SERVICE_INSTALL     = "install"
	SERVICE_UPDATE      = "update"
	SERVICE_HEALTHCHECK = "healthcheck"

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
	SERVICE_OAUTH     = "oauth"
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

	SERVICE_GATEWAY_PROXY      = SERVICE_GATEWAY_NAMESPACE_ + "proxy"
	SERVICE_GATEWAY_DATA       = SERVICE_GATEWAY_NAMESPACE_ + "data"
	SERVICE_GATEWAY_GRPC       = SERVICE_GATEWAY_NAMESPACE_ + "grpc"
	SERVICE_GATEWAY_GRPC_CLEAR = SERVICE_GATEWAY_NAMESPACE_ + "grpc.clear"
	SERVICE_GATEWAY_DAV        = SERVICE_GATEWAY_NAMESPACE_ + "dav"
	SERVICE_GATEWAY_WOPI       = SERVICE_GATEWAY_NAMESPACE_ + "wopi"
	SERVICE_MICRO_API          = SERVICE_GATEWAY_NAMESPACE_ + "rest"
)

// Define constants for Event Bus Topics
const (
	TopicServiceRegistration = "topic.pydio.service.registration"
	TopicProxyRestarted      = "topic.pydio.proxy.restarted"
	TopicServiceStop         = "topic.pydio.service.stop" // @todo This is used in "stop" command but probably out-of-date

	EventTypeServiceRegistered        = "registered"
	EventTypeServiceUnregistered      = "unregistered"
	EventHeaderServiceRegisterService = "x-service-name"
	EventHeaderServiceRegisterPeer    = "x-service-peer"

	TopicReloadAssets    = "topic.pydio.assets.reload"
	TopicIndexChanges    = "topic.pydio.index.nodes.changes"
	TopicTreeChanges     = "topic.pydio.tree.nodes.changes"
	TopicMetaChanges     = "topic.pydio.meta.nodes.changes"
	TopicTimerEvent      = "topic.pydio.meta.timer.event"
	TopicJobConfigEvent  = "topic.pydio.jobconfig.event"
	TopicJobTaskEvent    = "topic.pydio.jobconfig.event"
	TopicIdmEvent        = "topic.pydio.idm.event"
	TopicActivityEvent   = "topic.pydio.activity.event"
	TopicChatEvent       = "topic.pydio.chat.event"
	TopicDatasourceEvent = "topic.pydio.datasource.event"
	TopicIndexEvent      = "topic.pydio.index.event"
)

// Define constants for metadata and fixed datasources
const (
	MetaNamespaceDatasourceName      = "pydio:meta-data-source-name"
	MetaNamespaceDatasourcePath      = "pydio:meta-data-source-path"
	MetaNamespaceNodeTestLocalFolder = "pydio:test:local-folder-storage"
	MetaNamespaceRecycleRestore      = "pydio:recycle_restore"
	MetaNamespaceNodeName            = "name"
	RecycleBinName                   = "recycle_bin"

	PydioThumbstoreNamespace       = "pydio-thumbstore"
	PydioDocstoreBinariesNamespace = "pydio-binaries"
	PydioVersionsNamespace         = "versions-store"
)

// Additional constants for authentication/authorization aspects
const (
	PydioContextUserKey         = "X-Pydio-User"
	PydioSystemUsername         = "pydio.system.user"
	PydioS3AnonUsername         = "pydio.anon.user"
	PydioSyncHiddenFile         = ".pydio"
	XAmzMetaClearSize           = "X-Amz-Meta-Pydio-Clear-Size"
	XAmzMetaClearSizeUnkown     = "unknown"
	XAmzMetaNodeUuid            = "X-Amz-Meta-Pydio-Node-Uuid"
	XAmzMetaContentMd5          = "X-Amz-Meta-Content-Md5"
	XAmzMetaDirective           = "X-Amz-Metadata-Directive"
	XPydioClientUuid            = "X-Pydio-Client-Uuid"
	XPydioSessionUuid           = "X-Pydio-Session"
	XPydioIndexationSessionUuid = "X-Pydio-Indexation-Session"
	XPydioFrontendSessionUuid   = "X-Pydio-Frontend-Session"
	XPydioMoveUuid              = "X-Pydio-Move"
	SyncSessionClose_           = "close-"
	SyncSessionPrefixCopy       = "copy-"
	SyncSessionPrefixMove       = "move-"

	PydioProfileAdmin    = "admin"
	PydioProfileStandard = "standard"
	PydioProfileShared   = "shared"
	PydioProfileAnon     = "anon"

	KeyringMasterKey             = "keyring.master"
	MetaFlagReadonly             = "node_readonly"
	MetaFlagLevelReadonly        = "level_readonly"
	MetaFlagEncrypted            = "datasource_encrypted"
	MetaFlagVersioning           = "datasource_versioning"
	MetaFlagWorkspaceRoot        = "ws_root"
	MetaFlagWorkspaceScope       = "ws_scope"
	MetaFlagWorkspaceSyncable    = "ws_syncable"
	MetaFlagWorkspacePermissions = "ws_permissions"
	MetaFlagWorkspaceLabel       = "ws_label"
	MetaFlagWorkspaceDescription = "ws_description"
	MetaFlagWorkspaceSlug        = "ws_slug"
	MetaFlagWorkspaceUuid        = "ws_uuid"
	MetaFlagVirtualRoot          = "virtual_root"
	MetaFlagBucket               = "ds_bucket"
	NodeFlagEtagTemporary        = "temporary"
)

var (
	XSpecialPydioHeaders = []string{
		XPydioClientUuid,
		XPydioSessionUuid,
		XPydioIndexationSessionUuid,
		XPydioFrontendSessionUuid,
		XPydioMoveUuid,
	}
)

// DocStore constants for StoreID's
const (
	DocStoreIdSelections         = "selections"
	DocStoreIdVirtualNodes       = "virtualnodes"
	DocStoreIdVersioningPolicies = "versioningPolicies"
	DocStoreIdShares             = "share"
	DocStoreIdResetPassKeys      = "resetPasswordKeys"
)

// Define constants for Loggging configuration
const (
	LogConfigConsole    LogConfigType = "console"
	LogConfigProduction LogConfigType = "production"
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
		PydioProfileAnon,
		PydioProfileShared,
		PydioProfileStandard,
		PydioProfileAdmin,
	}
)

// Version returns the current code version as an object.
func Version() *hashiversion.Version {
	v, _ := hashiversion.NewVersion(version)
	return v
}
