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

package snapshot

import (
	"context"
	"testing"
	"time"

	"go.etcd.io/bbolt"
	"go.uber.org/goleak"

	"github.com/pydio/cells/v5/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

// autoBatchedSnapshot opens a snapshot using the auto-batching collector, with its root bucket created.
func autoBatchedSnapshot(t *testing.T, dir string) *BoltSnapshot {
	s, e := NewBoltSnapshot(context.Background(), dir, "close")
	if e != nil {
		t.Fatal(e)
	}
	if e = s.db.Update(func(tx *bbolt.Tx) error {
		_, er := tx.CreateBucketIfNotExists(bucketName)
		return er
	}); e != nil {
		t.Fatal(e)
	}
	return s
}

func TestBoltSnapshotClose(t *testing.T) {
	Convey("Close flushes pending auto-batched writes without fixed sleeps", t, func() {
		defer goleak.VerifyNone(t, goleak.IgnoreCurrent())
		dir := t.TempDir()
		s := autoBatchedSnapshot(t, dir)
		So(s.CreateNode(context.Background(), &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "e"}, false), ShouldBeNil)

		start := time.Now()
		s.Close()
		So(time.Since(start), ShouldBeLessThan, 300*time.Millisecond)

		reopened := autoBatchedSnapshot(t, dir)
		defer reopened.Close()
		n, e := reopened.LoadNode(context.Background(), "a.txt")
		So(e, ShouldBeNil)
		So(n.GetEtag(), ShouldEqual, "e")
	})

	Convey("Close is idempotent, also after AutoCreateBucket", t, func() {
		defer goleak.VerifyNone(t, goleak.IgnoreCurrent())
		s := autoBatchedSnapshot(t, t.TempDir())
		s.Close()
		So(func() { s.Close() }, ShouldNotPanic)
		So(func() { _ = s.Shutdown() }, ShouldNotPanic)

		m := autoBatchedSnapshot(t, t.TempDir())
		So(m.AutoCreateBucket(), ShouldBeNil)
		So(func() { _ = m.AutoCreateBucket() }, ShouldNotPanic)
		So(func() { m.Close() }, ShouldNotPanic)
	})

	Convey("CreateNode after Close returns an error instead of panicking or blocking", t, func() {
		s := autoBatchedSnapshot(t, t.TempDir())
		s.Close()
		done := make(chan error, 1)
		go func() {
			defer func() {
				if r := recover(); r != nil {
					done <- nil
					t.Errorf("CreateNode panicked after Close: %v", r)
				}
			}()
			done <- s.CreateNode(context.Background(), &tree.Node{Path: "late.txt", Type: tree.NodeType_LEAF}, false)
		}()
		select {
		case e := <-done:
			So(e, ShouldNotBeNil)
		case <-time.After(2 * time.Second):
			t.Fatal("CreateNode blocked after Close")
		}
	})
}
