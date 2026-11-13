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
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

// newMoveClient creates d/sub/f.txt on disk, and a snapshot attached to the client knowing d
func newMoveClient(t *testing.T) (*FSClient, *memory.MemDB, string) {
	dir, _ := filepath.EvalSymlinks(t.TempDir())
	_ = os.MkdirAll(filepath.Join(dir, "d", "sub"), 0755)
	_ = os.WriteFile(filepath.Join(dir, "d", "sub", "f.txt"), []byte("f"), 0644)
	c, e := NewFSClient(dir, model.EndpointOptions{})
	if e != nil {
		t.Fatal(e)
	}
	snap := memory.NewMemDB()
	_ = snap.CreateNode(context.Background(), &tree.Node{Path: "d", Type: tree.NodeType_COLLECTION}, false)
	c.SetUpdateSnapshot(snap)
	return c, snap, dir
}

func TestMoveNodeOnDisk(t *testing.T) {
	ctx := context.Background()
	inSnapshot := func(s *memory.MemDB, p string) bool {
		_, e := s.LoadNode(ctx, p)
		return e == nil
	}

	t.Run("a folder is moved with its content", func(t *testing.T) {
		c, snap, dir := newMoveClient(t)
		if e := c.MoveNode(ctx, "d", "e"); e != nil {
			t.Fatal(e)
		}
		if b, e := os.ReadFile(filepath.Join(dir, "e", "sub", "f.txt")); e != nil || string(b) != "f" {
			t.Fatalf("e/sub/f.txt should exist after the move (%v)", e)
		}
		if _, e := os.Stat(filepath.Join(dir, "d")); !os.IsNotExist(e) {
			t.Fatal("d should not exist anymore")
		}
		if !inSnapshot(snap, "e") || inSnapshot(snap, "d") {
			t.Fatal("the snapshot should be moved too")
		}
	})

	t.Run("a failed folder move is reported and does not move the snapshot", func(t *testing.T) {
		c, snap, _ := newMoveClient(t)
		if e := c.MoveNode(ctx, "d", "missing/parent/e"); e == nil {
			t.Fatal("moving into a missing folder should fail")
		}
		if !inSnapshot(snap, "d") || inSnapshot(snap, "missing/parent/e") {
			t.Fatal("the snapshot must not be moved when the move failed")
		}
	})

	t.Run("a missing source is reported as not found and does not move the snapshot", func(t *testing.T) {
		c, snap, _ := newMoveClient(t)
		_ = snap.CreateNode(ctx, &tree.Node{Path: "gone", Type: tree.NodeType_LEAF}, false)
		if e := c.MoveNode(ctx, "gone", "e"); !model.IsNotFound(e) {
			t.Fatalf("expected a not found error, got %v", e)
		}
		if !inSnapshot(snap, "gone") || inSnapshot(snap, "e") {
			t.Fatal("the snapshot must not be moved when the source is missing")
		}
	})

	t.Run("a stat error is reported without panicking", func(t *testing.T) {
		if runtime.GOOS == "windows" || os.Geteuid() == 0 {
			t.Skip("relies on POSIX permissions")
		}
		c, _, dir := newMoveClient(t)
		_ = os.Chmod(filepath.Join(dir, "d"), 0)
		t.Cleanup(func() { _ = os.Chmod(filepath.Join(dir, "d"), 0755) })
		var e error
		func() {
			defer func() {
				if r := recover(); r != nil {
					t.Fatalf("MoveNode panicked: %v", r)
				}
			}()
			e = c.MoveNode(ctx, "d/sub", "e")
		}()
		if e == nil {
			t.Fatal("an unreadable source should be reported")
		}
	})
}
