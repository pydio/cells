package modifiers

import (
	"context"

	"github.com/pydio/cells/common/service/frontend"
)

// FilterActionLogin updates template props to remove copyright
func FilterActionLogin(ctx context.Context, _ frontend.RequestStatus, plugin frontend.Plugin) error {
	if plugin.GetId() != "authfront.session_login" {
		return nil
	}

	p := plugin.(*frontend.Cplugin)
	var newActions []*frontend.Caction
	for _, action := range p.Cregistry_contributions.Cactions.Caction {
		if action.Attrname == "login" {
			action.Attrname = "loginprev"
		}
		newActions = append(newActions, action)
	}
	p.Cregistry_contributions.Cactions.Caction = newActions

	return nil
}
