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
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
)

func TestFailedUploadIsAnError(t *testing.T) {
	pr := NewProcessor(context.Background())
	for i := 0; i < 200; i++ {
		_, op := kbCreateFileOp(&kbSource{memory.NewMemDB()}, &kbS3Target{MemDB: memory.NewMemDB()})
		pg := kbProgress()
		e := pr.processCreateFile(context.Background(), op, "id", pg)
		close(pg)
		if e == nil {
			t.Fatalf("iteration %d: failed upload reported as success", i)
		}
	}
}

func TestWriterCloseErrorIsAnError(t *testing.T) {
	pr := NewProcessor(context.Background())
	_, op := kbCreateFileOp(&kbSource{memory.NewMemDB()}, &kbFSTarget{MemDB: memory.NewMemDB(), failures: -1})
	pg := kbProgress()
	defer close(pg)
	if e := pr.processCreateFile(context.Background(), op, "id", pg); e == nil {
		t.Fatal("writer.Close() error should be returned")
	}
}

// kbFailingReader fails after returning some content
type kbFailingReader struct{ n int }

func (r *kbFailingReader) Read(p []byte) (int, error) {
	if r.n > 0 {
		r.n = 0
		return copy(p, "hello"), nil
	}
	return 0, errors.New("read failed")
}

func (r *kbFailingReader) Close() error { return nil }

type kbFailingSource struct{ *memory.MemDB }

func (s *kbFailingSource) GetReaderOn(ctx context.Context, p string, n tree.N) (io.ReadCloser, error) {
	return &kbFailingReader{n: 1}, nil
}

// kbDoneTarget writes successfully and signals writeDone
type kbDoneTarget struct{ *memory.MemDB }

func (s *kbDoneTarget) GetWriterOn(c context.Context, p string, size int64, n tree.N) (io.WriteCloser, chan bool, chan error, error) {
	wd, we := make(chan bool, 1), make(chan error, 1)
	r, w := io.Pipe()
	go func() {
		defer func() { close(wd); close(we) }()
		_, _ = io.Copy(io.Discard, r)
	}()
	return w, wd, we, nil
}

func TestSuccessfulUpload(t *testing.T) {
	pr := NewProcessor(context.Background())
	_, op := kbCreateFileOp(&kbSource{memory.NewMemDB()}, &kbDoneTarget{MemDB: memory.NewMemDB()})
	pg := kbProgress()
	defer close(pg)
	if e := pr.processCreateFile(context.Background(), op, "id", pg); e != nil {
		t.Fatal(e)
	}
}

func TestReadErrorRevertsProgress(t *testing.T) {
	pr := NewProcessor(context.Background())
	_, op := kbCreateFileOp(&kbFailingSource{memory.NewMemDB()}, &kbDoneTarget{MemDB: memory.NewMemDB()})
	pg := make(chan int64, 100)
	if e := pr.processCreateFile(context.Background(), op, "id", pg); e == nil {
		t.Fatal("a read error should be returned")
	}
	close(pg)
	var total int64
	for p := range pg {
		total += p
	}
	if total != 0 {
		t.Fatalf("progress of a failed transfer should be reverted, got %d", total)
	}
}
