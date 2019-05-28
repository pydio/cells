// +build ignore

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

package flat

import (
	"context"
	"strings"

	"github.com/pydio/cells/common/sync/model"
)

func (b *FlatPatch) filterDeletes(ctx context.Context) {

	// Prune Deletes: remove children if parent is already deleted
	var deleteDelete []string
	for _, folderDeleteOp := range b.deletes {
		deletePath := folderDeleteOp.GetRefPath() + "/"
		for deleteKey, delOp := range b.deletes {
			from := delOp.GetRefPath()
			if strings.HasPrefix(from, deletePath) {
				deleteDelete = append(deleteDelete, deleteKey)
			}
		}
	}
	for _, del := range deleteDelete {
		delete(b.deletes, del)
	}

	for _, del := range b.deletes {
		if model.Ignores(b.Target(), del.GetRefPath()) {
			delete(b.deletes, del.GetRefPath())
			continue
		}
	}

}
