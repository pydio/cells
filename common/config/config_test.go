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

package config

import (
	"context"
	"fmt"
	"reflect"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/common/config/micro/file"
	"github.com/pydio/cells/common/config/micro/memory"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/cells/x/filex"
	"github.com/pydio/go-os/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestConfig(t *testing.T) {
	Convey("Test Set", t, func() {
		err := Set("my-test-config-value", "test")
		So(err, ShouldBeNil)
		So(Get("test").Default("").String(), ShouldEqual, "my-test-config-value")
	})

	Convey("Test Watch", t, func() {
		w, err := Watch("watch", "val")
		So(err, ShouldBeNil)

		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			for {
				w.Next()

				wg.Done()
			}
		}()

		Set("test", "watch", "val")

		wg.Wait()
	})
}

func TestUpdate(t *testing.T) {
	Convey("Test updates", t, func() {

		type updateable interface {
			Update(c *config.ChangeSet)
		}

		versionsStore := filex.NewStore(PydioConfigDir)
		vaultConfig := New(
			micro.New(
				config.NewConfig(
					config.WithSource(
						memory.NewSource(memory.WithJSON([]byte{})),
					),
					config.PollInterval(10*time.Second),
				),
			))

		source := file.NewSource(config.SourceName("/tmp/config.test"))
		//source := memory.NewSource(memory.WithJSON([]byte{}))
		std := NewVault(
			New(NewVersionStore(versionsStore, micro.New(config.NewConfig(
				config.WithSource(source),
				config.PollInterval(1*time.Second),
			)))),
			vaultConfig,
		)

		Register(std)

		ctx := context.WithValue(context.Background(), "config", Get("level1"))

		tick := time.Tick(2 * time.Second)
		timeout := time.After(10 * time.Second)
		for {
			select {
			case <-tick:
				// source.(updateable).Update(&config.ChangeSet{
				// 	Data: []byte(fmt.Sprintf(`{"level1": { "level2": {"timestamp": "%v"}}}`, time.Now())),
				// })

				cfg := ctx.Value("config").(configx.Values)

				fmt.Println("New val is ", reflect.TypeOf(cfg), cfg.Val())
				continue
			case <-timeout:
				break
			}
			break
		}
	})

	/*
		Convey("Test Scan", t, func() {
			w, err := Watch("watch", "val")
			So(err, ShouldBeNil)

			wg := &sync.WaitGroup{}
			wg.Add(1)
			go func() {
				for {
					w.Next()

					wg.Done()
				}
			}()

			Set("test", "watch", "val")

			wg.Wait()
		})
	*/
}
