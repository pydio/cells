package golongpoll

import (
	"container/heap"
	"fmt"
)

// This priority queue manages eventBuffers that expire after a certain
// period of inactivity (no new events).
type expiringBuffer struct {
	// references an eventBuffer
	eventBuffer_ptr *eventBuffer
	// The subscription category for the given event buffer
	// This is needed so we can clean up our category-to-Item map
	// by doing a simple key lookup and removing the eventBuffer ref
	category string
	// The priority of the item in the queue.
	// For our purposes, this is milliseconds since epoch
	priority int64
	// index is needed by update and is maintained by heap.Interface
	// The index of this item in the heap.
	index int
}

// A Priority Queue (min heap) implemented with go's heap container.
// Adapted from go's example at: https://golang.org/pkg/container/heap/
//
// This priorityQueue is used to keep track of eventBuffer objects in order of
// oldest last-event-timestamp so that we can more efficiently purge buffers
// that have expired events.
//
// The priority here will be a timestamp in milliseconds since epoch (int64)
// with lower values (older timestamps) being at the top of the heap/queue and
// higher values (more recent timestamps) being further down.
// So this is a Min Heap.
//
// A priorityQueue implements heap.Interface and holds Items.
type priorityQueue []*expiringBuffer

func (pq priorityQueue) Len() int { return len(pq) }

func (pq priorityQueue) Less(i, j int) bool {
	// We want Pop to give us the lowest priority, so less uses < here:
	return pq[i].priority < pq[j].priority
}

func (pq priorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *priorityQueue) Push(x interface{}) {
	n := len(*pq)
	item := x.(*expiringBuffer)
	item.index = n
	*pq = append(*pq, item)
}

func (pq *priorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	item.index = -1 // for safety
	*pq = old[0 : n-1]
	return item
}

// update modifies the priority of an item and updates the heap accordingly
func (pq *priorityQueue) updatePriority(item *expiringBuffer, priority int64) {
	item.priority = priority
	// NOTE: fix is a slightly more efficient version of calling Remove() and
	// then Push()
	heap.Fix(pq, item.index)
}

// get the priority of the heap's top item.
func (pq *priorityQueue) peakTopPriority() (int64, error) {
	if len(*pq) > 0 {
		return (*pq)[0].priority, nil
	} else {
		return -1, fmt.Errorf("PriorityQueue is empty.  No top priority.")
	}
}
