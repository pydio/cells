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

package filesystem

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

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

// Crashes the test binary until fixed: run it alone with -run TestKnownBug_WatchStopWhileSending
func TestKnownBug_WatchStopWhileSending(t *testing.T) {
	knownBug(t, "RACE-E01", "stopping the FS watcher closes its channels while events are still being sent: panic (crashes the test binary)")
	dir, _ := filepath.EvalSymlinks(t.TempDir())
	c, err := NewFSClient(dir, model.EndpointOptions{})
	if err != nil {
		t.Fatal(err)
	}
	wo, err := c.Watch(context.Background(), "")
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 3; i++ {
		_ = os.Mkdir(filepath.Join(dir, fmt.Sprintf("d%d", i)), 0755)
	}
	time.Sleep(1500 * time.Millisecond) // events pending, nobody reads them
	wo.DoneChan <- true                 // as sync-watcher does on stop
	time.Sleep(time.Second)
}

func TestKnownBug_DebouncerStallsWatcher(t *testing.T) {
	knownBug(t, "RACE-E02", "a debouncer exiting while the dispatcher sends to it stalls the whole FS watcher")
	if testing.Short() {
		t.Skip("timing-based, can take ~30s")
	}
	dir, _ := filepath.EvalSymlinks(t.TempDir())
	c, err := NewFSClient(dir, model.EndpointOptions{})
	if err != nil {
		t.Fatal(err)
	}
	wo, err := c.Watch(context.Background(), "")
	if err != nil {
		t.Fatal(err)
	}
	got := make(chan string, 10000)
	go func() {
		for ev := range wo.EventInfoChan {
			got <- ev.Path
			time.Sleep(50 * time.Millisecond)
		}
	}()
	go func() {
		for range wo.ErrorChan {
		}
	}()
	// Rewrite files close to the 500ms debounce boundary, then check a new event still gets through
	for round := 0; round < 20; round++ {
		for k := 0; k < 8; k++ {
			p := filepath.Join(dir, fmt.Sprintf("f%d", k))
			_ = os.WriteFile(p, []byte(fmt.Sprint(round)), 0644)
			if round%3 == 0 {
				_ = os.Remove(p)
			}
		}
		time.Sleep(time.Duration(480+round%5*10) * time.Millisecond)
		probe := fmt.Sprintf("probe%d", round)
		_ = os.Mkdir(filepath.Join(dir, probe), 0755)
		deadline := time.After(3 * time.Second)
	wait:
		for {
			select {
			case p := <-got:
				if p == probe {
					break wait
				}
			case <-deadline:
				t.Fatalf("watcher stalled at round %d: the event for %s was never delivered", round, probe)
			}
		}
	}
}
