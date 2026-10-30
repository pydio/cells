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

package chanwatcher

import (
	"context"
	"os"
	"testing"
	"time"

	"go.uber.org/goleak"
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

func TestKnownBug_WatcherSpinsAfterCancel(t *testing.T) {
	knownBug(t, "RACE-E05", "after context cancel the watch goroutine spins forever (break only exits the select)")
	defer goleak.VerifyNone(t, goleak.IgnoreCurrent())
	ctx, cancel := context.WithCancel(context.Background())
	w := NewWatcher(ctx, nil, "")
	if _, e := w.Watch(ctx, ""); e != nil {
		t.Fatal(e)
	}
	cancel()
}

func TestKnownBug_WatcherIgnoresDoneChan(t *testing.T) {
	knownBug(t, "RACE-E05", "the watcher never reads DoneChan: stopping it blocks sync-watcher forever")
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	w := NewWatcher(ctx, nil, "")
	wo, e := w.Watch(ctx, "")
	if e != nil {
		t.Fatal(e)
	}
	select {
	case wo.DoneChan <- true: // as sync-watcher does on stop
	case <-time.After(time.Second):
		t.Fatal("DoneChan send blocked: the watcher does not read it")
	}
}
