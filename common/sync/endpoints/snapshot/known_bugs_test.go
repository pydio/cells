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
	"fmt"
	"os"
	"sync"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
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

func TestKnownBug_SessionLosesConcurrentCreates(t *testing.T) {
	knownBug(t, "RACE-E04", "session state is replaced without lock: creates racing with FlushSession are lost (reliably detected with -race only)")
	s, err := NewBoltSnapshot(context.Background(), t.TempDir(), "session")
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	if err = s.AutoCreateBucket(); err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	id, _ := s.StartSession(ctx, &tree.Node{}, true)
	wg := sync.WaitGroup{}
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			for j := 0; j < 200; j++ {
				_ = s.CreateNode(ctx, &tree.Node{Path: fmt.Sprintf("f%d-%d", i, j), Type: tree.NodeType_LEAF}, true)
			}
		}(i)
	}
	for k := 0; k < 20; k++ {
		_ = s.FlushSession(ctx, id)
	}
	wg.Wait()
	if err = s.FinishSession(ctx, id); err != nil {
		t.Fatal(err)
	}
	var stored int
	_ = s.Walk(ctx, func(p string, node tree.N, e error) error {
		stored++
		return nil
	}, "/", true)
	if stored != 1600 {
		t.Fatalf("expected 1600 nodes, %d stored", stored)
	}
}
