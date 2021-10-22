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

package main

import (
	"github.com/pydio/cells/cmd"

	// Making sure they are initialised first

	_ "github.com/pydio/cells/discovery/broker"
	_ "github.com/pydio/cells/discovery/config/grpc"
	_ "github.com/pydio/cells/discovery/config/rest"
	_ "github.com/pydio/cells/discovery/config/storage"
	_ "github.com/pydio/cells/discovery/healthcheck/rest"
	_ "github.com/pydio/cells/discovery/install/rest"
	_ "github.com/pydio/cells/discovery/registry"
	_ "github.com/pydio/cells/discovery/update/grpc"
	_ "github.com/pydio/cells/discovery/update/rest"

	_ "github.com/pydio/cells/broker/activity/grpc"
	_ "github.com/pydio/cells/broker/activity/rest"
	_ "github.com/pydio/cells/broker/chat/grpc"
	_ "github.com/pydio/cells/broker/log/grpc"
	_ "github.com/pydio/cells/broker/log/rest"
	_ "github.com/pydio/cells/broker/mailer/grpc"
	_ "github.com/pydio/cells/broker/mailer/rest"
	_ "github.com/pydio/cells/frontend/front-srv/rest"
	_ "github.com/pydio/cells/frontend/front-srv/web"

	_ "github.com/pydio/cells/data/docstore/grpc"
	_ "github.com/pydio/cells/data/key/grpc"
	_ "github.com/pydio/cells/data/meta/grpc"
	_ "github.com/pydio/cells/data/meta/rest"
	_ "github.com/pydio/cells/data/source/index/grpc"
	_ "github.com/pydio/cells/data/source/objects/grpc"
	_ "github.com/pydio/cells/data/source/sync/grpc"
	_ "github.com/pydio/cells/data/source/test"
	_ "github.com/pydio/cells/data/templates/rest"
	_ "github.com/pydio/cells/data/tree/grpc"
	_ "github.com/pydio/cells/data/tree/rest"
	_ "github.com/pydio/cells/data/versions/grpc"

	_ "github.com/pydio/cells/gateway/data"
	_ "github.com/pydio/cells/gateway/dav"
	_ "github.com/pydio/cells/gateway/grpc"
	_ "github.com/pydio/cells/gateway/micro"
	_ "github.com/pydio/cells/gateway/proxy"
	_ "github.com/pydio/cells/gateway/websocket/api"
	_ "github.com/pydio/cells/gateway/wopi"

	_ "github.com/pydio/cells/data/search/grpc"
	_ "github.com/pydio/cells/data/search/rest"
	_ "github.com/pydio/cells/idm/acl/grpc"
	_ "github.com/pydio/cells/idm/acl/rest"

	_ "github.com/pydio/cells/idm/graph/rest"
	_ "github.com/pydio/cells/idm/key/grpc"
	_ "github.com/pydio/cells/idm/meta/grpc"
	_ "github.com/pydio/cells/idm/meta/rest"
	_ "github.com/pydio/cells/idm/oauth/grpc"
	_ "github.com/pydio/cells/idm/oauth/rest"
	_ "github.com/pydio/cells/idm/oauth/web"
	_ "github.com/pydio/cells/idm/policy/grpc"
	_ "github.com/pydio/cells/idm/policy/rest"
	_ "github.com/pydio/cells/idm/role/grpc"
	_ "github.com/pydio/cells/idm/role/rest"
	_ "github.com/pydio/cells/idm/share/rest"
	_ "github.com/pydio/cells/idm/user/grpc"
	_ "github.com/pydio/cells/idm/user/rest"
	_ "github.com/pydio/cells/idm/workspace/grpc"
	_ "github.com/pydio/cells/idm/workspace/rest"
	_ "github.com/pydio/cells/scheduler/jobs/grpc"
	_ "github.com/pydio/cells/scheduler/jobs/rest"
	_ "github.com/pydio/cells/scheduler/tasks/grpc"
	_ "github.com/pydio/cells/scheduler/timer/grpc"

	// All Actions for scheduler
	_ "github.com/pydio/cells/broker/activity/actions"
	_ "github.com/pydio/cells/scheduler/actions/archive"
	_ "github.com/pydio/cells/scheduler/actions/changes"
	_ "github.com/pydio/cells/scheduler/actions/cmd"
	_ "github.com/pydio/cells/scheduler/actions/idm"
	_ "github.com/pydio/cells/scheduler/actions/images"
	_ "github.com/pydio/cells/scheduler/actions/scheduler"
	_ "github.com/pydio/cells/scheduler/actions/tree"

	// ETL Actions and stores
	_ "github.com/pydio/cells/common/etl/actions"
	_ "github.com/pydio/cells/common/etl/stores/cells/local"
	_ "github.com/pydio/cells/common/etl/stores/pydio8"

	"github.com/pydio/cells/common"
)

func main() {
	common.PackageType = "PydioHome"
	common.PackageLabel = "Pydio Cells Home Edition"
	cmd.Execute()
}
