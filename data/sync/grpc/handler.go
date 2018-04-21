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
	"encoding/json"

	"github.com/pkg/errors"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	protosync "github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/sync"
	"go.uber.org/zap"
)

// Handler exposes the Sync microservice to the pydio backend
type Handler struct{ Merger *sync.Merger }

// NewHandler creates a new Handler from a config
func NewHandler(config config.Map) (*Handler, error) {

	left := config.Get("left")
	right := config.Get("right")
	if left == nil || right == nil {
		return nil, errors.New("Wrong configuration, please pass at least one left and one right key")
	}
	var Left, Right sync.EndpointConfig
	if err := json.Unmarshal([]byte(left.(string)), &Left); err != nil {
		return nil, errors.New("Could not unmarshal left key to an Endpoint Config")
	}
	if err := json.Unmarshal([]byte(right.(string)), &Right); err != nil {
		return nil, errors.New("Could not unmarshal right key to an Endpoint Config")
	}

	m := &Handler{Merger: sync.NewTwoWay(Left, Right)}
	log.Logger(context.Background()).Info("Starting Handler with following endpoints", zap.Any("left", Left), zap.Any("right", Right))

	return m, nil
}

// TriggerResync runs a syncrhonization.  It can be triggered with the following
// client command:  `client data sync --service=pydio.grpc.sync`
func (h *Handler) TriggerResync(ctx context.Context, request *protosync.ResyncRequest, response *protosync.ResyncResponse) (err error) {
	if err = h.Merger.Resync(ctx); err != nil {
		log.Logger(ctx).Error("sync failed", zap.String("error", err.Error()))
	}

	return
}

// OnTreeEvent is called when an event from the tree is received
func (h *Handler) OnTreeEvent(ctx context.Context, event *tree.NodeChangeEvent) error {

	var refNode *tree.Node
	if event.Source != nil {
		refNode = event.Source
	} else if event.Target != nil {
		refNode = event.Target
	} else {
		return errors.New("Could not find reference node in event")
	}

	if h.Merger.Left.IsFromSide(refNode) {
		h.Merger.Left.TrimRootPath(refNode)
		return h.Merger.OnLeftEvent(ctx, event)
	} else if h.Merger.Right.IsFromSide(refNode) {
		h.Merger.Right.TrimRootPath(refNode)
		return h.Merger.OnRightEvent(ctx, event)
	}

	return nil
}
