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
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

func TestWalkReportsUnreadableNodes(t *testing.T) {
	if runtime.GOOS == "windows" || os.Geteuid() == 0 {
		t.Skip("relies on POSIX permissions")
	}
	dir, _ := filepath.EvalSymlinks(t.TempDir())
	_ = os.WriteFile(filepath.Join(dir, "a.txt"), []byte("a"), 0644)
	locked := filepath.Join(dir, "locked")
	_ = os.Mkdir(locked, 0755)
	_ = os.WriteFile(filepath.Join(locked, "b.txt"), []byte("b"), 0644)
	_ = os.Chmod(locked, 0)
	t.Cleanup(func() { _ = os.Chmod(locked, 0755) })

	c, err := NewFSClient(dir, model.EndpointOptions{})
	if err != nil {
		t.Fatal(err)
	}
	var errPaths []string
	e := c.Walk(context.Background(), func(p string, n tree.N, err error) error {
		if err != nil {
			errPaths = append(errPaths, p)
			return err
		}
		return nil
	}, "", true)
	if e == nil {
		t.Fatal("walking an unreadable folder should return the error")
	}
	if len(errPaths) != 1 || errPaths[0] != "locked" {
		t.Fatalf("the error should be reported with the unreadable folder path, got %v", errPaths)
	}

	if _, e := merger.TreeNodeFromSource(context.Background(), c, "/", nil, nil); e == nil {
		t.Fatal("loading the tree of an endpoint with an unreadable folder should fail, not miss its content")
	}
}
