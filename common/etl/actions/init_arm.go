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

	manager.Register(SyncSharesActionName, func() actions.ConcreteAction {
		return &SyncSharesAction{}
	})
}
