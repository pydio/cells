package actions

import "github.com/pydio/cells/scheduler/actions"

func init() {

	manager := actions.GetActionsManager()
	manager.Register(digestActionName, func() actions.ConcreteAction {
		return &MailDigestAction{}
	})

}
