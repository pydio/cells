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
	"io"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
)

func TestWalkTruncatedListing(t *testing.T) {
	for _, tc := range []struct {
		end     error
		wantErr bool
	}{{io.EOF, false}, {io.ErrUnexpectedEOF, true}} {
		c, ft, _ := newTestAbstract(false)
		ft.set(&tree.Node{Path: "root/a.txt", Uuid: "a", Type: tree.NodeType_LEAF, Etag: "e"})
		ft.listEnd = tc.end
		e := c.Walk(context.Background(), func(string, tree.N, error) error { return nil }, "/", true)
		if (e != nil) != tc.wantErr {
			t.Errorf("listing ending with %v: Walk returned %v, want an error: %v", tc.end, e, tc.wantErr)
		}
	}
}
