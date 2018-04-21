/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"github.com/pydio/cells/data/source/sync/lib/filters"
)

func (b *Merger) processDelete(event *filters.BatchedEvent, operationId string) error {

	deletePath := event.Node.Path
	b.lockFileTo(event, deletePath, operationId)
	defer b.unlockFile(event, deletePath)
	ctx := event.EventInfo.CreateContext(b.GlobalContext)
	err := event.Target.DeleteNode(ctx, deletePath)

	return err

}
