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

package common

import (
	"strconv"

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
	ServiceNats = "nats"

	ServiceLog         = "log"
	ServiceConfig      = "config"
	ServiceInstall     = "install"
	ServiceUpdate      = "update"
	ServiceHealthCheck = "healthcheck"
	ServiceBroker      = "broker"
	ServiceRegistry    = "registry"

	ServiceTagBroker     = "broker"
	ServiceTagData       = "data"
	ServiceTagDatasource = "datasource"
	ServiceTagDiscovery  = "discovery"
	ServiceTagFrontend   = "frontend"
	ServiceTagGateway    = "gateway"
	ServiceTagIdm        = "idm"
	ServiceTagScheduler  = "scheduler"

	ServiceAcl       = "acl"
	ServiceShare     = "share"
	ServiceRole      = "role"
	ServiceUser      = "user"
	ServiceAuth      = "auth"
	ServiceOAuth     = "oauth"
	ServiceToken     = "token"
	ServiceWorkspace = "workspace"
	ServicePolicy    = "policy"
	ServiceGraph     = "graph"
	ServiceUserMeta  = "user-meta"

	ServiceUserKey   = "user-key"
	ServiceTree      = "tree"
	ServiceMeta      = "meta"
	ServiceEncKey    = "data-key"
	ServiceSearch    = "search"
	ServiceChanges   = "changes"
	ServiceSync      = "sync"
	ServiceTemplates = "templates"

	ServiceActivity     = "activity"
	ServiceMailer       = "mailer"
	ServiceWebSocket    = "websocket"
	ServiceChat         = "chat"
	ServiceFrontend     = "frontend"
	ServiceFrontStatics = "statics"

	ServiceTimer    = "timer"
	ServiceJobs     = "jobs"
	ServiceTasks    = "tasks"
	ServiceVersions = "versions"
	ServiceDocStore = "docstore"

	ServiceData_           = "data."
	ServiceDataIndex       = ServiceData_ + "index"
	ServiceDataObjects     = ServiceData_ + "objects"
	ServiceDataObjectsPeer = ServiceData_ + "objects.peer"
	ServiceDataSync        = ServiceData_ + "sync"
	ServiceDataIndex_      = ServiceDataIndex + "."
	ServiceDataObjects_    = ServiceDataObjects + "."
	ServiceDataSync_       = ServiceDataSync + "."

	ServiceGrpcNamespace_    = "pydio.grpc."
	ServiceWebNamespace_     = "pydio.web."
	ServiceRestNamespace_    = "pydio.rest."
	ServiceGatewayNamespace_ = "pydio.gateway."
	ServiceTestNamespace_    = "pydio.test."
	ServiceStorageNamespace_ = "pydio.storage."
	ServiceGenericNamespace_ = "pydio.generic."

	ServiceGatewayProxy     = ServiceGatewayNamespace_ + "proxy"
	ServiceGatewayData      = ServiceGatewayNamespace_ + "data"
	ServiceGatewayGrpc      = ServiceGatewayNamespace_ + "grpc"
	ServiceGatewayGrpcClear = ServiceGatewayNamespace_ + "grpc.clear"
	ServiceGatewayDav       = ServiceGatewayNamespace_ + "dav"
	ServiceGatewayWopi      = ServiceGatewayNamespace_ + "wopi"
	ServiceMicroApi         = ServiceGatewayNamespace_ + "rest"
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
	EventTypeDebugPrintInternals      = "debug"

	TopicInstallSuccessEvent = "topic.pydio.install.success"
	TopicReloadAssets        = "topic.pydio.assets.reload"
	TopicIndexChanges        = "topic.pydio.index.nodes.changes"
	TopicTreeChanges         = "topic.pydio.tree.nodes.changes"
	TopicMetaChanges         = "topic.pydio.meta.nodes.changes"
	TopicTimerEvent          = "topic.pydio.meta.timer.event"
	TopicJobConfigEvent      = "topic.pydio.jobconfig.event"
	TopicJobTaskEvent        = "topic.pydio.tasks.event"
	TopicIdmEvent            = "topic.pydio.idm.event"
	TopicActivityEvent       = "topic.pydio.activity.event"
	TopicChatEvent           = "topic.pydio.chat.event"
	TopicDatasourceEvent     = "topic.pydio.datasource.event"
	TopicIndexEvent          = "topic.pydio.index.event"
	TopicLogLevelEvent       = "topic.pydio.log-level.event"
)

// Define constants for metadata and fixed datasources
const (
	MetaNamespaceDatasourceName      = "pydio:meta-data-source-name"
	MetaNamespaceDatasourcePath      = "pydio:meta-data-source-path"
	MetaNamespaceDatasourceInternal  = "pydio:meta-data-source-internal"
	MetaNamespaceNodeTestLocalFolder = "pydio:test:local-folder-storage"
	MetaNamespaceRecycleRestore      = "pydio:recycle_restore"
	MetaNamespaceNodeName            = "name"
	MetaNamespaceMime                = "mime"
	MetaNamespaceVersionId           = "versionId"
	MetaNamespaceVersionDesc         = "versionDescription"
	MetaNamespaceGeoLocation         = "GeoLocation"
	MetaNamespaceContents            = "Contents"
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
	XContentType                = "Content-Type"
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
	MetaFlagIndexed              = "datasource_node_indexed"
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
	MetaFlagCellNode             = "CellNode"
	MetaFlagChildrenCount        = "ChildrenCount"
	MetaFlagChildrenFolders      = "ChildrenFolders"
	MetaFlagChildrenFiles        = "ChildrenFiles"
	MetaFlagWorkspaceSkipRecycle = "ws_skip_recycle"
	MetaFlagContentLock          = "content_lock"
	MetaFlagWorkspacesShares     = "workspaces_shares"
	MetaFlagUserSubscriptions    = "user_subscriptions"
	MetaFlagDocumentContentHit   = "document_content_hit"
	MetaFlagWorkspaceRepoId      = "repository_id"
	MetaFlagWorkspaceRepoDisplay = "repository_display"
	MetaFlagWorkspaceEventId     = "EventWorkspaceId"
)

var (
	S3GatewayRootUser      = "gateway"
	S3GatewayRootPassword  = "gatewaysecret"
	S3GatewayDefaultRegion = "us-east-1"

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
	version       = "4.0.0"
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

// Let's Encrypt Default CA URLs
var (
	DefaultCaUrl        = "https://acme-v02.api.letsencrypt.org/directory"
	DefaultCaStagingUrl = "https://acme-staging-v02.api.letsencrypt.org/directory"
)

// Logging Levels.
var (
	LogConfig           LogConfigType
	LogLevel            zapcore.Level
	LogToFile           bool
	LogFileDefaultValue = "true"
	LogCaptureStdOut    bool
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

const (
	DefaultRouteREST = "/a"
)

// Version returns the current code version as an object.
func Version() *hashiversion.Version {
	v, _ := hashiversion.NewVersion(version)
	return v
}

// MustLogFileDefaultValue parses associated variable to boolean.
func MustLogFileDefaultValue() bool {
	if v, e := strconv.ParseBool(LogFileDefaultValue); e == nil {
		return v
	}
	return true
}

// IsXSpecialPydioHeader checks if headerName is in XSpecialPydioHeaders slice.
func IsXSpecialPydioHeader(headerName string) bool {
	for _, hh := range XSpecialPydioHeaders {
		if hh == headerName {
			return true
		}
	}
	return false
}
