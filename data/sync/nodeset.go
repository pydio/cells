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

package sync

import (
	"sync"

	"github.com/emirpasic/gods/containers"
	"github.com/emirpasic/gods/sets/hashset"
)

type uuidGetter interface {
	GetUuid() string
}

type uuidContainer interface {
	Contains(uuidGetter) bool
}

type nodeSet interface {
	containers.JSONSerializer
	containers.JSONDeserializer
	Add(uuidGetter)
	Contains(uuidGetter) bool
}

// volatileSet is an in-memory, thread-safe set of nodes
type volatileSet struct {
	sync.RWMutex
	s *hashset.Set
}

func newVolatileSet() *volatileSet { return &volatileSet{s: hashset.New()} }

func (s *volatileSet) Add(u uuidGetter) {
	s.Lock()
	s.Unlock()
	s.s.Add(u.GetUuid())
}

func (s *volatileSet) Contains(u uuidGetter) bool {
	s.RLock()
	defer s.RUnlock()
	return s.s.Contains(u.GetUuid())
}

func (s *volatileSet) ToJSON() ([]byte, error) {
	s.RLock()
	s.RUnlock()
	return s.s.ToJSON()
}

func (s *volatileSet) FromJSON(b []byte) error {
	s.Lock()
	s.Unlock()
	return s.s.FromJSON(b)
}
