/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
package merger

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

// Batch represents a set of operations to be processed
type Batch interface {
	model.Stater

	// Source get or set the source of this batch
	Source(newSource ...model.PathSyncSource) model.PathSyncSource
	// Target get or set the target of this batch
	Target(newTarget ...model.PathSyncTarget) model.PathSyncTarget

	// Enqueue stacks a BatchOperation - By default, it is registered with the event.Key, but an optional key can be passed.
	// TODO : check this key param is really necessary
	Enqueue(event *BatchOperation, key ...string)
	// EventsByTypes retrieves all events of a given type
	EventsByType(types []BatchOperationType, sorted ...bool) (events []*BatchOperation)
	// Filter tries to detect unnecessary changes locally
	Filter(ctx context.Context)
	// FilterToTarget tries to compare changes to target and remove unnecessary ones
	FilterToTarget(ctx context.Context)

	// HasTransfers tels if the source and target will exchange actual data.
	HasTransfers() bool
	// Size returns the total number of operations
	Size() int
	// ProgressTotal returns the total number of bytes to be processed, to be used for progress.
	// Basically, file transfers operations returns the file size, but other operations return a 1 byte size.
	ProgressTotal() int64

	// SetupChannels register channels for listening to status and done infos
	SetupChannels(done chan int, status chan BatchProcessStatus)
	// Status notify of a new BatchProcessStatus
	Status(s BatchProcessStatus)
	// Done notify the batch is processed, operations is the number of processed operations
	Done(operations int)

	// SetSessionProvider registers a target as supporting the SessionProvider interface
	SetSessionProvider(providerContext context.Context, provider model.SessionProvider)
	// StartSessionProvider calls StartSession on the underlying provider if it is set
	StartSessionProvider(rootNode *tree.Node) (*tree.IndexationSession, error)
	// FlushSessionProvider calls FlushSession on the underlying provider if it is set
	FlushSessionProvider(sessionUuid string) error
	// FinishSessionProvider calls FinishSession on the underlying provider if it is set
	FinishSessionProvider(sessionUuid string) error
}
