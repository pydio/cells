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

package test

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common/micro/router"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
)

func init() {
	lock := &sync.Mutex{}

	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name("testing"),
			service.Context(ctx),
			service.WithMicro(func(m micro.Service) error {
				r := router.NewRouter()
				fmt.Println(r)
				go func() {
					<-time.After(1 * time.Second)

					ticker := time.NewTicker(10 * time.Millisecond)

					for {
						select {
						case <-ticker.C:
							lock.Lock()
							meta := m.Server().Options().Metadata
							fmt.Println("Writing")
							meta["testing"] = "testing"
							//_ = c
							//_ = ok
							lock.Unlock()
						}
					}
				}()

				return nil
			}),
		)
	})
}
