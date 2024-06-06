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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/scheduler/timer"
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
			service.WithGeneric(func(c context.Context, server *generic.Server) error {

				tm := tenant.GetManager()

				pLocks.Lock()
				tm.Iterate(c, func(tenantContext context.Context, t tenant.Tenant) error {
					tp := timer.NewEventProducer(tenantContext)
					go tp.Start()
					producers[t.ID()] = tp
					return nil
				})
				pLocks.Unlock()

				_ = tm.Subscribe(func(event tenant.WatchEvent) {
					pLocks.Lock()
					defer pLocks.Unlock()
					tenantID := event.Tenant().ID()
					if event.Action() == "add" {
						tp := timer.NewEventProducer(event.Context(c))
						go tp.Start()
						producers[tenantID] = tp
					} else if event.Action() == "delete" {
						delete(producers, tenantID)
					}
				})

				if er := broker.SubscribeCancellable(c, common.TopicJobConfigEvent, func(ctx context.Context, message broker.Message) error {
					msg := &jobs.JobChangeEvent{}
					if ct, e := message.Unmarshal(ctx, msg); e == nil {
						var ten tenant.Tenant
						if propagator.Get(ctx, tenant.ContextKey, &ten) {
							pLocks.RLock()
							defer pLocks.RUnlock()
							if producer, ok := producers[ten.ID()]; ok {
								return producer.Handle(ct, msg)
							}
							return fmt.Errorf("cannot find timer.Producer for corresponding tenant")
						} else {
							return fmt.Errorf("cannot find tenant in broker event context")
						}
					}
					return nil
				}, broker.WithCounterName("timer")); er != nil {
					return fmt.Errorf("cannot subscribe on JobConfigEvent topic %v", er)
				}

				return nil

			}),
			service.WithGenericStop(func(c context.Context, server *generic.Server) error {
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
