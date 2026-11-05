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

package model

import (
	"os"
	"testing"
	"time"
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

func TestKnownBug_CommandDeadlockOnDepartedSubscriber(t *testing.T) {
	knownBug(t, "RACE-03", "Command sends to listeners while holding its lock: a subscriber leaving after an Interrupt deadlocks it")
	for i := 0; i < 50; i++ {
		c := NewCommand()
		sub, unsub := c.Subscribe()
		go func() {
			defer close(unsub) // same pattern as Processor.Process
			for {
				if cmd := <-sub; cmd == Interrupt {
					return
				}
			}
		}()
		c.Publish(Interrupt)
		c.Publish(Interrupt) // user clicks twice
		done := make(chan bool)
		go func() {
			c.Publish(Pause)
			c.Publish(Resume)
			close(done)
		}()
		select {
		case <-done:
		case <-time.After(500 * time.Millisecond):
			t.Fatalf("iteration %d: Publish blocked, the command dispatcher is deadlocked", i)
		}
	}
}
