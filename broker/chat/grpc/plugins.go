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

// Package grpc provides a Pydio GRPC service for managing chat rooms.
package grpc

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/broker/chat"
	"github.com/pydio/cells/v4/common"
	proto "github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

var ServiceName = common.ServiceGrpcNamespace_ + common.ServiceChat

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Chat Service to attach real-time chats to various object. Coupled with WebSocket"),
			service.WithStorageDrivers(chat.NewBoltDAO, chat.NewMongoDAO),
			service.WithStorageMigrator(chat.Migrate),
			// service.WithStoragePrefix("chat"),
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {
				proto.RegisterChatServiceServer(server, &ChatHandler{RuntimeCtx: c})
				return nil
			}),
		)
	})
}
