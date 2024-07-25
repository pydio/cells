/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package configx

import (
	"io"
)

var _ Receiver = (*combinedWatcher)(nil)

type event struct {
	n any
	e error
}

type combinedWatcher struct {
	rr   []Receiver
	n    chan *event
	done chan struct{}
}

func NewCombinedWatcher(rr []Receiver) Receiver {
	cw := &combinedWatcher{
		rr:   rr,
		n:    make(chan *event, 1),
		done: make(chan struct{}, 1),
	}
	for _, rcv := range cw.rr {
		go func(receiver Receiver) {
			for {
				select {
				case <-cw.done:
					return
				default:
					n, e := receiver.Next()
					select {
					case cw.n <- &event{n, e}:
					case <-cw.done:
						return
					}
				}
			}
		}(rcv)
	}
	return cw
}

func (c *combinedWatcher) Next() (interface{}, error) {
	select {
	case <-c.done:
		return nil, io.EOF
	case n := <-c.n:
		return n.n, n.e
	}
}

func (c *combinedWatcher) Stop() {
	close(c.done)
	for _, r := range c.rr {
		r.Stop()
	}
	close(c.n)
}
