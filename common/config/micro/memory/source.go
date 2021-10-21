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

package memory

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/pydio/cells/common/config/source"
	"github.com/pydio/go-os/config"
)

type memory struct {
	sync.RWMutex
	ChangeSet *config.ChangeSet
	Watchers  map[string]*watcher
}

func (s *memory) Read() (*config.ChangeSet, error) {
	s.RLock()
	cs := &config.ChangeSet{
		// Format:    s.ChangeSet.Format,
		Timestamp: s.ChangeSet.Timestamp,
		Data:      s.ChangeSet.Data,
		Checksum:  s.ChangeSet.Checksum,
		Source:    s.ChangeSet.Source,
	}
	s.RUnlock()
	return cs, nil
}

func (s *memory) Watch() (config.SourceWatcher, error) {
	w := &watcher{
		Id:      uuid.New().String(),
		Updates: make(chan *config.ChangeSet, 100),
		Source:  s,
	}

	s.Lock()
	s.Watchers[w.Id] = w
	s.Unlock()
	return w, nil
}

func (m *memory) Write(cs *config.ChangeSet) error {
	m.Update(cs)
	return nil
}

// Update allows manual updates of the config data.
func (s *memory) Update(c *config.ChangeSet) {
	// don't process nil
	if c == nil {
		return
	}

	// hash the file
	s.Lock()
	// update changeset
	s.ChangeSet = &config.ChangeSet{
		Data: c.Data,
		// Format:    c.Format,
		Source:    "memory",
		Timestamp: time.Now(),
	}
	// s.ChangeSet.Checksum = s.ChangeSet.Sum()

	// update watchers
	for _, w := range s.Watchers {
		select {
		case w.Updates <- s.ChangeSet:
		default:
		}
	}
	s.Unlock()
}

// Name of source
func (m *memory) String() string {
	return "memory"
}

func NewSource(opts ...source.Option) config.Source {
	var options source.Options
	for _, o := range opts {
		o(&options)
	}

	s := &memory{
		Watchers: make(map[string]*watcher),
	}

	if options.Context != nil {
		c, ok := options.Context.Value(changeSetKey{}).(*config.ChangeSet)
		if ok {
			s.Update(c)
		}
	}

	return s
}
