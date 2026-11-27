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

package filters

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/internal/timings"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Tests in this file pin bugs that were fixed (formerly in known_bugs_test.go).

// RACE-04: the batcher reported idle activity on the status channel closed by Sync.Shutdown (panic).
// The task now passes a guarded sender (SetEndpointStatusSender): the batcher must report through it only.
func TestBatcherActivityThroughGuardedSender(t *testing.T) {
	defer timings.ForTests()()
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	b := NewEventsBatcher(context.Background(), src, tgt, nil, time.Hour)
	st := make(chan *model.EndpointStatus)
	go func() {
		for range st {
		}
	}()
	var mu sync.Mutex
	closed := false
	b.SetEndpointStatusSender(func(s *model.EndpointStatus) {
		mu.Lock()
		defer mu.Unlock()
		if !closed {
			st <- s
		}
	})
	in := make(chan model.EventInfo)
	b.Batch(in, make(chan merger.Patch, 1))
	in <- model.EventInfo{Type: model.EventCreate, Path: "a.txt", ScanEvent: true}
	<-time.After(timings.BatcherIdleDelay.Get() / 2)
	mu.Lock()
	closed = true
	close(st) // Sync.Shutdown closes watchConn while the batcher is still active
	mu.Unlock()
	<-time.After(10 * timings.BatcherIdleDelay.Get())
}
