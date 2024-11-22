package main

import (
	"github.com/pydio/cells/v4/common"

	// All Telemetry-related drivers
	// Logs
	_ "github.com/pydio/cells/v4/common/telemetry/log/file"
	_ "github.com/pydio/cells/v4/common/telemetry/log/otlp"
	_ "github.com/pydio/cells/v4/common/telemetry/log/service"
	_ "github.com/pydio/cells/v4/common/telemetry/log/stdout"
	// Tracing
	_ "github.com/pydio/cells/v4/common/telemetry/tracing/jaeger"
	_ "github.com/pydio/cells/v4/common/telemetry/tracing/otlp"
	_ "github.com/pydio/cells/v4/common/telemetry/tracing/stdout"
	// Metrics
	_ "github.com/pydio/cells/v4/common/telemetry/metrics/otlp"
	_ "github.com/pydio/cells/v4/common/telemetry/metrics/prometheus"
	// Profiling
	_ "github.com/pydio/cells/v4/common/telemetry/profile/http_pull"
	_ "github.com/pydio/cells/v4/common/telemetry/profile/pyroscope"

	// Register storage drivers
	_ "github.com/pydio/cells/v4/common/storage/bleve"
	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/mongodb"
	_ "github.com/pydio/cells/v4/common/storage/sc"
	_ "github.com/pydio/cells/v4/common/storage/sql"

	// Register minio client for objects storage
	_ "github.com/pydio/cells/v4/common/nodes/objects/mc"

	// Frontend
	_ "github.com/pydio/cells/v4/frontend/rest/service"
	_ "github.com/pydio/cells/v4/frontend/web/service"

	// Discovery
	_ "github.com/pydio/cells/v4/discovery/broker/service"
	_ "github.com/pydio/cells/v4/discovery/config/grpc/service"
	_ "github.com/pydio/cells/v4/discovery/config/rest/service"
	_ "github.com/pydio/cells/v4/discovery/install/rest/service"
	_ "github.com/pydio/cells/v4/discovery/install/web/service"
	_ "github.com/pydio/cells/v4/discovery/registry/service"
	_ "github.com/pydio/cells/v4/discovery/update/grpc/service"
	_ "github.com/pydio/cells/v4/discovery/update/rest/service"

	// Data DAOs
	_ "github.com/pydio/cells/v4/data/docstore/dao/bleve"
	_ "github.com/pydio/cells/v4/data/docstore/dao/mongo"
	_ "github.com/pydio/cells/v4/data/key/dao/sql"
	_ "github.com/pydio/cells/v4/data/meta/dao/sql"
	_ "github.com/pydio/cells/v4/data/search/dao/bleve"
	_ "github.com/pydio/cells/v4/data/search/dao/mongo"
	_ "github.com/pydio/cells/v4/data/versions/dao/bolt"
	_ "github.com/pydio/cells/v4/data/versions/dao/mongo"

	// Data Services
	_ "github.com/pydio/cells/v4/data/docstore/grpc/service"
	_ "github.com/pydio/cells/v4/data/key/grpc/service"
	_ "github.com/pydio/cells/v4/data/meta/grpc/service"
	_ "github.com/pydio/cells/v4/data/meta/rest/service"
	_ "github.com/pydio/cells/v4/data/search/grpc/service"
	_ "github.com/pydio/cells/v4/data/search/rest/service"
	_ "github.com/pydio/cells/v4/data/templates/rest/service"
	_ "github.com/pydio/cells/v4/data/tree/grpc/service"
	_ "github.com/pydio/cells/v4/data/tree/rest/service"
	_ "github.com/pydio/cells/v4/data/versions/grpc/service"

	// DataSources DAOs
	_ "github.com/pydio/cells/v4/data/source/index/dao/sql"
	_ "github.com/pydio/cells/v4/data/source/sync/dao/sql"

	// DataSources - shared services
	_ "github.com/pydio/cells/v4/data/source/index/service"
	_ "github.com/pydio/cells/v4/data/source/objects/service"
	_ "github.com/pydio/cells/v4/data/source/sync/service"
	//	_ "github.com/pydio/cells/v4/data/source/index"
	//_ "github.com/pydio/cells/v4/data/source/index/grpc/service"
	//_ "github.com/pydio/cells/v4/data/source/objects/grpc/service"
	//	_ "github.com/pydio/cells/v4/data/source/sync"
	//	_ "github.com/pydio/cells/v4/data/source/sync/grpc/service"

	// ETL Stores
	_ "github.com/pydio/cells/v4/common/etl/stores/cells/local"
	_ "github.com/pydio/cells/v4/common/etl/stores/pydio8"

	// Registry
	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/registry/service"

	// Broker DAOs
	_ "github.com/pydio/cells/v4/broker/activity/dao/bolt"
	_ "github.com/pydio/cells/v4/broker/activity/dao/mongo"
	_ "github.com/pydio/cells/v4/broker/chat/dao/bolt"
	_ "github.com/pydio/cells/v4/broker/chat/dao/mongo"
	_ "github.com/pydio/cells/v4/broker/log/dao/bleve"
	_ "github.com/pydio/cells/v4/broker/log/dao/mongo"
	_ "github.com/pydio/cells/v4/broker/mailer/dao/bolt"
	_ "github.com/pydio/cells/v4/broker/mailer/dao/mongo"

	// Broker
	_ "github.com/pydio/cells/v4/broker/activity/grpc/service"
	_ "github.com/pydio/cells/v4/broker/activity/rest/service"
	_ "github.com/pydio/cells/v4/broker/chat/grpc/service"
	_ "github.com/pydio/cells/v4/broker/log/grpc/service"
	_ "github.com/pydio/cells/v4/broker/log/rest/service"
	_ "github.com/pydio/cells/v4/broker/mailer/grpc/service"
	_ "github.com/pydio/cells/v4/broker/mailer/rest/service"

	// Cache
	_ "github.com/pydio/cells/v4/common/broker/debounce"
	_ "github.com/pydio/cells/v4/common/broker/goque"
	_ "github.com/pydio/cells/v4/common/broker/jetstream"
	_ "github.com/pydio/cells/v4/common/utils/cache/bigcache"
	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"
	_ "github.com/pydio/cells/v4/common/utils/cache/redis"

	// Gateways
	//_ "github.com/pydio/cells/v4/gateway/grpc"
	_ "github.com/pydio/cells/v4/gateway/data"
	_ "github.com/pydio/cells/v4/gateway/dav"
	_ "github.com/pydio/cells/v4/gateway/metrics"
	_ "github.com/pydio/cells/v4/gateway/sites"
	_ "github.com/pydio/cells/v4/gateway/websocket/service"
	_ "github.com/pydio/cells/v4/gateway/wopi"

	// IDM DAOs
	_ "github.com/pydio/cells/v4/idm/acl/dao/sql"
	_ "github.com/pydio/cells/v4/idm/key/dao/sql"
	_ "github.com/pydio/cells/v4/idm/meta/dao/sql"
	_ "github.com/pydio/cells/v4/idm/oauth/dao/sql"
	_ "github.com/pydio/cells/v4/idm/policy/dao/sql"
	_ "github.com/pydio/cells/v4/idm/role/dao/sql"
	_ "github.com/pydio/cells/v4/idm/user/dao/sql"
	_ "github.com/pydio/cells/v4/idm/workspace/dao/sql"

	// IDM
	_ "github.com/pydio/cells/v4/idm/acl/grpc/service"
	_ "github.com/pydio/cells/v4/idm/acl/rest/service"
	_ "github.com/pydio/cells/v4/idm/graph/rest/service"
	_ "github.com/pydio/cells/v4/idm/key/grpc/service"
	_ "github.com/pydio/cells/v4/idm/meta/grpc/service"
	_ "github.com/pydio/cells/v4/idm/meta/rest/service"
	_ "github.com/pydio/cells/v4/idm/oauth/grpc/service"
	_ "github.com/pydio/cells/v4/idm/oauth/rest/service"
	_ "github.com/pydio/cells/v4/idm/oauth/web/service"
	_ "github.com/pydio/cells/v4/idm/policy/grpc/service"
	_ "github.com/pydio/cells/v4/idm/policy/rest/service"
	_ "github.com/pydio/cells/v4/idm/role/grpc/service"
	_ "github.com/pydio/cells/v4/idm/role/rest/service"
	_ "github.com/pydio/cells/v4/idm/share/rest/service"
	_ "github.com/pydio/cells/v4/idm/user/grpc/service"
	_ "github.com/pydio/cells/v4/idm/user/rest/service"
	_ "github.com/pydio/cells/v4/idm/workspace/grpc/service"
	_ "github.com/pydio/cells/v4/idm/workspace/rest/service"

	// Scheduler and DAO
	_ "github.com/pydio/cells/v4/scheduler/jobs/dao/bolt"
	_ "github.com/pydio/cells/v4/scheduler/jobs/dao/mongo"
	_ "github.com/pydio/cells/v4/scheduler/jobs/grpc/service"
	_ "github.com/pydio/cells/v4/scheduler/jobs/rest/service"
	_ "github.com/pydio/cells/v4/scheduler/tasks/grpc/service"
	_ "github.com/pydio/cells/v4/scheduler/timer/service"

	// Scheduler Actions
	_ "github.com/pydio/cells/v4/broker/activity/actions"
	_ "github.com/pydio/cells/v4/common/etl/actions"
	_ "github.com/pydio/cells/v4/data/versions"
	_ "github.com/pydio/cells/v4/scheduler/actions/archive"
	_ "github.com/pydio/cells/v4/scheduler/actions/cmd"
	_ "github.com/pydio/cells/v4/scheduler/actions/idm"
	_ "github.com/pydio/cells/v4/scheduler/actions/images"
	_ "github.com/pydio/cells/v4/scheduler/actions/scheduler"
	_ "github.com/pydio/cells/v4/scheduler/actions/tools"
	_ "github.com/pydio/cells/v4/scheduler/actions/tree"

	// Brokers
	_ "github.com/pydio/cells/v4/common/broker/grpcpubsub"
	_ "github.com/pydio/cells/v4/common/broker/nats"
	_ "gocloud.dev/pubsub/mempubsub"
	// _ "gocloud.dev/pubsub/natspubsub"
	_ "gocloud.dev/pubsub/rabbitpubsub"

	// Config drivers
	_ "github.com/pydio/cells/v4/common/config/file"
	// _ "github.com/pydio/cells/v4/common/config/sql"

	// Servers
	_ "github.com/pydio/cells/v4/common/server/caddy/api"
	_ "github.com/pydio/cells/v4/common/server/caddy/embed"
	_ "github.com/pydio/cells/v4/common/server/fork"
	_ "github.com/pydio/cells/v4/common/server/generic"
	_ "github.com/pydio/cells/v4/common/server/grpc"
	_ "github.com/pydio/cells/v4/common/server/http"

	// Import Command Package after all Mux Registers
	"github.com/pydio/cells/v4/cmd"
)

func main() {
	common.PackageType = "PydioHome"
	common.PackageLabel = "Pydio Cells Home Edition"
	cmd.Execute()
}
