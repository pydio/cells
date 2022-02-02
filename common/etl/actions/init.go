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

package actions

import (
	"github.com/pydio/cells/v4/scheduler/actions"
)

func init() {

	// Register Scheduler Action
	manager := actions.GetActionsManager()
	manager.Register(SyncUsersActionName, func() actions.ConcreteAction {
		return &SyncUsersAction{}
	})

	manager.Register(SyncConfigActionName, func() actions.ConcreteAction {
		return &SyncConfigAction{}
	})

	manager.Register(SyncWorkspacesActionName, func() actions.ConcreteAction {
		return &SyncWorkspacesAction{}
	})

	manager.Register(SyncSharesActionName, func() actions.ConcreteAction {
		return &SyncSharesAction{}
	})

	manager.Register(MigratePydioMetaActionName, func() actions.ConcreteAction {
		return &MigratePydioMetaAction{}
	})

	manager.Register(MigrateGlobalMetaName, func() actions.ConcreteAction {
		return &MigrateGlobalMetaAction{}
	})

}
