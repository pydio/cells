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

package changes

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
)

// BatchInsert buffers changes to store them using a bulk insert query
type BatchInsert struct {
	timeout time.Duration
	maxSize int
	input   chan *tree.SyncChange
	changes []*tree.SyncChange
	dao     DAO
}

// NewBatchInsert creates a new BatchInsert and start watching for incoming changes
func NewBatchInsert(dao DAO, timeout time.Duration, maxSize int) *BatchInsert {
	b := &BatchInsert{
		timeout: timeout,
		maxSize: maxSize,
		dao:     dao,
		input:   make(chan *tree.SyncChange),
	}
	go b.Start()
	return b
}

// Start should be called as a goroutine to receive changes and trigger flush when necessary
func (b *BatchInsert) Start() {
	for {
		select {
		case c := <-b.input:
			if b.changes != nil {
				last := b.changes[len(b.changes)-1]
				// Simple deduplication with last input
				if last.Type == c.Type && last.NodeId == c.NodeId && last.Source == c.Source && last.Target == c.Target {
					continue
				}
			}
			b.changes = append(b.changes, c)
			if len(b.changes) >= b.maxSize {
				b.Flush()
			}
		case <-time.After(b.timeout):
			b.Flush()
		}
	}
}

// Put enqueues change to internal queue
func (b *BatchInsert) Put(c *tree.SyncChange) {
	b.input <- c
}

// Flush empties queue and store its content to DAO using BulkPut() method
func (b *BatchInsert) Flush() {
	if b.changes == nil {
		return
	}
	BackgroundLogger().Debug(fmt.Sprintf("Flushing batcher with %d changes", len(b.changes)))
	if err := b.dao.BulkPut(b.changes); err != nil {
		BackgroundLogger().Error("Error while storing changes as bulk! Trying with Put method", zap.Error(err))
		for _, c := range b.changes {
			if e := b.dao.Put(c); e != nil {
				BackgroundLogger().Error("-- Still failing (changes resync might be necessary)", zap.Any("change", c), zap.Error(err))
			}
		}
	}
	b.changes = nil
}

// BackgroundLogger creates a logger with service name
func BackgroundLogger() *zap.Logger {
	return log.Logger(servicecontext.WithServiceName(context.Background(), common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CHANGES))
}
