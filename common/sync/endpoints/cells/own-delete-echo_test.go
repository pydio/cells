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

package cells

import (
	"context"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/internal/timings"
)

// #30: the server deletes the content of a folder asynchronously, and these delete events don't carry our client
// UUID. They must be dropped while our delete runs and for EchoDeleteWindow after it, but the snapshot is updated.
func TestOwnFolderDeleteEchoesDropped(t *testing.T) {
	defer timings.ForTests()()
	ctx := context.Background()
	snap := memory.NewMemDB()
	_ = snap.CreateNode(ctx, &tree.Node{Path: "_rep/a", Type: tree.NodeType_COLLECTION}, false)
	c := &Abstract{ClientUUID: "me", GlobalCtx: ctx, updateSnapshot: snap}
	del := func(p string) bool {
		_, send := c.changeToEventInfo(&tree.NodeChangeEvent{Type: tree.NodeChangeEvent_DELETE, Source: &tree.Node{Path: p}})
		return send
	}

	c.markFolderDeleted("_rep", true) // request running
	for p, want := range map[string]bool{"_rep/a": false, "/_rep/a/b/two.txt": false, "_rep": false, "_repx": true, "other/_rep": true} {
		if got := del(p); got != want {
			t.Errorf("while deleting: event for %s sent=%v, expected %v", p, got, want)
		}
	}
	if _, e := snap.LoadNode(ctx, "_rep/a"); e == nil {
		t.Error("a dropped echo must still update the snapshot")
	}
	if _, send := c.changeToEventInfo(&tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: &tree.Node{Path: "_rep/a/new.txt", Etag: "e", Type: tree.NodeType_LEAF}}); !send {
		t.Error("creations under a deleted folder must be sent")
	}

	c.markFolderDeleted("_rep", false) // request done: window starts
	if del("_rep/a") {
		t.Error("echoes must be dropped within the window after the delete")
	}
	<-time.After(2 * timings.EchoDeleteWindow.Get())
	if !del("_rep/a") {
		t.Error("deletes must be sent again after the window")
	}
	if len(c.deletedFolders) != 0 {
		t.Errorf("expired folders must be pruned, got %v", c.deletedFolders)
	}
}
