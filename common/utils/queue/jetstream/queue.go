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

package jetstream

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/utils/queue"
)

var (
	nc *nats.Conn
)

type streamOpener struct{}

func (s *streamOpener) OpenURL(ctx context.Context, u *url.URL) (queue.Queue, error) {
	streamName := u.Query().Get("name")
	if streamName == "" {
		return nil, fmt.Errorf("missing query parameter 'name' for opening queue")
	}
	return NewNatsQueue(ctx, u, streamName)
}

func init() {
	queue.DefaultURLMux().Register("nats", &streamOpener{})
}

type Queue struct {
	rootCtx    context.Context
	streamName string
	js         jetstream.JetStream
}

// Push serializes json-encoded context metadata and proto-encoded event together
func (q *Queue) Push(ctx context.Context, event proto.Message) error {
	data := queue.EncodeProtoWithContext(ctx, event)
	_, er := q.js.Publish(ctx, q.streamName+".msg", data)
	return er
}

// Consume creates a jetstream Consumer with the current streamName
func (q *Queue) Consume(process queue.Consumer) error {
	// Create a stream
	s, er := q.js.CreateStream(q.rootCtx, jetstream.StreamConfig{
		Name:     q.streamName,
		Subjects: []string{q.streamName + ".*"},
	})
	if er != nil {
		return er
	}
	// Create durable consumer
	c, er := s.CreateOrUpdateConsumer(q.rootCtx, jetstream.ConsumerConfig{
		Durable:   "CONS",
		AckPolicy: jetstream.AckExplicitPolicy,
	})
	if er != nil {
		return er
	}
	go func() {
		cons, _ := c.Consume(func(msg jetstream.Msg) {
			_ = msg.Ack()
			if pm, e := queue.DecodeToBrokerMessage(msg.Data()); e == nil {
				process(pm)
			} else {
				log.Logger(q.rootCtx).Error("[nats-queue] cannot consume pulled message correctly", zap.Error(e))
			}
		})
		<-q.rootCtx.Done()
		log.Logger(q.rootCtx).Debug("[nats-queue] Closing consume context now")
		cons.Stop()
	}()
	return nil
}

func NewNatsQueue(ctx context.Context, u *url.URL, streamName string) (*Queue, error) {
	if nc == nil {
		tlsConfig, err := crypto.TLSConfigFromURL(u)
		if err != nil {
			return nil, err
		}
		opts := []nats.Option{
			nats.Timeout(10 * time.Second),
		}
		if tlsConfig != nil {
			opts = append(opts, nats.Secure(tlsConfig))
		}
		u.RawQuery = ""
		if n, err := nats.Connect(u.String(), opts...); err == nil {
			nc = n
		} else {
			return nil, err
		}
	}
	js, er := jetstream.New(nc)
	if er != nil {
		return nil, er
	}

	q := &Queue{
		rootCtx:    ctx,
		streamName: streamName,
		js:         js,
	}
	return q, nil
}
