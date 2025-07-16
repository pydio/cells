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

// Package service provides a gRPC service that triggers scheduler events based on ISO 8601 patterns.
package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/server/generic"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/scheduler/timer"
)

var (
	producers map[string]*timer.EventProducer
	pLocks    sync.RWMutex
)

func init() {
	producers = make(map[string]*timer.EventProducer)
	runtime.Register("main", func(ctx context.Context) {

		service.NewService(
			service.Name(common.ServiceGenericNamespace_+common.ServiceTimer),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Description("Triggers events based on a scheduler pattern"),
			service.Unique(true),
			service.WithGeneric(func(c context.Context, _ *generic.Server) error {

				go func() {
					// Wait that all services are started.
					// Producer(s) may have already been started by the events subscribed below
					<-time.After(10 * time.Second)
					tm := runtime.MultiContextManager()
					_ = tm.Watch(c, func(ct context.Context, id string) error {
						pLocks.Lock()
						defer pLocks.Unlock()
						// It was already registered
						if _, ok := producers[id]; ok {
							return nil
						}
						tp := timer.NewEventProducer(ct)
						go func() {
							if er := tp.Start(); er != nil {
								log.Logger(ct).Warn("Failed to start timer producer", zap.Error(er))
							}
						}()
						producers[id] = tp
						return nil
					}, func(_ context.Context, id string) error {
						pLocks.Lock()
						defer pLocks.Unlock()
						delete(producers, id)
						return nil
					}, true)
				}()

				if er := broker.SubscribeCancellable(c, common.TopicJobConfigEvent, func(ctx context.Context, message broker.Message) error {
					msg := &jobs.JobChangeEvent{}
					if ct, e := message.Unmarshal(ctx, msg); e == nil {
						if cID := runtime.MultiContextManager().Current(ctx); cID != "" {
							pLocks.RLock()
							defer pLocks.RUnlock()
							if producer, ok := producers[cID]; ok {
								return producer.Handle(ct, msg)
							} else {
								producers[cID] = timer.NewEventProducer(ct)
								go func() {
									if er := producers[cID].Start(); er != nil {
										log.Logger(ctx).Warn("Error while starting event producer", zap.Error(er))
									}
								}()
							}
							return nil
						} else {
							return errors.New("cannot find info in broker event context")
						}
					}
					return nil
				}, broker.WithCounterName("timer")); er != nil {
					return fmt.Errorf("cannot subscribe on JobConfigEvent topic %v", er)
				}

				return nil

			}),
			service.WithGenericStop(func(c context.Context, _ *generic.Server) error {
				pLocks.RLock()
				defer pLocks.RUnlock()
				for _, p := range producers {
					p.StopAll()
				}
				return nil
			}),
		)
	})
}
