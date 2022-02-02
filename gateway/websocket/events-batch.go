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

package websocket

import (
	"time"

	"github.com/pydio/cells/v4/common/proto/tree"
)

type NodeChangeEventWithInfo struct {
	tree.NodeChangeEvent
	refreshTarget bool
}

// NodeEventsBatcher buffers events with same node.uuid and flatten them into one where possible
type NodeEventsBatcher struct {
	uuid   string
	buffer []*tree.NodeChangeEvent
	in     chan *tree.NodeChangeEvent
	out    chan *NodeChangeEventWithInfo
	done   chan string
	closed bool
}

// NewEventsBatcher creates a new NodeEventsBatcher
func NewEventsBatcher(timeout time.Duration, uuid string, out chan *NodeChangeEventWithInfo, done chan string) *NodeEventsBatcher {
	b := &NodeEventsBatcher{
		uuid: uuid,
		in:   make(chan *tree.NodeChangeEvent),
		out:  out,
		done: done,
	}

	go func() {
		defer close(b.in)
		for {
			select {
			case e := <-b.in:
				b.buffer = append(b.buffer, e)
			case <-time.After(timeout):
				b.closed = true
				b.Flush()
				return
			}
		}
	}()

	return b
}

// Flush applies the events buffered as one
func (n *NodeEventsBatcher) Flush() {
	var hasCreate bool
	output := &NodeChangeEventWithInfo{}
	for _, e := range n.buffer {
		if e.Type == tree.NodeChangeEvent_CREATE {
			hasCreate = true
		}
		output.Source = e.Source
		output.Type = e.Type
		if output.Target != nil {
			// Merge metadatas
			output.Target.Etag = e.Target.Etag
			output.Target.Type = e.Target.Type
			output.Target.MTime = e.Target.MTime
			output.Target.Size = e.Target.Size
			for k, v := range e.Target.MetaStore {
				output.Target.MetaStore[k] = v
			}
		} else {
			output.Target = e.Target
		}
	}
	if hasCreate {
		output.Type = tree.NodeChangeEvent_CREATE
		output.refreshTarget = false
	} else {
		output.refreshTarget = true
	}
	n.out <- output
	n.done <- n.uuid
}
