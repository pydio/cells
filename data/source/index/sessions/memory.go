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

package sessions

import (
	"context"
	"sync"
	"time"

	//	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/data/source/index"
	"go.uber.org/zap"
)

var benchmarks bool

func init() {
	benchmarks = false
}

type StoredEvent struct {
	Topic     string
	Msg       interface{}
	EventTime time.Time
}

type SessionMemoryStore struct {
	sync.Mutex
	sessions    map[string]*tree.IndexationSession
	eventsQueue map[string][]StoredEvent
	mPathsQueue map[string]map[*utils.MPath]int64
}

func NewSessionMemoryStore() *SessionMemoryStore {
	store := &SessionMemoryStore{}
	store.sessions = make(map[string]*tree.IndexationSession)
	store.eventsQueue = make(map[string][]StoredEvent)
	store.mPathsQueue = make(map[string]map[*utils.MPath]int64)
	return store
}

func (s *SessionMemoryStore) PutSession(session *tree.IndexationSession) error {
	s.Lock()
	defer s.Unlock()
	s.sessions[session.Uuid] = session
	return nil
}

func (s *SessionMemoryStore) ReadSession(sessionUuid string) (*tree.IndexationSession, SessionBatcher, error) {
	s.Lock()
	defer s.Unlock()
	if sess, ok := s.sessions[sessionUuid]; ok {
		var batcher SessionBatcher
		batcher = &MemoryBatcher{uuid: sessionUuid, store: s}
		if benchmarks {
			batcher = GetBenchSessionBatcher(&MemoryBatcher{uuid: sessionUuid, store: s})
		}
		return sess, batcher, nil
	} else {
		return nil, nil, nil
	}
}

func (s *SessionMemoryStore) DeleteSession(session *tree.IndexationSession) error {
	s.Lock()
	defer s.Unlock()
	if _, ok := s.sessions[session.Uuid]; ok {
		delete(s.sessions, session.Uuid)
	}
	if _, ok := s.eventsQueue[session.Uuid]; ok {
		delete(s.eventsQueue, session.Uuid)
	}
	return nil
}

func (s *SessionMemoryStore) CleanSessions() error {
	return nil
}

type MemoryBatcher struct {
	uuid  string
	store *SessionMemoryStore
}

func (b *MemoryBatcher) Notify(topic string, msg interface{}) {
	b.store.Lock()
	defer b.store.Unlock()

	var queue []StoredEvent
	var exists bool
	if queue, exists = b.store.eventsQueue[b.uuid]; !exists {
		queue = []StoredEvent{}
	}
	queue = append(queue, StoredEvent{Topic: topic, Msg: msg})
	b.store.eventsQueue[b.uuid] = queue
}

func (b *MemoryBatcher) UpdateMPath(path utils.MPath, deltaSize int64) {
	b.store.Lock()
	defer b.store.Unlock()
	var queue map[*utils.MPath]int64
	var exists bool
	if queue, exists = b.store.mPathsQueue[b.uuid]; !exists {
		queue = make(map[*utils.MPath]int64)
	}
	for mpath, size := range queue {
		if mpath.String() == path.String() {
			deltaSize = size + deltaSize
			delete(queue, mpath) // delete this one, will be replaced
			break
		}
	}
	queue[&path] = deltaSize
	b.store.mPathsQueue[b.uuid] = queue
}

func (b *MemoryBatcher) Flush(ctx context.Context, dao index.DAO) {
	b.store.Lock()
	defer b.store.Unlock()
	if queue, exists := b.store.mPathsQueue[b.uuid]; exists {
		for mpath, delta := range queue {
			log.Logger(ctx).Debug("Should update size for path now", zap.Any("path", mpath), zap.Int64("size", delta))
			b := dao.SetNodes("-1", delta)
			node := utils.NewTreeNode()
			node.SetMPath(*mpath...)
			b.Send(node)
			b.Close()
		}
	}

	cl := defaults.NewClient()
	if queue, exists := b.store.eventsQueue[b.uuid]; exists {
		for _, stored := range queue {
			// Notify stored event now
			cl.Publish(ctx, cl.NewPublication(stored.Topic, stored.Msg))
		}
	}
	log.Logger(ctx).Info("Sent all events event on topic")

}
