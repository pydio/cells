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

package proc

import (
	"context"
	"testing"

	"go.uber.org/goleak"

	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/internal/timings"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Tests in this file pin bugs that were fixed (formerly in known_bugs_test.go).

func TestRetriedTransferClearsError(t *testing.T) {
	defer timings.ForTests()()
	pr := NewProcessor(context.Background())
	p, op := kbCreateFileOp(&kbSource{memory.NewMemDB()}, &kbFSTarget{MemDB: memory.NewMemDB(), failures: 1})
	var cursor int64
	if e := pr.applyProcessFunc(context.Background(), p, op, "id", &cursor, 11, true); e != nil {
		t.Fatalf("retry should succeed, got %v", e)
	}
	if !op.IsProcessed() {
		t.Fatal("operation should be processed")
	}
	if errs, has := p.HasErrors(); has {
		t.Fatalf("patch should have no errors after a successful retry, got %v", errs)
	}
}

func TestFailedRetriesKeepError(t *testing.T) {
	defer timings.ForTests()()
	pr := NewProcessor(context.Background())
	p, op := kbCreateFileOp(&kbSource{memory.NewMemDB()}, &kbFSTarget{MemDB: memory.NewMemDB(), failures: 1000})
	var cursor int64
	if e := pr.applyProcessFunc(context.Background(), p, op, "id", &cursor, 11, true); e == nil {
		t.Fatal("all attempts failed, an error should be returned")
	}
	if _, has := p.HasErrors(); !has || op.Error() == nil {
		t.Fatal("the operation and the patch should have errors when all attempts fail")
	}
}

// RACE-04: a delayed UnlockFile sent on the locks channel closed by the echo filter during Sync.Shutdown (panic).
// The locks channel is no longer closed, and delayed unlocks give up once the processor is stopped.
func TestUnlockAfterStopGivesUp(t *testing.T) {
	defer goleak.VerifyNone(t, goleak.IgnoreCurrent())
	defer timings.ForTests()()
	cp := NewConnectedProcessor(context.Background(), nil)
	cp.SetLocksChan(make(chan model.LockEvent)) // nobody reads it after Shutdown, like the echo filter's
	_, op := kbCreateFileOp(&kbSource{memory.NewMemDB()}, memory.NewMemDB())
	cp.UnlockFile(op, "a.txt") // sends after EchoUnlockDelay
	cp.Stop()
	// goleak fails if the delayed unlock is still blocked on the channel
}
