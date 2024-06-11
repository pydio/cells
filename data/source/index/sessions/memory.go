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

package sessions

import (
	"context"
	"fmt"
	"sync"
	"time"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/data/source/index"
)

var benchmarks bool

func init() {
	benchmarks = false
}

type StoredEvent struct {
	Topic     string
	Msg       proto.Message
	EventTime time.Time
}

type SessionMemoryStore struct {
	sync.Mutex
	sessions    map[string]*tree.IndexationSession
	eventsQueue map[string][]StoredEvent
}

func NewSessionMemoryStore() *SessionMemoryStore {
	store := &SessionMemoryStore{}
	store.sessions = make(map[string]*tree.IndexationSession)
	store.eventsQueue = make(map[string][]StoredEvent)
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
	delete(s.sessions, session.Uuid)
	delete(s.eventsQueue, session.Uuid)
	return nil
}

func (s *SessionMemoryStore) CleanSessions() error {
	return nil
}

type MemoryBatcher struct {
	uuid  string
	store *SessionMemoryStore
}

func (b *MemoryBatcher) Notify(topic string, msg proto.Message) {
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

func (b *MemoryBatcher) Flush(ctx context.Context, dao index.DAO) {
	b.store.Lock()
	defer b.store.Unlock()

	count := 0
	if queue, exists := b.store.eventsQueue[b.uuid]; exists {
		for _, stored := range queue {
			// Notify stored event now
			broker.MustPublish(ctx, stored.Topic, stored.Msg)
			count++
			if count%1000 == 0 {
				// Let's micro pause every 1000 events to reduce pressure
				<-time.After(100 * time.Millisecond)
			}
		}
	}
	log.Logger(ctx).Info(fmt.Sprintf("Sent %d events event on topic", count))

}
