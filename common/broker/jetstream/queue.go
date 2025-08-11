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

package jetstream

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"net/url"
	"os"
	"time"

	"github.com/nats-io/nats-server/conf"
	nats "github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/crypto"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/controller"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

var (
	nc *nats.Conn
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}
		mgr.RegisterQueue("nats", controller.WithCustomOpener(func(ctx context.Context, url string) (broker.AsyncQueuePool, error) {
			return broker.NewWrappedPool(url, broker.MakeWrappedOpener(&streamOpener{}))
		}))
	})
}

type streamOpener struct{}

func (s *streamOpener) OpenURL(ctx context.Context, u *url.URL) (broker.AsyncQueue, error) {
	streamName := u.Query().Get("name")
	if streamName == "" {
		return nil, errors.New("missing query parameter 'name' for opening queue")
	}
	if srv := u.Query().Get("serviceName"); srv != "" {
		streamName = srv + "/" + streamName
	}
	if prefix := u.Query().Get("prefix"); prefix != "" {
		streamName = streamName + "/" + prefix
	}
	hashr := sha1.New()
	hashr.Write([]byte(streamName))
	sha := hex.EncodeToString(hashr.Sum(nil))
	log.Logger(ctx).Debug("Open JetStream on " + streamName + " as " + sha)
	return NewNatsQueue(ctx, u, sha)
}

type Queue struct {
	rootCtx    context.Context
	streamName string
	js         jetstream.JetStream
	conn       *nats.Conn
}

// Push serializes json-encoded context metadata and proto-encoded event together
func (q *Queue) Push(ctx context.Context, event proto.Message) error {
	data := broker.EncodeProtoWithContext(ctx, event)
	_, er := q.js.Publish(ctx, q.streamName+".msg", data)
	return er
}

// PushRaw forwards a broker.Message to the queue
func (q *Queue) PushRaw(ctx context.Context, message broker.Message) error {
	data := broker.EncodeBrokerMessage(message)
	_, er := q.js.Publish(ctx, q.streamName+".msg", data)
	return er
}

// Consume creates a jetstream Consumer with the current streamName
func (q *Queue) Consume(process func(context.Context, ...broker.Message)) error {
	// Create a stream
	s, er := q.js.CreateOrUpdateStream(q.rootCtx, jetstream.StreamConfig{
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
			if pm, e := broker.DecodeToBrokerMessage(msg.Data()); e == nil {
				process(q.rootCtx, pm)
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

func (q *Queue) Close(ctx context.Context) error {
	if q.conn != nil {
		q.conn.Close()
	}
	return nil
}

func NewNatsQueue(ctx context.Context, u *url.URL, streamName string) (*Queue, error) {
	if nc == nil {
		opts := []nats.Option{
			nats.Timeout(10 * time.Second),
		}

		tlsConfig, err := crypto.TLSConfigFromURL(u)
		if err != nil {
			return nil, err
		}

		if tlsConfig != nil {
			opts = append(opts, nats.Secure(tlsConfig))
		}

		if pwd, ok := u.User.Password(); ok {
			opts = append(opts, nats.UserInfo(u.User.Username(), pwd))
		}

		if env := u.Query().Get("serverConfEnv"); env != "" {
			serverConf := os.Getenv(env)
			if serverConf != "" {
				data, err := conf.Parse(serverConf)
				if err != nil {
					fmt.Println("Could not parse", err)
					return nil, err
				}

				if auth, ok := data["authorization"]; ok {
					if authMap, ok := auth.(map[string]any); ok {
						if users, ok := authMap["users"]; ok {
							if usersSlice, ok := users.([]any); ok {
								if len(usersSlice) > 0 {
									if userMap, ok := usersSlice[0].(map[string]any); ok {
										username, ok1 := userMap["user"].(string)
										password, ok2 := userMap["password"].(string)

										if ok1 && ok2 {
											opts = append(opts, nats.UserInfo(username, password))
										}
									}
								}
							}
						}

						if token, ok := authMap["token"]; ok {
							if tokenString, ok := token.(string); ok {
								opts = append(opts, nats.Token(tokenString))
							}
						}
					}
				}
			}
		}

		u.RawQuery = ""

		c, err := nats.Connect(u.String(), opts...)
		if err != nil {
			log.Logger(ctx).Warn("[nats] connection unavailable, retrying in 10s...", zap.Error(err))
			return nil, err
		}

		nc = c
	}

	js, er := jetstream.New(nc)
	if er != nil {
		return nil, er
	}

	q := &Queue{
		rootCtx:    ctx,
		conn:       nc,
		streamName: streamName,
		js:         js,
	}

	return q, nil
}
