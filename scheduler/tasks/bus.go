/*
 * Copyright (c) 2024 Abstrium SAS <team (at) pydio.com>
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

package tasks

import (
	"context"
	"sync"
	"time"

	"github.com/cskr/pubsub"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

type Bus struct {
	*pubsub.PubSub
	cli *ReconnectingClient
}

// UnSubWithFlush wraps PubSub.Unsub with a select to make sure all messages are consumed before unsubscribing.
func (ps *Bus) UnSubWithFlush(ch chan interface{}, topics ...string) {
consume:
	for {
		select {
		case _, ok := <-ch:
			if !ok {
				break consume
			}
			//fmt.Println("Unsub", topics, "there was still something to consume...")
		case <-time.After(3 * time.Second):
			//fmt.Println("Unsub", topics, "Break loop...")
			break consume
		}
	}
	ps.PubSub.Unsub(ch, topics...)
}

// Close implements the ResourceCloseable interface
func (ps *Bus) Close(ctx context.Context) error {
	ps.Shutdown()
	ps.cli.Stop()
	return nil
}

var (
	TestDisableTaskClient bool
	busPool               *openurl.Pool[*Bus]
	busPoolInit           sync.Once
	busPoolCtx            = context.Background()
)

func GetBus(ctx context.Context) *Bus {
	busPoolInit.Do(func() {
		busPool = openurl.MustMemPool[*Bus](busPoolCtx, func(ctx context.Context, url string) *Bus {
			// create pubsub and start listening
			c := &Bus{
				PubSub: pubsub.New(0),
			}
			if !TestDisableTaskClient {
				ch := c.Sub(PubSubTopicTaskStatuses)
				c.cli = NewTaskReconnectingClient(ctx)
				c.cli.StartListening(ch)
			}
			return c
		})
	})
	ps, er := busPool.Get(context.WithoutCancel(ctx))
	if er != nil {
		panic(er)
	}
	return ps
}
