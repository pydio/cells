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

package actions

import (
	"context"
	"sync"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/service/errors"
)

var (
	defaultManager    *ActionsManager
	IgnoredActionName = "$action.internal.ignored$"
)

// GetActionsManager provides global access to the default action manager.
func GetActionsManager() *ActionsManager {
	if defaultManager == nil {
		defaultManager = &ActionsManager{
			registeredActions: make(map[string]Concrete),
		}
	}
	return defaultManager
}

type ActionsManager struct {
	registeredActions map[string]Concrete
	lock              sync.Mutex
}

func (m *ActionsManager) Register(name string, a Concrete) {
	m.lock.Lock()
	defer m.lock.Unlock()
	m.registeredActions[name] = a
}

func (m *ActionsManager) ActionById(actionId string) (ConcreteAction, bool) {
	if actionId == IgnoredActionName {
		return &ignoredAction{}, true
	}
	m.lock.Lock()
	defer m.lock.Unlock()
	generator, ok := m.registeredActions[actionId]
	if !ok {
		return nil, false
	}
	return generator(), true
}

// DescribeActions provides a list of all registered actions
func (m *ActionsManager) DescribeActions(languages ...string) map[string]ActionDescription {
	m.lock.Lock()
	defer m.lock.Unlock()
	data := map[string]ActionDescription{}
	for a, gen := range m.registeredActions {
		action := gen()
		if descProvider, ok := action.(DescriptionProviderAction); ok {
			//desc.Label = labelProvider.GetLabel(languages...)
			data[a] = descProvider.GetDescription(languages...)
		} else {
			data[a] = ActionDescription{
				ID: a,
			}
		}
	}
	return data
}

// LoadActionForm tries to load a forms.Form object that can be serialized for frontend
func (m *ActionsManager) LoadActionForm(actionID string) (*forms.Form, error) {
	if action, ok := m.ActionById(actionID); ok {
		if desc, ok := action.(DescriptionProviderAction); ok {
			form := desc.GetParametersForm()
			if form != nil {
				return form, nil
			}
		}
	}
	return nil, errors.NotFound("action.not.found", "cannot find action with ID %s", actionID)
}

type ignoredAction struct {
	common.RuntimeHolder
}

func (i *ignoredAction) GetName() string {
	return IgnoredActionName
}

func (i *ignoredAction) Init(job *jobs.Job, action *jobs.Action) error {
	return nil
}

func (i *ignoredAction) Run(ctx context.Context, channels *RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {
	return input, nil
}
