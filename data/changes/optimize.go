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

package changes

import (
	"container/list"
	"context"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"go.uber.org/zap"
)

const (
	bufSize = 8

	opNull   OpCode = iota
	opCreate OpCode = iota
	opMove   OpCode = iota
	opUpdate OpCode = iota
	opDelete OpCode = iota
)

var (
	pool = newBufPool(bufSize)

	// compile-time type constraints
	_ ChangeOperation = operation{}
)

// OpCode is an opaque identifier for the operation type
type OpCode uint8

// Null operation
func (op OpCode) Null() bool { return op == opNull }

// Create operation
func (op OpCode) Create() bool { return op == opCreate }

// Move operation
func (op OpCode) Move() bool { return op == opMove }

// Update operation
func (op OpCode) Update() bool { return op == opUpdate }

// Delete operation
func (op OpCode) Delete() bool { return op == opDelete }

// ChangeOperation can inform us of the nature of a change
type ChangeOperation interface {
	GetSeq() uint64
	GetNodeId() string
	OpType() OpCode
	GetSource() string
	GetTarget() string
}

type operation struct {
	*tree.SyncChange
	*tree.SyncChangeNode
}

func (op operation) OpType() (code OpCode) {
	switch {
	case op.SyncChange.Type == tree.SyncChange_create:
		code = opCreate
	case op.SyncChange.Type == tree.SyncChange_path: // Move
		code = opMove
	case op.SyncChange.Type == tree.SyncChange_content: // Update content
		code = opUpdate
	case op.SyncChange.Type == tree.SyncChange_delete:
		code = opDelete
	default:
		code = opNull
	}
	return
}

// ChangeBuffer contains a full set of changes affecting a single node.
type ChangeBuffer struct {
	*list.List
}

func newBuffer() *ChangeBuffer {
	return &ChangeBuffer{List: list.New()}
}

// Append the change to the end of the buffer
func (b *ChangeBuffer) Append(c *tree.SyncChange) {
	op := &operation{SyncChange: c}
	b.PushBack(op)
}

// Range over the list
func (b *ChangeBuffer) Range() <-chan *list.Element {
	ch := make(chan *list.Element)
	go func() {
		defer close(ch)
		for c := b.Front(); c != nil; c = c.Next() {
			ch <- c
		}
	}()
	return ch
}

// truncateAfter cleanly shrinks the buffer by removing all changes after the passed one
func (b *ChangeBuffer) truncateAfter(e list.Element) {
	// We must iterate and remove elements one by one to avoid memory leaks
	first := e.Next()
	for first != nil {
		if first.Next() != nil {
			first = first.Next()
			b.Remove(first.Prev())
		} else {
			b.Remove(first)
			first = nil
		}
	}
}

// truncateBefore cleanly shrinks the buffer by removing all changes before the passed one
func (b *ChangeBuffer) truncateBefore(e list.Element) {
	last := e.Prev()
	for last != nil {
		if last.Prev() != nil {
			last = last.Prev()
			b.Remove(last.Next())
		} else {
			b.Remove(last)
			last = nil
		}
	}
}

// emptyBuffer cleanly removes all elements from the list one by one to avoid memory leaks.
func (b *ChangeBuffer) emptyBuffer() {
	last := b.Back()
	for last != nil {
		if last.Prev() != nil {
			last = last.Prev()
			b.Remove(last.Next())
		} else {
			b.Remove(last)
			last = nil
		}
	}
}

// Empty simply checks if the buffer is empty or not.
func (b *ChangeBuffer) isEmpty() bool { return b.Len() == 0 }

// ChangeStreamer is used to avoid sending bidirectional channels to the optimizer.
// It types the channel as <-chan and also provides a place to hook in close
// logic & pre-processing.
type ChangeStreamer interface {
	Changes() <-chan *tree.SyncChange
}

// ChangeChan is a naive implementation of ChangeStreamer that performs no
// pre-processing.
type ChangeChan <-chan *tree.SyncChange

// Changes produces a read-only stream of *tree.Change instances.  It performs
// no pre-processing.
func (ch ChangeChan) Changes() <-chan *tree.SyncChange {
	return ch
}

// StreamConsumer can receive a *tree.SyncChange.
type StreamConsumer interface {
	Send(*tree.SyncChange) error
}

// bufPool is a fixed-length pool of long-lived ChangeBuffer instances. It
// scales under load but enforces a minimum pool size.
type bufPool chan *ChangeBuffer

func newBufPool(size int) bufPool {
	return make(chan *ChangeBuffer, size)
}

func (p bufPool) Get() (buf *ChangeBuffer) {
	select {
	case buf = <-p:
	default:
		buf = newBuffer()
	}
	return
}

func (p bufPool) Put(buf *ChangeBuffer) {
	select {
	case p <- buf:
	default: // drop it on the floor
	}
}

// StreamOptimizer applies optimizations to the stream of changes.
type StreamOptimizer struct {
	changeQ <-chan *tree.SyncChange
}

// NewOptimizer produces a new StreamOptimizer.
func NewOptimizer(ctx context.Context, c ChangeStreamer) (o *StreamOptimizer) {
	o = new(StreamOptimizer)
	o.changeQ = o.optimize(ctx, c.Changes())
	return
}

// Output the optimized stream to a consumer.
func (o StreamOptimizer) Output(ctx context.Context, c StreamConsumer) (err error) {
	for change := range o.changeQ {

		// There are two reasons we may want to abort early.  Either the context has terminated, or there was an error
		// during processing
		select {
		case <-ctx.Done():
			return
		default:
			if err != nil {
				return
			}
		}

		// If error is non-nil, we'll abort upon next iteration.
		err = c.Send(change)
	}

	return
}

func (o StreamOptimizer) optimize(ctx context.Context, chq <-chan *tree.SyncChange) <-chan *tree.SyncChange {
	out := make(chan *tree.SyncChange, 16)

	go func() {
		defer func() { close(out) }()
		for batch := range o.batch(ctx, chq) {
			for ch := range o.flatten(ctx, batch) {
				out <- ch
			}
		}
	}()

	return out
}

// Knowing that we receive the sync changes grouped by node id (e.g. all changes for a given node will
// be adjacent in the chq channel), we first split data in linked list buffers, each containing the events
// for a single node, that will be then treated separatly.
func (o StreamOptimizer) batch(ctx context.Context, chq <-chan *tree.SyncChange) <-chan *ChangeBuffer {
	cbQ := make(chan *ChangeBuffer, 1)

	var nid string
	var change *tree.SyncChange
	buf := newBuffer()

	go func() {
		defer func() { close(cbQ) }()

		for {
			select {
			case <-ctx.Done():
				return
			case change = <-chq:
				// TODO why do we sometimes receive nil?
				if change == nil {
					if !buf.isEmpty() {
						// transmit the last buffer before returning
						cbQ <- buf
					}
					return
				}
				if nid != change.NodeId {
					if buf.isEmpty() {
						// Drop it on the floor: it happens on the very first iteration
					} else {
						cbQ <- buf
					}
					buf = newBuffer()
					nid = change.NodeId
				}
				buf.Append(change)
			}
		}
	}()

	return cbQ
}

func (o StreamOptimizer) flatten(ctx context.Context, buf *ChangeBuffer) <-chan *tree.SyncChange {
	cQ := make(chan *tree.SyncChange, 1)
	go func() {
		defer func() { close(cQ) }()

		// first perform the optimisation
		doFlatten(ctx, buf)

		if buf.isEmpty() {
			return
		}

		// then post the remaining change events if any in the passed channel
		for c := range buf.Range() {
			op := c.Value.(*operation)
			cQ <- op.SyncChange
		}
	}()
	return cQ
}

// doFlatten effectively performs the flattening by impacting the passed buffer.
func doFlatten(ctx context.Context, buf *ChangeBuffer) {
	// we browse the buffer multiple times to optimise transmitted events by type.

	// first := true

	// Handle delete events
	for c := range buf.Range() {

		// if first {
		// 	fmt.Println("Starting flatten for node " + getOp(c).GetNodeId())
		// 	first = false
		// }

		if getOp(c).OpType().Delete() {

			// First check if delete is the last event of the buffer
			// if not, we only log an error for the time being
			if c.Next() != nil {
				log.Logger(ctx).Error("got a delete event followed by other events, cleaning the sequence", zap.String(common.KEY_NODE_UUID, c.Value.(*operation).GetNodeId()))
				// TODO implement removal of remaining events
			}

			if c.Prev() == nil {
				return // Delete is the first element: we are done
			}

			// If first event is a create => we empty the buffer
			if getOp(buf.Front()).OpType().Create() {
				buf.emptyBuffer()
				return
			}

			// Otherwise, we retrieve src Path from the front element
			// to be used as src Path for the delete event
			srcPath := getOp(buf.Front()).GetSource()
			getOp(c).SyncChange.Source = srcPath

			// We then remove all previous events that are now useless
			buf.truncateBefore(*c)

			// And we are done
			return
		}
	}

	// Handle multiple moves, multiple updates and create
	// We browse backward
	curr := buf.Back()
	var lastMove *list.Element
	var lastUpdate *list.Element
	var lastMoveSeqId uint64
	var lastUpdateSeqId uint64

	for curr != nil {
		if getOp(curr).OpType().Move() {
			if lastMove == nil {
				lastMove = curr
				lastMoveSeqId = getOp(curr).GetSeq()
			} else {
				// update source path from lastMove with source path from curr
				srcPath := getOp(curr).GetSource()
				getOp(lastMove).SyncChange.Source = srcPath

				// Also update source and target path of potential last update event
				// if it is between the 2 move events to remain consistent
				if lastUpdateSeqId > 0 && lastUpdateSeqId < lastMoveSeqId {
					getOp(lastUpdate).SyncChange.Source = srcPath
					getOp(lastUpdate).SyncChange.Target = srcPath
				}

				// remove curr
				tmp := curr
				curr = curr.Prev()
				buf.Remove(tmp)
				continue
			}
		} else if getOp(curr).OpType().Update() {
			if lastUpdate == nil {
				lastUpdate = curr
				lastUpdateSeqId = getOp(curr).GetSeq()
			} else {
				// simply remove curr
				tmp := curr
				curr = curr.Prev()
				buf.Remove(tmp)
				continue
			}
		} else if getOp(curr).OpType().Create() {
			// First double check if we have previous events, this should never happen
			if curr.Prev() != nil {
				log.Logger(ctx).Error("got a create event preceded by other events, this should not happen", zap.String(common.KEY_NODE_UUID, getOp(curr).GetNodeId()))
			}

			if lastMove == nil && lastUpdate == nil {
				// we only have a create, nothing to merge
				return
			} else if lastMoveSeqId > lastUpdateSeqId {
				// We replace the last move by a create
				getOp(lastMove).SyncChange.Source = "NULL"
				getOp(lastMove).SyncChange.Type = tree.SyncChange_create
				// and discard former create and update
				if lastUpdate != nil {
					buf.Remove(lastUpdate)
					lastUpdate = nil
				}
				buf.Remove(curr)
				curr = nil
			} else { // last update happened after last move
				// We replace the last update by a create
				getOp(lastUpdate).SyncChange.Source = "NULL"
				getOp(lastUpdate).SyncChange.Type = tree.SyncChange_create
				// and discard former create and move
				if lastMove != nil {
					buf.Remove(lastMove)
					lastMove = nil
				}
				buf.Remove(curr)
				curr = nil
			}
			continue
		}
		curr = curr.Prev()
	}

	// Also remove last move if we made a round trip
	if lastMove != nil && getOp(lastMove).GetSource() == getOp(lastMove).GetTarget() {
		buf.Remove(lastMove)
	}
}

// LOCAL SHORTCUTS
func getOp(e *list.Element) *operation {
	return e.Value.(*operation)
}

// func maybeMoveOrNullOp(buf *ChangeBuffer, del Changer) {
// 	// We're given a Changer that represents a DELETE operation

// 	// [ copy and delete of source -> move ]
// 	// - look up other events indexed by deleted path
// 	// - find one, a copy
// 	// - matching path is the source of the copy
// 	// - so replace it by a move

// 	// [ copy and delete of dest -> no-op ]
// 	// - as above, but matching path is the destination
// 	// - remove original copy event and you're done

// 	// Iterate backwards through the linked list, looking up other elements on the same path.
// 	for c := del; c != nil; c.Prev() {

// 	}
// }

// func maybeMultipleMove(buf *ChangeBuffer, mov Changer) {
// 	// We're given a Changer that represents a MOVE operation

// 	// [ move and another move ]
// 	// - get a move event, look up other events indexed by source path
// 	// - find a move whose dest path matches
// 	// - replace move(source1,dest1)+move(dest1,source2) with move(source1,dest2)
// }

// func maybeMultipleUpdate(buf *ChangeBuffer, update Changer) {
// 	// We're given a Changer that represents an UPDATE operation

// 	// [ update and another update ]
// 	// - get an update event, look up events,
// 	// - if we found one we drop it: we will perform only last.
// 	//   We then return: preceding updates have been already dropped
// 	// - if we reach beginning of the buffer we return

// 	/// AJOUTER l'optime des creates
// 	// Ajouter le check des doublons

// 	// On garde le sec le plus haut
// }
