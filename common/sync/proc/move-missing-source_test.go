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
	"io"
	"sync"
	"testing"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// noSourceTarget reports moves as NodeNotFound, like the FS client when the source is missing, and records writes
type noSourceTarget struct {
	kbDoneTarget
	mu      sync.Mutex
	written []string
}

func (n *noSourceTarget) MoveNode(context.Context, string, string) error {
	return errors.WithMessage(errors.NodeNotFound, "cannot move missing source")
}

func (n *noSourceTarget) GetWriterOn(c context.Context, p string, size int64, node tree.N) (io.WriteCloser, chan bool, chan error, error) {
	n.mu.Lock()
	n.written = append(n.written, p)
	n.mu.Unlock()
	return n.kbDoneTarget.GetWriterOn(c, p, size, node)
}

// A file move whose source is missing on the target (seen live: the server echo of a conflict rename whose origin was
// already renamed locally) cannot succeed when re-applied: the destination is transferred from the source instead.
func TestMoveWithMissingSourceTransfersDestination(t *testing.T) {
	ctx := context.Background()
	pr := NewProcessor(ctx)
	src := &kbSource{memory.NewMemDB()}
	_ = src.CreateNode(ctx, &tree.Node{Path: "a-server.txt", Type: tree.NodeType_LEAF, Size: 11, Etag: "e"}, false)
	tgt := &noSourceTarget{kbDoneTarget: kbDoneTarget{memory.NewMemDB()}}

	for name, tc := range map[string]struct {
		opType  merger.OperationType
		to      string
		success bool
	}{
		"file present on the source":   {merger.OpMoveFile, "a-server.txt", true},
		"file missing on the source":    {merger.OpMoveFile, "gone.txt", false},
		"folder (content not transfer)": {merger.OpMoveFolder, "a-server.txt", false},
	} {
		t.Run(name, func(t *testing.T) {
			tgt.written = nil
			p := merger.NewPatch(src, tgt, merger.PatchOptions{})
			op := merger.NewOperation(tc.opType, model.EventInfo{Path: tc.to}, &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF})
			p.Enqueue(op)
			pg := kbProgress()
			defer close(pg)
			e := pr.processMove(ctx, op, "id", pg)
			if tc.success && (e != nil || len(tgt.written) != 1 || tgt.written[0] != tc.to) {
				t.Fatalf("expected %s to be transferred, got err=%v written=%v", tc.to, e, tgt.written)
			}
			if !tc.success && (e == nil || len(tgt.written) != 0) {
				t.Fatalf("expected the move error, got err=%v written=%v", e, tgt.written)
			}
		})
	}
}
