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

package cache

import "sync"

// KeyMutex allows locking resource by a unique ID instead of using a global lock
type KeyMutex struct {
	c *sync.Cond
	l sync.Locker
	s map[string]struct{}
}

// NewKeyMutex creates a new KeyMutex.
func NewKeyMutex() *KeyMutex {
	l := sync.Mutex{}
	return &KeyMutex{c: sync.NewCond(&l), l: &l, s: make(map[string]struct{})}
}

// Unlock unlocks the KeyMutex by unique ID.
func (km *KeyMutex) Unlock(key string) {
	km.l.Lock()
	defer km.l.Unlock()
	delete(km.s, key)
	km.c.Broadcast()
}

// Lock locks the KeyMutex by unique ID.
func (km *KeyMutex) Lock(key string) {
	km.l.Lock()
	defer km.l.Unlock()
	for km.locked(key) {
		km.c.Wait()
	}
	km.s[key] = struct{}{}
	return
}

func (km *KeyMutex) locked(key string) bool {
	_, ok := km.s[key]
	return ok
}
