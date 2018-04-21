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

package grpc

import (
	"context"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
)

type EventSubscriber struct {
	TreeServer  *TreeServer
	EventClient client.Client
}

// Handle incoming INDEX events and resend them as TREE events
func (s *EventSubscriber) Handle(ctx context.Context, msg *tree.NodeChangeEvent) error {

	// Update Source & Target Nodes
	source, target := msg.Source, msg.Target
	if source != nil {
		var dsSource string
		source.GetMeta(common.META_NAMESPACE_DATASOURCE_NAME, &dsSource)
		s.TreeServer.updateDataSourceNode(source, dsSource)
	}
	if target != nil {
		var dsTarget string
		target.GetMeta(common.META_NAMESPACE_DATASOURCE_NAME, &dsTarget)
		s.TreeServer.updateDataSourceNode(target, dsTarget)
	}

	//log.Logger(ctx).Info("Handle", zap.Any("source", source), zap.Any("target", target))

	s.EventClient.Publish(ctx, s.EventClient.NewPublication(common.TOPIC_TREE_CHANGES, msg))

	return nil
}
