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

package model

import (
	"sync"
)

// Command is a pub/sub for dispatching SyncCmd
type Command struct {
	sync.Mutex
	input chan SyncCmd
	done  chan bool

	listeners map[chan SyncCmd]bool
}

// NewCommand creates a new command
func NewCommand() *Command {
	c := &Command{
		input:     make(chan SyncCmd, 1),
		done:      make(chan bool),
		listeners: make(map[chan SyncCmd]bool),
	}
	go c.start()
	return c
}

func (c *Command) Publish(cmd SyncCmd) {
	c.input <- cmd
}

// Subscribe creates a new listener to the Input and returns a chan for closing subscription
func (c *Command) Subscribe() (chan SyncCmd, chan bool) {
	cmds := make(chan SyncCmd)
	unsubscribe := make(chan bool, 1)
	c.Lock()
	c.listeners[cmds] = true
	c.Unlock()
	go func() {
		<-unsubscribe
		c.Lock()
		delete(c.listeners, cmds)
		c.Unlock()
	}()
	return cmds, unsubscribe
}

// Stop closes internal channels
func (c *Command) Stop() {
	close(c.done)
	c.Lock()
	for ch, _ := range c.listeners {
		close(ch)
	}
	c.Unlock()
}

// start listens for Input and dispatch to listeners
func (c *Command) start() {
	defer close(c.input)
	for {
		select {
		case cmd := <-c.input:
			c.Lock()
			for sub, _ := range c.listeners {
				sub <- cmd
			}
			c.Unlock()
		case <-c.done:
			return
		}
	}
}
