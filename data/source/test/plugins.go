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

package test

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/test"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

var name = common.ServiceTestNamespace_ + "objects"

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Test Objects Service conformance"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				h := NewHandler()
				test.RegisterTesterEnhancedServer(server, h)
				go func() {
					<-time.After(10 * time.Second)
					resp, e := h.TestNodesClient(ctx)
					fmt.Println("Test Result", resp, e)
				}()
				return nil
			}),
		)
	})
}
