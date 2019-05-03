/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"path"
	"time"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/mtree"
	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/filters"
)

// TODO
func (b *Merger) refreshFilesUuid(batch *filters.Batch) {

	// Find parent path
	var dirs []string
	var target common.PathSyncSource
	var source common.UuidReceiver
	for k, c := range batch.RefreshFilesUuid {
		if s, ok := c.Source.(common.UuidReceiver); ok {
			source = s
			if t, ok2 := c.Target.(common.PathSyncSource); ok2 {
				dirs = append(dirs, path.Dir(k))
				target = t
			}
		}
	}
	if source != nil && target != nil {
		pref := mtree.CommonPrefix("/"[0], dirs...)
		if pref == "." {
			pref = ""
		}
		<-time.After(3 * time.Second) // Wait to make sure indexation is finished
		target.Walk(func(path string, node *tree.Node, err error) {
			if err != nil {
				return
			}
			if _, ok := batch.RefreshFilesUuid[node.Path]; ok {
				source.UpdateNodeUuid(b.GlobalContext, node)
			}
		}, pref)
	}

}
