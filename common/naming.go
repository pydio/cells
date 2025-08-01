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
	"runtime"
	"strconv"
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
	ServiceLog         = "log"
	ServiceConfig      = "config"
	ServiceInstall     = "install"
	ServiceUpdate      = "update"
	ServiceHealthCheck = "health"
	ServiceBroker      = "broker"
	ServiceRegistry    = "registry"
	ServiceXDS         = "xds"

	ServiceTagBroker     = "broker"
	ServiceTagData       = "data"
	ServiceTagDatasource = "datasource"
	ServiceTagDiscovery  = "discovery"
	ServiceTagFrontend   = "frontend"
	ServiceTagGateway    = "gateway"
	ServiceTagIdm        = "idm"
	ServiceTagScheduler  = "scheduler"
	ServiceTagAuth       = "auth"

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

	ServiceAclGRPC          = ServiceGrpcNamespace_ + ServiceAcl
	ServiceMetaGRPC         = ServiceGrpcNamespace_ + ServiceMeta
	ServiceTreeGRPC         = ServiceGrpcNamespace_ + ServiceTree
	ServiceRoleGRPC         = ServiceGrpcNamespace_ + ServiceRole
	ServiceUserGRPC         = ServiceGrpcNamespace_ + ServiceUser
	ServiceOAuthGRPC        = ServiceGrpcNamespace_ + ServiceOAuth
	ServiceTokenGRPC        = ServiceGrpcNamespace_ + ServiceToken
	ServiceWorkspaceGRPC    = ServiceGrpcNamespace_ + ServiceWorkspace
	ServicePolicyGRPC       = ServiceGrpcNamespace_ + ServicePolicy
	ServiceUserMetaGRPC     = ServiceGrpcNamespace_ + ServiceUserMeta
	ServiceUserKeyGRPC      = ServiceGrpcNamespace_ + ServiceUserKey
	ServiceDataObjectsGRPC  = ServiceGrpcNamespace_ + ServiceDataObjects
	ServiceDataObjectsGRPC_ = ServiceGrpcNamespace_ + ServiceDataObjects_
	ServiceDataIndexGRPC_   = ServiceGrpcNamespace_ + ServiceDataIndex_
	ServiceDataIndexGRPC    = ServiceGrpcNamespace_ + ServiceDataIndex
	ServiceDataSyncGRPC_    = ServiceGrpcNamespace_ + ServiceDataSync_
	ServiceDataSyncGRPC     = ServiceGrpcNamespace_ + ServiceDataSync
	ServiceEncKeyGRPC       = ServiceGrpcNamespace_ + ServiceEncKey
	ServiceVersionsGRPC     = ServiceGrpcNamespace_ + ServiceVersions
	ServiceRegistryGRPC     = ServiceGrpcNamespace_ + ServiceRegistry
	ServiceBrokerGRPC       = ServiceGrpcNamespace_ + ServiceBroker
	ServiceConfigGRPC       = ServiceGrpcNamespace_ + ServiceConfig
	ServiceUpdateGRPC       = ServiceGrpcNamespace_ + ServiceUpdate
	ServiceSearchGRPC       = ServiceGrpcNamespace_ + ServiceSearch
	ServiceShareGRPC        = ServiceGrpcNamespace_ + ServiceShare
	ServiceActivityGRPC     = ServiceGrpcNamespace_ + ServiceActivity
	ServiceChatGRPC         = ServiceGrpcNamespace_ + ServiceChat
	ServiceMailerGRPC       = ServiceGrpcNamespace_ + ServiceMailer
	ServiceDocStoreGRPC     = ServiceGrpcNamespace_ + ServiceDocStore
	ServiceFrontStaticsGRPC = ServiceGrpcNamespace_ + ServiceFrontStatics
	ServiceJobsGRPC         = ServiceGrpcNamespace_ + ServiceJobs
	ServiceTasksGRPC        = ServiceGrpcNamespace_ + ServiceTasks
	ServiceLogGRPC          = ServiceGrpcNamespace_ + ServiceLog
	ServiceInstallGRPC      = ServiceGrpcNamespace_ + ServiceInstall

	ServiceUserKey   = "user-key"
	ServiceTree      = "tree"
	ServiceMeta      = "meta"
	ServiceEncKey    = "data-key"
	ServiceSearch    = "search"
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
	ServicePprof    = "pprof"

	ServiceData_        = "data."
	ServiceDataIndex    = ServiceData_ + "index"
	ServiceDataIndex_   = ServiceDataIndex + "."
	ServiceDataObjects  = ServiceData_ + "objects"
	ServiceDataObjects_ = ServiceDataObjects + "."
	ServiceDataSync     = ServiceData_ + "sync"
	ServiceDataSync_    = ServiceDataSync + "."

	ServiceGrpcNamespace_        = "pydio.grpc."
	ServiceWebNamespace_         = "pydio.web."
	ServiceRestNamespace_        = "pydio.rest."
	ServiceGatewayNamespace_     = "pydio.gateway."
	ServiceGatewayGrpcNamespace_ = "pydio.gateway-grpc."
	ServiceTestNamespace_        = "pydio.test."
	ServiceGenericNamespace_     = "pydio.generic."

	ServiceGatewayProxy = ServiceGatewayNamespace_ + "proxy"
	ServiceGatewayData  = ServiceGatewayNamespace_ + "data"
	ServiceGatewayGrpc  = ServiceGatewayGrpcNamespace_ + "secure"
	ServiceGatewayDav   = ServiceGatewayNamespace_ + "dav"
	ServiceGatewayWopi  = ServiceGatewayNamespace_ + "wopi"
	ServiceMicroApi     = ServiceGatewayNamespace_ + "rest"

	CacheTypeShared     = "shared"
	CacheTypeLocal      = "local"
	QueueTypePersistent = "persistent"
	QueueTypeDebouncer  = "debouncer"
)

// Define constants for Event Bus Topics
const (
	TopicRegistryCommand     = "topic.pydio.registry.command"
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
	TopicIdmPolicies         = "topic.pydio.idm.policies"
	TopicActivityEvent       = "topic.pydio.activity.event"
	TopicChatEvent           = "topic.pydio.chat.event"
	TopicDatasourceEvent     = "topic.pydio.datasource.event"
	TopicIndexEvent          = "topic.pydio.index.event"
	TopicLogLevelEvent       = "topic.pydio.log-level.event"
)

// Define constants for metadata and fixed datasources
const (
	MetaNamespaceReservedPrefix_     = "pydio:"
	MetaNamespaceUserspacePrefix     = "usermeta-"
	MetaNamespaceDatasourceName      = MetaNamespaceReservedPrefix_ + "meta-data-source-name"
	MetaNamespaceDatasourcePath      = MetaNamespaceReservedPrefix_ + "meta-data-source-path"
	MetaNamespaceDatasourceInternal  = MetaNamespaceReservedPrefix_ + "meta-data-source-internal"
	MetaNamespaceNodeTestLocalFolder = MetaNamespaceReservedPrefix_ + "test:local-folder-storage"
	MetaNamespaceRecycleRestore      = MetaNamespaceReservedPrefix_ + "recycle_restore"
	MetaNamespaceAclRefNodeUuid      = MetaNamespaceReservedPrefix_ + "acl-ref-node-uuid"
	MetaNamespaceInsideRecycle       = "inside_recycle"
	MetaNamespaceNodeName            = "name"
	MetaNamespaceMime                = "mime"
	MetaNamespaceHash                = "x-cells-hash"
	MetaNamespaceVersionId           = "versionId"
	MetaNamespaceVersionDesc         = "versionDescription"
	MetaNamespaceVersionDraft        = "versionDraft"
	MetaNamespaceContentRevisions    = "contentRevisions"
	MetaNamespaceNodeDraftMode       = "draft-mode"
	MetaNamespaceGeoLocation         = "GeoLocation"
	MetaNamespaceContents            = "Contents"
	MetaRecursiveChildrenSize        = "RecursiveChildrenSize"
	MetaRecursiveChildrenFiles       = "RecursiveChildrenFiles"
	MetaRecursiveChildrenFolders     = "RecursiveChildrenFolders"

	RecycleBinName = "recycle_bin"

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
	XAmzMetaPrefix              = "X-Amz-Meta-"
	XAmzMetaClearSize           = XAmzMetaPrefix + "Pydio-Clear-Size"
	XAmzMetaClearSizeUnknown    = "unknown"
	XAmzMetaNodeUuid            = XAmzMetaPrefix + "Pydio-Node-Uuid"
	XAmzMetaContentMd5          = XAmzMetaPrefix + "Content-Md5"
	XAmzMetaDirective           = "X-Amz-Metadata-Directive"
	XPydioClientUuid            = "X-Pydio-Client-Uuid"
	XPydioSessionUuid           = "X-Pydio-Session"
	XPydioIndexationSessionUuid = "X-Pydio-Indexation-Session"
	XPydioMoveUuid              = "X-Pydio-Move"
	XPydioSiteHash              = "X-Pydio-Site-Hash"
	XPydioDebugSession          = "X-Pydio-Debug-Session"
	XPydioMinisite              = "X-Pydio-Minisite"
	XContentType                = "Content-Type"
	InputResourceUUID           = "Create-Resource-Uuid"
	InputVersionId              = "Create-Version-Id"
	InputDraftMode              = "Draft-Mode"
	SyncSessionClose_           = "close-"
	SyncSessionPrefixCopy       = "copy-"
	SyncSessionPrefixMove       = "move-"

	PydioProfileAdmin    = "admin"
	PydioProfileStandard = "standard"
	PydioProfileShared   = "shared"
	PydioProfileAnon     = "anon"

	CtxTargetServiceName       = "service"
	CtxCellsMetaPrefix         = "x-cells-"
	CtxGrpcClientCaller        = "grpc-client-caller"
	CtxGrpcSilentNotFound      = "grpc-silent-not-found"
	CtxSchedulerOperationId    = "Scheduler-Operation-Id"
	CtxSchedulerOperationLabel = "Scheduler-Operation-Label"
	CtxMetaJobUuid             = "X-Pydio-Job-Uuid"
	CtxMetaTaskUuid            = "X-Pydio-Task-Uuid"
	CtxMetaTaskActionPath      = "X-Pydio-Task-Action-Path"
	CtxMetaTaskActionTags      = "X-Pydio-Task-Action-Tags"

	KeyringMasterKey = "keyring.master"

	MetaFlagReadonly                = "node_readonly"
	MetaFlagWriteOnly               = "node_writeonly"
	MetaFlagLevelReadonly           = "level_readonly"
	MetaFlagEncrypted               = "datasource_encrypted"
	MetaFlagVersioning              = "datasource_versioning"
	MetaFlagIndexed                 = "datasource_node_indexed"
	MetaFlagHashingVersion          = "hashing_version"
	MetaFlagWorkspaceRoot           = "ws_root"
	MetaFlagWorkspaceScope          = "ws_scope"
	MetaFlagWorkspaceSyncable       = "ws_syncable"
	MetaFlagWorkspacePermissions    = "ws_permissions"
	MetaFlagWorkspaceLabel          = "ws_label"
	MetaFlagWorkspaceDescription    = "ws_description"
	MetaFlagWorkspaceSlug           = "ws_slug"
	MetaFlagWorkspaceUuid           = "ws_uuid"
	MetaFlagWorkspaceQuota          = "ws_quota"
	MetaFlagWorkspaceQuotaUsage     = "ws_quota_usage"
	MetaFlagVirtualRoot             = "virtual_root"
	MetaFlagBucket                  = "ds_bucket"
	NodeFlagEtagTemporary           = "temporary"
	MetaFlagCellNode                = "CellNode"
	MetaFlagChildrenCount           = "ChildrenCount"
	MetaFlagChildrenFolders         = "ChildrenFolders"
	MetaFlagChildrenFiles           = "ChildrenFiles"
	MetaFlagRecursiveCount          = "RecursiveCount"
	MetaFlagWorkspaceSkipRecycle    = "ws_skip_recycle"
	MetaFlagContentLock             = "content_lock"
	MetaFlagWorkspacesShares        = "workspaces_shares"
	MetaFlagUserSubscriptionsJoined = "user_subscriptions"
	MetaFlagUserSubscriptions       = "subscriptions"
	MetaFlagDocumentContentHit      = "document_content_hit"
	MetaFlagWorkspaceRepoId         = "repository_id"
	MetaFlagWorkspaceRepoDisplay    = "repository_display"
	MetaFlagWorkspaceEventId        = "EventWorkspaceId"

	IdmWsInternalHomepageID  = "homepage"
	IdmWsInternalSettingsID  = "settings"
	IdmWsInternalDirectoryID = "directory"
)

var (
	S3GatewayRootUser      = "gateway"
	S3GatewayRootPassword  = "gatewaysecret"
	S3GatewayDefaultRegion = "us-east-1"

	XSpecialPydioHeaders = []string{
		XPydioClientUuid,
		XPydioSessionUuid,
		XPydioIndexationSessionUuid,
		XPydioMinisite,
		XPydioMoveUuid,
		XPydioDebugSession,
	}

	IdmWsInternalReservedSlugs = map[string]string{
		IdmWsInternalSettingsID:  "settings",
		IdmWsInternalHomepageID:  "welcome",
		IdmWsInternalDirectoryID: "directory",
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
	version       = "5.0.0"
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
	RouteApiREST    = "api"
	RouteApiRESTv2  = "api-v2"
	RoutePublic     = "public"
	RouteFrontend   = "frontend"
	RouteBucketIO   = "io"
	RouteBucketData = "data"
	RouteDAV        = "webdav"
	RouteMetrics    = "metrics"
	RouteProfile    = "debug"
	RouteWebsocket  = "websocket"
	RouteOIDC       = "oidc"
	RouteInstall    = "install"

	DefaultRouteFrontend   = "/"
	DefaultRouteInstall    = "/"
	DefaultRouteREST       = "/a"
	DefaultRouteRESTv2     = "/v2"
	DefaultRoutePublic     = "/public"
	DefaultRouteBucketIO   = "/io"
	DefaultRouteBucketData = "/data"
	DefaultRouteDAV        = "/dav"
	DefaultRouteMetrics    = "/metrics"
	DefaultRouteProfile    = "/debug"
	DefaultRouteWebsocket  = "/ws"
	DefaultRouteOIDC       = "/oidc"
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

// IsReservedIdmWorkspaceSlug checks if a slug is already reserved for usage
func IsReservedIdmWorkspaceSlug(slug string) bool {
	for _, s := range IdmWsInternalReservedSlugs {
		if s == slug {
			return true
		}
	}
	return false
}

// CellsVersion contains version information for the current running binary
type CellsVersion struct {
	//Distribution string
	PackageLabel string
	Version      string
	BuildTime    string
	GitCommit    string
	OS           string
	Arch         string
	GoVersion    string
}

// MakeCellsVersion builds a CellsVersion object filled with data
func MakeCellsVersion() *CellsVersion {
	var t time.Time
	if BuildStamp != "" {
		t, _ = time.Parse("2006-01-02T15:04:05", BuildStamp)
	} else {
		t = time.Now()
	}
	return &CellsVersion{
		PackageLabel: PackageLabel,
		Version:      Version().String(),
		BuildTime:    t.Format(time.RFC822Z),
		GitCommit:    BuildRevision,
		OS:           runtime.GOOS,
		Arch:         runtime.GOARCH,
		GoVersion:    runtime.Version(),
	}

}
