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
	"errors"
	"io"
	"os"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"
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

// kbSource serves a fixed content for any file
type kbSource struct{ *memory.MemDB }

func (s *kbSource) GetReaderOn(ctx context.Context, p string, n tree.N) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader("hello world")), nil
}

// kbS3Target mimics the S3 / Cells writers: the upload fails after the body was fully read,
// then both writeErr and writeDone are ready.
type kbS3Target struct{ *memory.MemDB }

func (s *kbS3Target) GetWriterOn(c context.Context, p string, size int64, n tree.N) (io.WriteCloser, chan bool, chan error, error) {
	wd := make(chan bool, 1)
	we := make(chan error, 1)
	r, w := io.Pipe()
	go func() {
		defer func() { close(wd); close(we) }()
		buf := make([]byte, size)
		_, _ = io.ReadFull(r, buf) // like PutObject with a known size: does not wait for EOF
		we <- errors.New("PutObject failed")
		go func() { _, _ = io.Copy(io.Discard, r) }()
	}()
	return w, wd, we, nil
}

type kbWriter struct{ closeErr error }

func (kbWriter) Write(p []byte) (int, error) { return len(p), nil }
func (w kbWriter) Close() error              { return w.closeErr }

// kbFSTarget mimics the FS writer: the commit (tmp -> target rename) happens in Close,
// and no writeDone / writeErr channels are returned. failures is the number of
// GetWriterOn calls failing before succeeding (-1 = always succeed but fail on Close).
type kbFSTarget struct {
	*memory.MemDB
	failures int32
	calls    atomic.Int32
}

func (s *kbFSTarget) GetWriterOn(c context.Context, p string, size int64, n tree.N) (io.WriteCloser, chan bool, chan error, error) {
	call := s.calls.Add(1)
	if s.failures < 0 {
		return kbWriter{closeErr: errors.New("rename tmp->target failed")}, nil, nil, nil
	}
	if call <= s.failures {
		return nil, nil, nil, errors.New("transient error")
	}
	return kbWriter{}, nil, nil, nil
}

func kbCreateFileOp(src model.PathSyncSource, tgt model.PathSyncTarget) (merger.Patch, merger.Operation) {
	p := merger.NewPatch(src, tgt, merger.PatchOptions{})
	n := &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Size: 11, Etag: "x"}
	op := merger.NewOperation(merger.OpCreateFile, model.EventInfo{Path: "a.txt"}, n)
	p.Enqueue(op)
	return p, op
}

func kbProgress() chan int64 {
	c := make(chan int64)
	go func() {
		for range c {
		}
	}()
	return c
}

func TestKnownBug_RetriedTransferKeepsError(t *testing.T) {
	knownBug(t, "BUG-13", "a transfer failing once then succeeding on retry keeps its error: the whole patch is flagged as failed")
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

// Crashes the test binary until fixed: run it alone with -run TestKnownBug_UnlockAfterEchoFilterStop
func TestKnownBug_UnlockAfterEchoFilterStop(t *testing.T) {
	knownBug(t, "RACE-04", "a delayed UnlockFile sends on the locks channel closed by Sync.Shutdown: panic (crashes the test binary)")
	defer timings.ForTests()()
	cp := NewConnectedProcessor(context.Background(), nil)
	locks := make(chan model.LockEvent)
	go func() {
		for range locks {
		}
	}()
	cp.SetLocksChan(locks)
	_, op := kbCreateFileOp(&kbSource{memory.NewMemDB()}, memory.NewMemDB())
	cp.UnlockFile(op, "a.txt") // sends after EchoUnlockDelay
	close(locks)               // what echoFilter.Stop() does during Sync.Shutdown
	<-time.After(5 * timings.EchoUnlockDelay.Get())
}
