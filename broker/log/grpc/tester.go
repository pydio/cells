// +build ignore

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

// Package grpc provides a Pydio GRPC service for querying the logs
package grpc

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/micro/go-micro"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceLog+".testing"),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Syslog tester"),
			service.WithMicro(func(m micro.Service) error {
				m.Init(micro.AfterStart(func() error {
					<-time.After(10 * time.Second)
					log.Logger(m.Options().Context).Warn("-- STARTING MASSIVE TEST SESSION")
					k := 0
					wg := sync.WaitGroup{}
					for k < 500 {
						wg.Add(1)
						go func(k int) {
							i := 0
							for i < 500 {
								log.Logger(m.Options().Context).Warn(fmt.Sprintf("LOG STRING %d-%d", k, i))
								i++
							}
							defer wg.Done()
						}(k)
						k++
					}
					wg.Wait()
					log.Logger(m.Options().Context).Warn("-- FINISHED MASSIVE TEST SESSION")
					return nil
				}))
				return nil
			}),
		)
	})
}
