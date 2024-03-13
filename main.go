package main

import (
	"github.com/pydio/cells/v4/common"

	// Register minio client for objects storage
	_ "github.com/pydio/cells/v4/common/nodes/objects/mc"

	// Frontend
	_ "github.com/pydio/cells/v4/frontend/front-srv/rest"
	_ "github.com/pydio/cells/v4/frontend/front-srv/web"

	// Discovery
	_ "github.com/pydio/cells/v4/discovery/broker/grpc"
	_ "github.com/pydio/cells/v4/discovery/config/grpc"
	_ "github.com/pydio/cells/v4/discovery/config/web"

	//_ "github.com/pydio/cells/v4/discovery/install/rest"
	//_ "github.com/pydio/cells/v4/discovery/install/web"
	_ "github.com/pydio/cells/v4/discovery/registry"
	//_ "github.com/pydio/cells/v4/discovery/update/grpc"
	//_ "github.com/pydio/cells/v4/discovery/update/rest"

	// Data
	_ "github.com/pydio/cells/v4/data/docstore/grpc"
	_ "github.com/pydio/cells/v4/data/key/grpc"
	_ "github.com/pydio/cells/v4/data/meta/grpc"
	_ "github.com/pydio/cells/v4/data/meta/rest"
	_ "github.com/pydio/cells/v4/data/search/grpc"
	_ "github.com/pydio/cells/v4/data/search/rest"

	//	_ "github.com/pydio/cells/v4/data/source/index"
	//_ "github.com/pydio/cells/v4/data/source/index/grpc"
	//_ "github.com/pydio/cells/v4/data/source/objects"
	//_ "github.com/pydio/cells/v4/data/source/objects/grpc"
	//_ "github.com/pydio/cells/v4/data/source/sync"
	//_ "github.com/pydio/cells/v4/data/source/sync/grpc"
	//_ "github.com/pydio/cells/v4/data/templates/rest"
	//_ "github.com/pydio/cells/v4/data/tree/grpc"
	//_ "github.com/pydio/cells/v4/data/tree/rest"
	//_ "github.com/pydio/cells/v4/data/versions/grpc"

	// ETL Stores
	_ "github.com/pydio/cells/v4/common/etl/stores/cells/local"
	_ "github.com/pydio/cells/v4/common/etl/stores/pydio8"

	// Registry
	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/registry/service"

	// Broker
	//_ "github.com/pydio/cells/v4/broker/activity/grpc"
	//_ "github.com/pydio/cells/v4/broker/activity/rest"
	//_ "github.com/pydio/cells/v4/broker/chat/grpc"
	//_ "github.com/pydio/cells/v4/broker/log/grpc"
	//_ "github.com/pydio/cells/v4/broker/log/rest"
	//_ "github.com/pydio/cells/v4/broker/mailer/grpc"
	//_ "github.com/pydio/cells/v4/broker/mailer/rest"

	// Cache
	_ "github.com/pydio/cells/v4/common/utils/cache/bigcache"
	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"
	_ "github.com/pydio/cells/v4/common/utils/cache/redis"
	_ "github.com/pydio/cells/v4/common/utils/queue/goque"
	_ "github.com/pydio/cells/v4/common/utils/queue/jetstream"
	_ "github.com/pydio/cells/v4/common/utils/queue/memory"

	// Gateways
	_ "github.com/pydio/cells/v4/gateway/data"
	_ "github.com/pydio/cells/v4/gateway/dav"

	//_ "github.com/pydio/cells/v4/gateway/grpc"
	_ "github.com/pydio/cells/v4/gateway/metrics"
	//_ "github.com/pydio/cells/v4/gateway/websocket/api"
	_ "github.com/pydio/cells/v4/gateway/wopi"

	// IDM
	_ "github.com/pydio/cells/v4/idm/acl/grpc"
	_ "github.com/pydio/cells/v4/idm/acl/rest"
	_ "github.com/pydio/cells/v4/idm/graph/rest"
	_ "github.com/pydio/cells/v4/idm/key/grpc"
	_ "github.com/pydio/cells/v4/idm/meta/grpc"
	_ "github.com/pydio/cells/v4/idm/meta/rest"
	//_ "github.com/pydio/cells/v4/idm/oauth/grpc"
	//_ "github.com/pydio/cells/v4/idm/oauth/rest"
	//_ "github.com/pydio/cells/v4/idm/oauth/web"
	_ "github.com/pydio/cells/v4/idm/policy/grpc"
	_ "github.com/pydio/cells/v4/idm/policy/rest"
	_ "github.com/pydio/cells/v4/idm/role/grpc"
	_ "github.com/pydio/cells/v4/idm/role/rest"
	_ "github.com/pydio/cells/v4/idm/share/rest"
	_ "github.com/pydio/cells/v4/idm/user/grpc"
	_ "github.com/pydio/cells/v4/idm/user/rest"
	_ "github.com/pydio/cells/v4/idm/workspace/grpc"
	_ "github.com/pydio/cells/v4/idm/workspace/rest"

	// Scheduler
	//_ "github.com/pydio/cells/v4/scheduler/jobs/grpc"
	//_ "github.com/pydio/cells/v4/scheduler/jobs/rest"
	//_ "github.com/pydio/cells/v4/scheduler/tasks/grpc"
	//_ "github.com/pydio/cells/v4/scheduler/timer/grpc"

	// Scheduler Actions
	//_ "github.com/pydio/cells/v4/broker/activity/actions"
	//_ "github.com/pydio/cells/v4/common/etl/actions"
	//_ "github.com/pydio/cells/v4/data/versions"
	//_ "github.com/pydio/cells/v4/scheduler/actions/archive"
	//_ "github.com/pydio/cells/v4/scheduler/actions/cmd"
	//_ "github.com/pydio/cells/v4/scheduler/actions/idm"
	//_ "github.com/pydio/cells/v4/scheduler/actions/images"
	//_ "github.com/pydio/cells/v4/scheduler/actions/scheduler"
	//_ "github.com/pydio/cells/v4/scheduler/actions/tools"
	//_ "github.com/pydio/cells/v4/scheduler/actions/tree"

	// Brokers
	_ "github.com/pydio/cells/v4/common/broker/grpcpubsub"
	_ "github.com/pydio/cells/v4/common/broker/nats"
	_ "gocloud.dev/pubsub/mempubsub"
	// _ "gocloud.dev/pubsub/natspubsub"
	_ "gocloud.dev/pubsub/rabbitpubsub"

	// Config drivers
	_ "github.com/pydio/cells/v4/common/config/sql"

	// DAO Drivers
	_ "github.com/pydio/cells/v4/common/dao/bleve"
	_ "github.com/pydio/cells/v4/common/dao/boltdb"
	_ "github.com/pydio/cells/v4/common/dao/mongodb"
	_ "github.com/pydio/cells/v4/common/dao/mysql"

	// Servers
	_ "github.com/pydio/cells/v4/common/server/caddy"
	_ "github.com/pydio/cells/v4/common/server/fork"
	_ "github.com/pydio/cells/v4/common/server/generic"
	_ "github.com/pydio/cells/v4/common/server/grpc"
	_ "github.com/pydio/cells/v4/common/server/http"

	// Tracing
	_ "github.com/pydio/cells/v4/common/tracing/jaeger"

	// Import Command Package after all Mux Registers
	"github.com/pydio/cells/v4/cmd"
)

func main() {
	common.PackageType = "PydioHome"
	common.PackageLabel = "Pydio Cells Home Edition"
	cmd.Execute()
}
