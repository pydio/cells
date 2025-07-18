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

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// EventsSubscriber definition
type EventsSubscriber struct {
	outputChannel chan *broker.TypeWithContext[*tree.NodeChangeEvent]
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
