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

package filters

import (
	"strings"

	"github.com/pydio/cells/v4/common/sync/model"
)

// SelectiveRootsFilter is a Pipe filtering events that are outside of the selective roots
type SelectiveRootsFilter struct {
	roots []string
	done  chan bool
	in    chan model.EventInfo
	out   chan model.EventInfo
}

// NewSelectiveRootsFilter creates a new SelectiveRootsFilter and starts listening to events
func NewSelectiveRootsFilter(roots []string) *SelectiveRootsFilter {
	s := &SelectiveRootsFilter{
		done: make(chan bool),
	}
	for _, r := range roots {
		r = strings.TrimLeft(r, "/")
		if r != "" {
			s.roots = append(s.roots, r)
		}
	}
	return s
}

func (s *SelectiveRootsFilter) Pipe(in chan model.EventInfo) chan model.EventInfo {
	out := make(chan model.EventInfo)
	s.in = in
	s.out = out
	go s.start()
	return out
}

// GetOutput returns the output chan
func (s *SelectiveRootsFilter) GetOutput() chan model.EventInfo {
	return s.out
}

// Start listens to events and filter them
func (s *SelectiveRootsFilter) start() {
	defer close(s.out)
	defer close(s.done)
	for {
		select {
		case ev, ok := <-s.in:
			if !ok {
				return
			}
			switch ev.Type {
			case model.EventRemove, model.EventCreate, model.EventRename:
				if !s.isOutside(ev.Path) {
					s.out <- ev
				}
			case model.EventSureMove:
				srcOut := s.isOutside(ev.MoveSource.Path)
				targetOut := s.isOutside(ev.MoveTarget.Path)
				if srcOut && targetOut {
					break
				}
				if srcOut {
					// Transform to create
					ev.Type = model.EventCreate
					ev.Path = ev.MoveTarget.Path
					ev.Etag = ev.MoveTarget.Etag
				} else if targetOut {
					// Transform to delete
					ev.Type = model.EventRemove
					ev.Path = ev.MoveSource.Path
					ev.Etag = ev.MoveSource.Etag
				}
				s.out <- ev
			default:
				break
			}
		case <-s.done:
			return
		}
	}
}

// Close stops the filter from listening
func (s *SelectiveRootsFilter) Close() {
	close(s.done)
}

// isOutside checks if a given path is outside of roots
func (s *SelectiveRootsFilter) isOutside(event string) bool {
	var in bool
	for _, root := range s.roots {
		if strings.HasPrefix(strings.TrimLeft(event, "/"), root+"/") {
			in = true
			break
		}
	}
	return !in
}
