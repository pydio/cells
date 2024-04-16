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

package grpc

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
)

// EventsSubscriber definition
type EventsSubscriber struct {
	broker.AsyncQueue
	outputChannel chan *broker.TypeWithContext[*tree.NodeChangeEvent]
}

func (e *EventsSubscriber) Start(ctx context.Context) error {
	if qu, err := broker.OpenAsyncQueue(ctx, runtime.PersistingQueueURL("serviceName", common.ServiceGrpcNamespace_+common.ServiceSearch, "name", "search")); err == nil {
		e.AsyncQueue = qu
	} else {
		log.Logger(ctx).Error("Cannot start queue, using an in-memory instead", zap.Error(err))

	}
	er := e.Consume(func(ctx context.Context, messages ...broker.Message) {
		for _, message := range messages {
			msg := &tree.NodeChangeEvent{}
			if ct, er := message.Unmarshal(ctx, msg); er == nil {
				_ = e.Handle(ct, msg)
			}
		}
	})
	return er
}

// Handle the events received and send them to the subscriber
func (e *EventsSubscriber) Handle(ctx context.Context, msg *tree.NodeChangeEvent) error {

	if msg.GetTarget() != nil && msg.GetTarget().HasMetaKey(common.MetaNamespaceDatasourceInternal) {
		return nil
	}
	if msg.GetType() == tree.NodeChangeEvent_DELETE && msg.GetSource().HasMetaKey(common.MetaNamespaceDatasourceInternal) {
		return nil
	}
	if msg.GetType() == tree.NodeChangeEvent_CREATE && (msg.GetTarget().Etag == common.NodeFlagEtagTemporary || tree.IgnoreNodeForOutput(ctx, msg.GetTarget())) {
		return nil
	}

	go func() {
		e.outputChannel <- &broker.TypeWithContext[*tree.NodeChangeEvent]{
			Ctx:      ctx,
			Original: msg,
		}
	}()
	return nil
}
