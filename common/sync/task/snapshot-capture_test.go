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

package task

import (
	"context"
	"errors"
	"os"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/v5/common/sync/internal/timings"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Tests in this file check when bidirectional snapshots are captured: they must only record
// changes that were successfully applied on both sides (BUG-12 / V5R-02).

// knownBug skips a test pinning a known bug, unless SYNC_KNOWN_BUGS=1.
func knownBug(t *testing.T, id, summary string) {
	t.Helper()
	if os.Getenv("SYNC_KNOWN_BUGS") != "1" {
		t.Skipf("known bug %s: %s", id, summary)
	}
}

// snapFactory provides one bolt snapshot per endpoint, named after the endpoint URI.
type snapFactory struct {
	dir   string
	lock  sync.Mutex
	snaps map[string]*snapshot.BoltSnapshot
}

func (f *snapFactory) Load(src model.PathSyncSource) (model.Snapshoter, error) {
	f.lock.Lock()
	defer f.lock.Unlock()
	name := strings.TrimPrefix(src.GetEndpointInfo().URI, "memdb://")
	if s, ok := f.snaps[name]; ok {
		return s, nil
	}
	s, e := snapshot.NewBoltSnapshot(context.Background(), f.dir, name)
	if e != nil {
		return nil, e
	}
	f.snaps[name] = s
	return s, nil
}

func (f *snapFactory) Close(ctx context.Context) error {
	f.lock.Lock()
	defer f.lock.Unlock()
	for _, s := range f.snaps {
		s.Close()
	}
	return nil
}

func (f *snapFactory) Reset(ctx context.Context) error { return nil }

// paths lists the files and folders recorded in a snapshot (empty if never captured)
func (f *snapFactory) paths(t *testing.T, name string) []string {
	f.lock.Lock()
	s, ok := f.snaps[name]
	f.lock.Unlock()
	if !ok || s.IsEmpty() {
		return nil
	}
	var pp []string
	_ = s.Walk(context.Background(), func(p string, n tree.N, e error) error {
		if p = strings.Trim(p, "/"); p != "" {
			pp = append(pp, p)
		}
		return nil
	}, "/", true)
	sort.Strings(pp)
	return pp
}

// flakyTarget wraps a MemDB: CreateNode on failPath fails failures times (-1 = always), and
// CreateNode on blockPath signals blocked then waits for release.
type flakyTarget struct {
	*memory.MemDB
	lock      sync.Mutex
	failPath  string
	failures  int
	blockPath string
	blocked   chan struct{}
	release   chan struct{}
}

func (f *flakyTarget) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) error {
	p := strings.Trim(node.GetPath(), "/")
	f.lock.Lock()
	fail := p == f.failPath && f.failures != 0
	if fail && f.failures > 0 {
		f.failures--
	}
	block := p == f.blockPath && f.blocked != nil
	f.lock.Unlock()
	if fail {
		return errors.New("simulated transfer failure")
	}
	if block {
		close(f.blocked)
		<-f.release
	}
	return f.MemDB.CreateNode(ctx, node, updateIfExists)
}

type biFixture struct {
	sync    *Sync
	left    *memory.MemDB
	right   *flakyTarget
	snaps   *snapFactory
	done    chan interface{}
	statues chan model.Status
}

// newBiFixture starts a bidirectional sync between MemDBs with bolt snapshots, optionally with watchers
func newBiFixture(t *testing.T, withWatches ...bool) *biFixture {
	restore := timings.ForTests()
	t.Cleanup(restore)
	left := memory.NewMemDB()
	left.SetTestPathURI("left")
	rightDB := memory.NewMemDB()
	rightDB.SetTestPathURI("right")
	right := &flakyTarget{MemDB: rightDB}
	f := &biFixture{
		left:    left,
		right:   right,
		snaps:   &snapFactory{dir: t.TempDir(), snaps: map[string]*snapshot.BoltSnapshot{}},
		done:    make(chan interface{}, 100),
		statues: make(chan model.Status, 10000),
	}
	f.sync = NewSync(left, right, model.DirectionBi)
	f.sync.SetSnapshotFactory(f.snaps)
	f.sync.SetupEventsChan(f.statues, f.done, nil)
	f.sync.Start(context.Background(), len(withWatches) > 0 && withWatches[0])
	t.Cleanup(func() {
		// Sync.Shutdown is not called: it closes the echo locks channel without synchronizing with
		// UnlockFile senders, a known race (RACE-04) that these tests are not about.
		_ = f.snaps.Close(context.Background())
	})
	go func() {
		for range f.statues {
		}
	}()
	return f
}

// run runs the sync and waits for the processed patch
func (f *biFixture) run(t *testing.T, dryRun bool) merger.Patch {
	t.Helper()
	go func() { _, _ = f.sync.Run(context.Background(), dryRun, false) }()
	select {
	case d := <-f.done:
		p, _ := d.(merger.Patch)
		// Drain a possible second Done (bidirectional error path)
		select {
		case <-f.done:
		case <-time.After(50 * time.Millisecond):
		}
		return p
	case <-time.After(10 * time.Second):
		t.Fatal("timeout waiting for sync run")
	}
	return nil
}

func (f *biFixture) has(db interface {
	LoadNode(context.Context, string, ...bool) (tree.N, error)
}, p string) bool {
	_, e := db.LoadNode(context.Background(), p)
	return e == nil
}

func leaf(p, etag string) *tree.Node {
	return &tree.Node{Path: p, Type: tree.NodeType_LEAF, Etag: etag, Uuid: "u-" + p, Size: 3, MTime: time.Now().Unix()}
}

// (a)
func TestDeletedFileNotResurrected(t *testing.T) {
	f := newBiFixture(t)
	ctx := context.Background()
	_ = f.left.CreateNode(ctx, leaf("a", "E1"), false)
	f.run(t, false) // first run: a copied to the right
	f.run(t, false) // nothing to do
	_ = f.left.DeleteNode(ctx, "a")
	f.run(t, false)
	if f.has(f.left, "a") || f.has(f.right, "a") {
		t.Fatalf("a deleted locally should be deleted on both sides (left=%v right=%v)", f.has(f.left, "a"), f.has(f.right, "a"))
	}
}

// (c)
func TestFailedFirstRunTransferRetried(t *testing.T) {
	f := newBiFixture(t)
	ctx := context.Background()
	_ = f.left.CreateNode(ctx, leaf("a", "E1"), false)
	f.right.failPath, f.right.failures = "a", 1
	f.run(t, false) // fails to copy a
	if f.has(f.right, "a") {
		t.Fatal("test setup: the first transfer should have failed")
	}
	f.run(t, false)
	if !f.has(f.right, "a") {
		t.Fatal("a failed on the first run and should be transferred by the next one")
	}
}

// (d)
func TestSnapshotsUnchangedWhenPatchFails(t *testing.T) {
	f := newBiFixture(t)
	ctx := context.Background()
	_ = f.left.CreateNode(ctx, leaf("a", "E1"), false)
	f.run(t, false)
	f.run(t, false)
	leftBefore, rightBefore := f.snaps.paths(t, "left"), f.snaps.paths(t, "right")

	_ = f.left.CreateNode(ctx, leaf("b", "E2"), false)
	f.right.failPath, f.right.failures = "b", -1
	p := f.run(t, false)
	if _, has := p.HasErrors(); !has {
		t.Fatal("test setup: the patch should have failed")
	}
	if l, r := f.snaps.paths(t, "left"), f.snaps.paths(t, "right"); strings.Join(l, ",") != strings.Join(leftBefore, ",") || strings.Join(r, ",") != strings.Join(rightBefore, ",") {
		t.Fatalf("snapshots changed although the patch failed: left %v -> %v, right %v -> %v", leftBefore, l, rightBefore, r)
	}
}

// (e)
func TestSnapshotsUnchangedOnDryRun(t *testing.T) {
	f := newBiFixture(t)
	ctx := context.Background()
	_ = f.left.CreateNode(ctx, leaf("a", "E1"), false)
	f.run(t, true)
	if l, r := f.snaps.paths(t, "left"), f.snaps.paths(t, "right"); len(l) > 0 || len(r) > 0 {
		t.Fatalf("a first dry run must not capture snapshots: left %v, right %v", l, r)
	}
	if f.has(f.right, "a") {
		t.Fatal("a dry run must not transfer anything")
	}

	f.run(t, false)
	f.run(t, false)
	leftBefore, rightBefore := f.snaps.paths(t, "left"), f.snaps.paths(t, "right")
	_ = f.left.CreateNode(ctx, leaf("b", "E2"), false)
	f.run(t, true)
	if l, r := f.snaps.paths(t, "left"), f.snaps.paths(t, "right"); strings.Join(l, ",") != strings.Join(leftBefore, ",") || strings.Join(r, ",") != strings.Join(rightBefore, ",") {
		t.Fatalf("a dry run must not change snapshots: left %v -> %v, right %v -> %v", leftBefore, l, rightBefore, r)
	}
}

// (b) Change made on the source while a patch is being processed. With "capture after success"
// (BUG-12 option B), the post-success capture records it without syncing it. This is an accepted
// trade-off (2026-10-13): realtime tasks get the change from their watchers, non-realtime tasks
// only sync it when the file changes again. Fixing it means capturing only the paths touched by
// the patch, or updating snapshots per operation (ARCH-01).
func TestKnownBug_ChangeDuringPatchAbsorbedBySnapshot(t *testing.T) {
	knownBug(t, "BUG-12 trade-off", "a change made while a patch is processing is absorbed by the post-success snapshot capture: without watcher, it is never synced")
	f := newBiFixture(t)
	f.changeDuringPatch(t)
	f.run(t, false)
	if !f.has(f.right, "d") {
		t.Fatal("d, created while a patch was processing, should be synced by the next run")
	}
}

// The same change is synced when the task watches its endpoints: the watcher event becomes a patch of its own.
func TestChangeDuringPatchSyncedByWatcher(t *testing.T) {
	f := newBiFixture(t, true)
	f.changeDuringPatch(t)
	deadline := time.Now().Add(10 * time.Second)
	for !f.has(f.right, "d") {
		if time.Now().After(deadline) {
			t.Fatal("d, created while a patch was processing, should be synced from its watcher event")
		}
		time.Sleep(20 * time.Millisecond)
	}
}

// changeDuringPatch syncs a, then creates d on the left while the transfer of c is processing.
func (f *biFixture) changeDuringPatch(t *testing.T) {
	t.Helper()
	ctx := context.Background()
	_ = f.left.CreateNode(ctx, leaf("a", "E1"), false)
	f.run(t, false)
	f.run(t, false)

	_ = f.left.CreateNode(ctx, leaf("c", "E3"), false)
	f.right.lock.Lock()
	f.right.blockPath, f.right.blocked, f.right.release = "c", make(chan struct{}), make(chan struct{})
	blocked, release := f.right.blocked, f.right.release
	f.right.lock.Unlock()

	result := make(chan merger.Patch, 1)
	go func() { result <- f.run(t, false) }()
	select {
	case <-blocked:
	case <-time.After(10 * time.Second):
		t.Fatal("test setup: transfer of c never started")
	}
	_ = f.left.CreateNode(ctx, leaf("d", "E4"), false) // changed while the patch is processing
	close(release)
	<-result
}
