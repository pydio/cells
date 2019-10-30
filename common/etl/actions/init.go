package actions

import (
	"github.com/pydio/cells/scheduler/actions"
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
