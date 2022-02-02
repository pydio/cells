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

package cache

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
)

// EventWithContext composes a NodeChangeEvent and a context
type EventWithContext struct {
	*tree.NodeChangeEvent
	Ctx context.Context
}

// EventsBatcher debounces events on a given timeframe and calls process on them afterward
// Use globalCtx.Done() to stop listening to events
type EventsBatcher struct {
	Events chan *EventWithContext
	Done   chan bool

	globalCtx       context.Context
	batch           []*EventWithContext
	debounce        time.Duration
	idle            time.Duration
	maxEvents       int
	atomic          bool
	processOneOrAll func(context.Context, ...*tree.NodeChangeEvent)
}

// NewEventsBatcher initializes a new EventsBatcher
func NewEventsBatcher(ctx context.Context, debounce time.Duration, idle time.Duration, max int, atomic bool, process func(context.Context, ...*tree.NodeChangeEvent)) *EventsBatcher {
	b := &EventsBatcher{
		Events: make(chan *EventWithContext),

		globalCtx:       ctx,
		debounce:        debounce,
		idle:            idle,
		maxEvents:       max,
		atomic:          atomic,
		processOneOrAll: process,
	}
	go b.Start()
	return b
}

// Start starts listening to incoming events
func (b *EventsBatcher) Start() {
	next := b.debounce
	for {
		select {
		case e := <-b.Events:
			b.batch = append(b.batch, e)
			if b.maxEvents > 0 && len(b.batch) > b.maxEvents {
				b.process()
			}
			next = b.debounce
		case <-time.After(next):
			b.process()
			next = b.idle
		case <-b.globalCtx.Done():
			b.process()
			return
		}
	}
}

func (b *EventsBatcher) process() {
	if len(b.batch) == 0 {
		return
	}
	if b.atomic {
		log.Logger(b.globalCtx).Debug("Processing batched events one by one", zap.Int("size", len(b.batch)))
		for _, e := range b.batch {
			b.processOneOrAll(e.Ctx, e.NodeChangeEvent)
		}
	} else {
		log.Logger(b.globalCtx).Debug("Processing batched events as a batch", zap.Int("size", len(b.batch)))
		var cleanEvents []*tree.NodeChangeEvent
		for _, e := range b.batch {
			cleanEvents = append(cleanEvents, e.NodeChangeEvent)
		}
		b.processOneOrAll(b.globalCtx, cleanEvents...)
	}
	b.batch = []*EventWithContext{}
}
