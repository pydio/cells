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
	"sync"
)

var (
	defaultManager *ActionsManager
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
	m.lock.Lock()
	defer m.lock.Unlock()
	generator, ok := m.registeredActions[actionId]
	if !ok {
		return nil, false
	}
	return generator(), true
}
