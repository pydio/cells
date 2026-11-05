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
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"
)

func TestWriterIgnoresStaleTempFile(t *testing.T) {
	dir, _ := filepath.EvalSymlinks(t.TempDir())
	// Leftover of an interrupted transfer, longer than the new content
	if e := os.WriteFile(filepath.Join(dir, SyncTmpPrefix+"a.txt"), []byte("stale content from a previous transfer"), 0644); e != nil {
		t.Fatal(e)
	}
	c, e := NewFSClient(dir, model.EndpointOptions{})
	if e != nil {
		t.Fatal(e)
	}
	w, done, errs, e := c.GetWriterOn(context.Background(), "a.txt", 5, &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF})
	if e != nil {
		t.Fatal(e)
	}
	_, _ = w.Write([]byte("hello"))
	if e = w.Close(); e == nil {
		e = model.WaitWriteResult(context.Background(), done, errs)
	}
	if e != nil {
		t.Fatal(e)
	}
	if got, _ := os.ReadFile(filepath.Join(dir, "a.txt")); string(got) != "hello" {
		t.Fatalf("written file should only contain the new content, got %q", got)
	}
}
