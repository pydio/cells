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
	"path"
	"time"

	"github.com/pydio/cells/v4/common/sync/merger"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

// TODO
func (pr *Processor) refreshFilesUuid(patch merger.Patch) {

	// Find parent path
	var dirs []string
	var target model.PathSyncSource
	var source model.UuidReceiver
	toRefresh := patch.OperationsByType([]merger.OperationType{merger.OpRefreshUuid})
	refreshesByKey := make(map[string]bool)
	for _, c := range toRefresh {
		if s, ok := c.Source().(model.UuidReceiver); ok {
			source = s
			if t, ok2 := c.Target().(model.PathSyncSource); ok2 {
				dirs = append(dirs, path.Dir(c.GetRefPath()))
				target = t
			}
		}
		refreshesByKey[c.GetRefPath()] = true
	}
	if source != nil && target != nil {
		pref := mtree.CommonPrefix("/"[0], dirs...)
		if pref == "." {
			pref = ""
		}
		<-time.After(3 * time.Second) // Wait to make sure indexation is finished
		_ = target.Walk(context.TODO(), func(path string, node model.Node, err error) error {
			if err != nil {
				return err
			}
			if _, ok := refreshesByKey[node.GetPath()]; ok {
				if _, e := source.UpdateNodeUuid(pr.GlobalContext, node); e != nil {
					return e
				}
			}
			return nil
		}, pref, true)
	}

}
