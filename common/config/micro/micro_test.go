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

package micro

import (
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/common/config/micro/memory"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/go-os/config"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	data []byte
)

func TestConfig(t *testing.T) {
	source := memory.NewSource(memory.WithJSON(data))
	conf := New(
		config.NewConfig(
			config.WithSource(
				source,
			),
			config.PollInterval(1*time.Second),
		),
	)

	Convey("Test Set", t, func() {
		err := conf.Val("my-val").Set([]string{"test"})
		So(err, ShouldBeNil)
	})

	Convey("Test Watch", t, func() {
		w, err := conf.(configx.Watcher).Watch("my-val")
		So(err, ShouldBeNil)

		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			for {
				w.Next()
				wg.Done()
			}
		}()

		conf.Val("my-val").Set([]string{"test2"})
		wg.Wait()
	})
}
