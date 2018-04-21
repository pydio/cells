package main

import (
	"github.com/pydio/services/cmd"

	_ "github.com/pydio/services/discovery/config/grpc"
	_ "github.com/pydio/services/discovery/config/rest"
	_ "github.com/pydio/services/discovery/consul"
	_ "github.com/pydio/services/discovery/install/rest"
	_ "github.com/pydio/services/discovery/nats"
	_ "github.com/pydio/services/discovery/update/grpc"
	_ "github.com/pydio/services/discovery/update/rest"

	_ "github.com/pydio/services/broker/activity/grpc"
	_ "github.com/pydio/services/broker/activity/rest"
	_ "github.com/pydio/services/broker/chat/grpc"
	_ "github.com/pydio/services/broker/log/grpc"
	_ "github.com/pydio/services/broker/log/rest"
	_ "github.com/pydio/services/broker/mailer/grpc"
	_ "github.com/pydio/services/broker/mailer/rest"
	_ "github.com/pydio/services/frontend/front-srv/rest"
	_ "github.com/pydio/services/frontend/front-srv/web"

	_ "github.com/pydio/services/data/docstore/grpc"
	_ "github.com/pydio/services/data/docstore/rest"
	_ "github.com/pydio/services/data/key/grpc"
	_ "github.com/pydio/services/data/meta/grpc"
	_ "github.com/pydio/services/data/meta/rest"
	_ "github.com/pydio/services/data/source/index/grpc"
	_ "github.com/pydio/services/data/source/objects/grpc"
	_ "github.com/pydio/services/data/source/sync/grpc"
	_ "github.com/pydio/services/data/tree/grpc"
	_ "github.com/pydio/services/data/tree/rest"
	_ "github.com/pydio/services/data/versions/grpc"

	_ "github.com/pydio/services/discovery/config/grpc"
	_ "github.com/pydio/services/discovery/config/rest"

	_ "github.com/pydio/services/gateway/data"
	_ "github.com/pydio/services/gateway/dav"
	_ "github.com/pydio/services/gateway/micro"
	_ "github.com/pydio/services/gateway/proxy"
	_ "github.com/pydio/services/gateway/websocket/api"
	_ "github.com/pydio/services/gateway/wopi"

	_ "github.com/pydio/services/data/search/grpc"
	_ "github.com/pydio/services/data/search/rest"
	_ "github.com/pydio/services/idm/acl/grpc"
	_ "github.com/pydio/services/idm/acl/rest"
	_ "github.com/pydio/services/idm/auth/grpc"
	_ "github.com/pydio/services/idm/auth/rest"
	_ "github.com/pydio/services/idm/graph/rest"
	_ "github.com/pydio/services/idm/key/grpc"
	_ "github.com/pydio/services/idm/meta/grpc"
	_ "github.com/pydio/services/idm/meta/rest"
	_ "github.com/pydio/services/idm/policy/grpc"
	_ "github.com/pydio/services/idm/policy/rest"
	_ "github.com/pydio/services/idm/role/grpc"
	_ "github.com/pydio/services/idm/role/rest"
	_ "github.com/pydio/services/idm/share/grpc"
	_ "github.com/pydio/services/idm/share/rest"
	_ "github.com/pydio/services/idm/user/grpc"
	_ "github.com/pydio/services/idm/user/rest"
	_ "github.com/pydio/services/idm/workspace/grpc"
	_ "github.com/pydio/services/idm/workspace/rest"
	_ "github.com/pydio/services/scheduler/jobs/grpc"
	_ "github.com/pydio/services/scheduler/jobs/rest"
	_ "github.com/pydio/services/scheduler/tasks/grpc"
	_ "github.com/pydio/services/scheduler/timer/grpc"

	// All Actions for scheduler
	_ "github.com/pydio/services/broker/activity/actions"
	_ "github.com/pydio/services/scheduler/actions/archive"
	_ "github.com/pydio/services/scheduler/actions/cmd"
	_ "github.com/pydio/services/scheduler/actions/images"
	_ "github.com/pydio/services/scheduler/actions/scheduler"
	_ "github.com/pydio/services/scheduler/actions/tree"

	"github.com/pydio/services/common"
)

func main() {
	common.PackageType = "PydioHome"
	common.PackageLabel = "PydioCells Home Edition"
	cmd.Execute()
}
