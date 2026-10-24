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
	"os"
	"testing"
	"time"

	"github.com/gobwas/glob"

	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/internal/timings"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Tests in this file pin known bugs that are not fixed yet: they assert the expected behaviour
// and are skipped by default. Run them with SYNC_KNOWN_BUGS=1 to check they still detect the bug.
// When fixing a bug, remove the knownBug call of its test.
func knownBug(t *testing.T, id, summary string) {
	t.Helper()
	if os.Getenv("SYNC_KNOWN_BUGS") != "1" {
		t.Skipf("known bug %s: %s", id, summary)
	}
}

func TestKnownBug_SelectiveRootsTrailingSlash(t *testing.T) {
	knownBug(t, "BUG-23", "a selective root with a trailing slash filters out every event")
	f := NewSelectiveRootsFilter([]string{"/docs/"})
	if f.isOutside("docs/a.txt") {
		t.Fatal("docs/a.txt is inside root /docs/")
	}
}

func TestKnownBug_SelectiveRootsRootItself(t *testing.T) {
	knownBug(t, "BUG-23", "events on the selective root folder itself are considered outside")
	f := NewSelectiveRootsFilter([]string{"/docs"})
	if f.isOutside("docs") {
		t.Fatal("the root folder itself is not outside")
	}
}

func TestKnownBug_SelectiveRootsDropMetadataEvents(t *testing.T) {
	knownBug(t, "BUG-23", "metadata events are dropped as soon as selective roots are set")
	f := NewSelectiveRootsFilter([]string{"/docs"})
	in := make(chan model.EventInfo, 1)
	out := f.Pipe(in)
	in <- model.EventInfo{Type: model.EventMetaPut, Path: "docs/a"}
	select {
	case e := <-out:
		if e.Type != model.EventMetaPut {
			t.Fatalf("unexpected event %v", e.Type)
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatal("EventMetaPut inside the root was dropped")
	}
}

func TestKnownBug_BatcherDebounceStarvation(t *testing.T) {
	knownBug(t, "BUG-22", "the batcher debounce is reset by ignored events: under steady noise, real changes are never flushed")
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	ignores := []glob.Glob{glob.MustCompile("**/*.tmp", '/')}
	debounce := 100 * time.Millisecond
	b := NewEventsBatcher(context.Background(), src, tgt, ignores, debounce)
	in := make(chan model.EventInfo)
	out := make(chan merger.Patch, 10)
	b.Batch(in, out)
	in <- model.EventInfo{Type: model.EventCreate, Path: "real.txt", ScanEvent: true}
	for start := time.Now(); time.Since(start) < 10*debounce; {
		in <- model.EventInfo{Type: model.EventCreate, Path: "x/noise.tmp", ScanEvent: true}
		time.Sleep(debounce / 3)
	}
	if len(out) == 0 {
		t.Fatal("no patch emitted for real.txt while only ignored events kept arriving")
	}
}

func TestKnownBug_EchoLockConsumedByFirstEvent(t *testing.T) {
	knownBug(t, "BUG-26", "an echo lock is consumed by the first matching event: further echoes pass as user changes")
	f := NewEchoFilter()
	f.Start()
	defer f.Stop()
	src := memory.NewMemDB()
	f.GetLocksChan() <- model.LockEvent{Type: model.LockEventLock, Source: src, Path: "a.txt", OperationId: "op1"}
	time.Sleep(50 * time.Millisecond)
	in := make(chan model.EventInfo, 2)
	out := f.Pipe(in)
	in <- model.EventInfo{Source: src, Path: "a.txt", Type: model.EventCreate}
	in <- model.EventInfo{Source: src, Path: "a.txt", Type: model.EventCreate}
	if e1, e2 := <-out, <-out; e1.OperationId != "op1" || e2.OperationId != "op1" {
		t.Fatalf("both echoes should be tagged with op1, got %q and %q", e1.OperationId, e2.OperationId)
	}
}

// Crashes the test binary until fixed: run it alone with -run TestKnownBug_BatcherFlushOnClosedPatchChan
func TestKnownBug_BatcherFlushOnClosedPatchChan(t *testing.T) {
	knownBug(t, "RACE-04", "the batcher flushes pending events on the patch channel closed by Sync.Shutdown: panic (crashes the test binary)")
	defer timings.ForTests()()
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	b := NewEventsBatcher(context.Background(), src, tgt, nil)
	in := make(chan model.EventInfo)
	out := make(chan merger.Patch, 1)
	b.Batch(in, out)
	in <- model.EventInfo{Type: model.EventCreate, Path: "a.txt", ScanEvent: true}
	// Sync.Shutdown order: processor.Stop closes the patch chan, watchers close the input asynchronously
	close(out)
	close(in)
	<-time.After(10 * timings.BatcherDebounce.Get())
}

// Crashes the test binary until fixed: run it alone with -run TestKnownBug_BatcherActivityOnClosedStatusChan
func TestKnownBug_BatcherActivityOnClosedStatusChan(t *testing.T) {
	knownBug(t, "RACE-04", "the batcher reports idle activity on the status channel closed by Sync.Shutdown: panic (crashes the test binary)")
	defer timings.ForTests()()
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	b := NewEventsBatcher(context.Background(), src, tgt, nil, time.Hour)
	st := make(chan *model.EndpointStatus)
	go func() {
		for range st {
		}
	}()
	b.SetEndpointStatusChan(st)
	in := make(chan model.EventInfo)
	b.Batch(in, make(chan merger.Patch, 1))
	in <- model.EventInfo{Type: model.EventCreate, Path: "a.txt", ScanEvent: true}
	<-time.After(timings.BatcherIdleDelay.Get() / 2)
	close(st) // Sync.Shutdown closes watchConn while the batcher is still active
	<-time.After(10 * timings.BatcherIdleDelay.Get())
}
