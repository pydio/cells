/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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

package dav

import (
	"container/heap"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/net/webdav"
)

// slashClean is equivalent to but slightly more efficient than
// path.Clean("/" + name).
func slashClean(name string) string {
	if name == "" || name[0] != '/' {
		name = "/" + name
	}
	return path.Clean(name)
}

// NewMemLS returns a new in-memory LockSystem.
func NewMemLS() webdav.LockSystem {
	return &memLS{
		byName:  make(map[string]*memLSNode),
		byToken: make(map[string]*memLSNode),
		gen:     uint64(time.Now().Unix()),
	}
}

type memLS struct {
	mu      sync.Mutex
	byName  map[string]*memLSNode
	byToken map[string]*memLSNode
	gen     uint64
	// byExpiry only contains those nodes whose LockDetails have a finite
	// Duration and are yet to expire.
	byExpiry byExpiry
}

func (m *memLS) nextToken() string {
	m.gen++
	return strconv.FormatUint(m.gen, 10)
}

func (m *memLS) collectExpiredNodes(now time.Time) {
	for len(m.byExpiry) > 0 {
		if now.Before(m.byExpiry[0].expiry) {
			break
		}
		m.remove(m.byExpiry[0])
	}
}

func (m *memLS) Confirm(now time.Time, name0, name1 string, conditions ...webdav.Condition) (func(), error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.collectExpiredNodes(now)

	var n0, n1 *memLSNode
	if name0 != "" {
		if n0 = m.lookup(slashClean(name0), conditions...); n0 == nil {
			return nil, webdav.ErrConfirmationFailed
		}
	}
	if name1 != "" {
		if n1 = m.lookup(slashClean(name1), conditions...); n1 == nil {
			return nil, webdav.ErrConfirmationFailed
		}
	}

	// Don't hold the same node twice.
	if n1 == n0 {
		n1 = nil
	}

	if n0 != nil {
		m.hold(n0)
	}
	if n1 != nil {
		m.hold(n1)
	}
	return func() {
		m.mu.Lock()
		defer m.mu.Unlock()
		if n1 != nil {
			m.unhold(n1)
		}
		if n0 != nil {
			m.unhold(n0)
		}
	}, nil
}

// lookup returns the node n that locks the named resource, provided that n
// matches at least one of the given conditions and that lock isn't held by
// another party. Otherwise, it returns nil.
//
// n may be a parent of the named resource, if n is an infinite depth lock.
func (m *memLS) lookup(name string, conditions ...webdav.Condition) (n *memLSNode) {
	// TODO: support Condition.Not and Condition.ETag.
	for _, c := range conditions {
		n = m.byToken[c.Token]
		if n == nil || n.held {
			continue
		}
		if name == n.details.Root {
			return n
		}
		if n.details.ZeroDepth {
			continue
		}
		if n.details.Root == "/" || strings.HasPrefix(name, n.details.Root+"/") {
			return n
		}
	}
	return nil
}

func (m *memLS) hold(n *memLSNode) {
	if n.held {
		panic("webdav: memLS inconsistent held state")
	}
	n.held = true
	if n.details.Duration >= 0 && n.byExpiryIndex >= 0 {
		heap.Remove(&m.byExpiry, n.byExpiryIndex)
	}
}

func (m *memLS) unhold(n *memLSNode) {
	if !n.held {
		panic("webdav: memLS inconsistent held state")
	}
	n.held = false
	if n.details.Duration >= 0 {
		heap.Push(&m.byExpiry, n)
	}
}

func (m *memLS) Delete(now time.Time, name string) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.collectExpiredNodes(now)

	n := m.byName[name]
	if n == nil {
		// No locks for this node. That's okay, since the goal of this
		// function is to blindly clean things up.
		return false
	}
	m.remove(n)
	return true
}

func (m *memLS) Create(now time.Time, details webdav.LockDetails) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.collectExpiredNodes(now)
	details.Root = slashClean(details.Root)

	if !m.canCreate(details.Root, details.ZeroDepth) {
		return "", webdav.ErrLocked
	}
	n := m.create(details.Root)
	n.token = m.nextToken()
	m.byToken[n.token] = n
	n.details = details
	if n.details.Duration >= 0 {
		n.expiry = now.Add(n.details.Duration)
		heap.Push(&m.byExpiry, n)
	}
	return n.token, nil
}

func (m *memLS) Refresh(now time.Time, token string, duration time.Duration) (webdav.LockDetails, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.collectExpiredNodes(now)

	n := m.byToken[token]
	if n == nil {
		return webdav.LockDetails{}, webdav.ErrNoSuchLock
	}
	if n.held {
		return webdav.LockDetails{}, webdav.ErrLocked
	}
	if n.byExpiryIndex >= 0 {
		heap.Remove(&m.byExpiry, n.byExpiryIndex)
	}
	n.details.Duration = duration
	if n.details.Duration >= 0 {
		n.expiry = now.Add(n.details.Duration)
		heap.Push(&m.byExpiry, n)
	}
	return n.details, nil
}

func (m *memLS) Unlock(now time.Time, token string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.collectExpiredNodes(now)

	n := m.byToken[token]
	if n == nil {
		return webdav.ErrNoSuchLock
	}
	if n.held {
		return webdav.ErrLocked
	}
	m.remove(n)
	return nil
}

func (m *memLS) canCreate(name string, zeroDepth bool) bool {
	return walkToRoot(name, func(name0 string, first bool) bool {
		n := m.byName[name0]
		if n == nil {
			return true
		}
		if first {
			if n.token != "" {
				// The target node is already locked.
				return false
			}
			if !zeroDepth {
				// The requested lock depth is infinite, and the fact that n exists
				// (n != nil) means that a descendent of the target node is locked.
				return false
			}
		} else if n.token != "" && !n.details.ZeroDepth {
			// An ancestor of the target node is locked with infinite depth.
			return false
		}
		return true
	})
}

func (m *memLS) create(name string) (ret *memLSNode) {
	walkToRoot(name, func(name0 string, first bool) bool {
		n := m.byName[name0]
		if n == nil {
			n = &memLSNode{
				details: webdav.LockDetails{
					Root: name0,
				},
				byExpiryIndex: -1,
			}
			m.byName[name0] = n
		}
		n.refCount++
		if first {
			ret = n
		}
		return true
	})
	return ret
}

func (m *memLS) remove(n *memLSNode) {
	delete(m.byToken, n.token)
	n.token = ""
	walkToRoot(n.details.Root, func(name0 string, first bool) bool {
		x := m.byName[name0]
		x.refCount--
		if x.refCount == 0 {
			delete(m.byName, name0)
		}
		return true
	})
	if n.byExpiryIndex >= 0 {
		heap.Remove(&m.byExpiry, n.byExpiryIndex)
	}
}

func walkToRoot(name string, f func(name0 string, first bool) bool) bool {
	for first := true; ; first = false {
		if !f(name, first) {
			return false
		}
		if name == "/" {
			break
		}
		name = name[:strings.LastIndex(name, "/")]
		if name == "" {
			name = "/"
		}
	}
	return true
}

type memLSNode struct {
	// details are the lock metadata. Even if this node's name is not explicitly locked,
	// details.Root will still equal the node's name.
	details webdav.LockDetails
	// token is the unique identifier for this node's lock. An empty token means that
	// this node is not explicitly locked.
	token string
	// refCount is the number of self-or-descendent nodes that are explicitly locked.
	refCount int
	// expiry is when this node's lock expires.
	expiry time.Time
	// byExpiryIndex is the index of this node in memLS.byExpiry. It is -1
	// if this node does not expire, or has expired.
	byExpiryIndex int
	// held is whether this node's lock is actively held by a Confirm call.
	held bool
}

type byExpiry []*memLSNode

func (b *byExpiry) Len() int {
	return len(*b)
}

func (b *byExpiry) Less(i, j int) bool {
	return (*b)[i].expiry.Before((*b)[j].expiry)
}

func (b *byExpiry) Swap(i, j int) {
	(*b)[i], (*b)[j] = (*b)[j], (*b)[i]
	(*b)[i].byExpiryIndex = i
	(*b)[j].byExpiryIndex = j
}

func (b *byExpiry) Push(x interface{}) {
	n := x.(*memLSNode)
	n.byExpiryIndex = len(*b)
	*b = append(*b, n)
}

func (b *byExpiry) Pop() interface{} {
	i := len(*b) - 1
	n := (*b)[i]
	(*b)[i] = nil
	n.byExpiryIndex = -1
	*b = (*b)[:i]
	return n
}
