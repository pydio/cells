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
package bus

import (
	"context"
	"errors"
	"io"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"
)

// pendingTarget returns writers whose upload result is controlled by the test, like S3/Cells
// writers: the upload completes after the writer is closed.
type pendingTarget struct {
	mockDataSyncTarget
	done chan bool
	errs chan error
}

func (p *pendingTarget) GetWriterOn(ctx context.Context, uuid string, size int64, node tree.N) (io.WriteCloser, chan bool, chan error, error) {
	p.done, p.errs = make(chan bool, 1), make(chan error, 1)
	r, w := io.Pipe()
	go func() { _, _ = io.Copy(io.Discard, r) }()
	return w, p.done, p.errs, nil
}

func newWriterEndpoint() (*DataPubSubEndpoint, *mockSnapshot, *mockQueue, *pendingTarget) {
	q, snap, tgt := &mockQueue{}, newMockSnapshot(), &pendingTarget{}
	return &DataPubSubEndpoint{
		PubSubEndpoint: &PubSubEndpoint{isPub: true, AsyncQueue: q, PathSyncSource: snap, PathSyncTarget: snap},
		tgt:            tgt,
	}, snap, q, tgt
}

func TestWriterIndexesNodeOnlyAfterUpload(t *testing.T) {
	ctx := context.Background()
	node := &tree.Node{Path: "/a.txt", Uuid: "uuid", Type: tree.NodeType_LEAF}

	t.Run("a failed upload is reported and not indexed", func(t *testing.T) {
		ep, snap, q, tgt := newWriterEndpoint()
		w, done, errs, err := ep.GetWriterOn(ctx, "/a.txt", 5, node)
		if err != nil {
			t.Fatal(err)
		}
		_, _ = w.Write([]byte("hello"))
		_ = w.Close()
		time.Sleep(50 * time.Millisecond)
		if len(snap.created) > 0 || len(q.pushed) > 0 {
			t.Fatal("the node must not be indexed nor published before the upload completes")
		}
		tgt.errs <- errors.New("PutObject failed")
		close(tgt.done)
		close(tgt.errs)
		if e := model.WaitWriteResult(ctx, done, errs); e == nil {
			t.Fatal("the upload error should be reported")
		}
		if len(snap.created) > 0 || len(q.pushed) > 0 {
			t.Fatal("a node whose upload failed must not be indexed nor published")
		}
	})

	t.Run("a successful upload is indexed and published", func(t *testing.T) {
		ep, snap, q, tgt := newWriterEndpoint()
		w, done, errs, err := ep.GetWriterOn(ctx, "/a.txt", 5, node)
		if err != nil {
			t.Fatal(err)
		}
		_, _ = w.Write([]byte("hello"))
		_ = w.Close()
		close(tgt.done)
		close(tgt.errs)
		if e := model.WaitWriteResult(ctx, done, errs); e != nil {
			t.Fatal(e)
		}
		if len(snap.created) != 1 || len(q.pushed) != 1 {
			t.Fatalf("the node should be indexed and published once, got %d / %d", len(snap.created), len(q.pushed))
		}
	})
}
