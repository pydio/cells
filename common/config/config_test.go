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
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestConfig(t *testing.T) {
	Convey("Test Set", t, func() {
		err := Set("my-test-config-value", "test")
		So(err, ShouldBeNil)
		So(Get("test").Default("").String(), ShouldEqual, "my-test-config-value")
	})

	Convey("Test Del", t, func() {
		err := Set(map[string]interface{}{
			"bool1": true,
			"bool2": false,
		}, "test")

		So(err, ShouldBeNil)
		Get("test/bool1").Del()
		// Get("test/bool2").Del()
		Save("test", "test")
	})

	Convey("Test setting", t, func() {
		c := Get().Val("test/test/test")
		Set("test1", "test/test/test/test1")
		So(c.Val("test1").String(), ShouldEqual, "test1")
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
