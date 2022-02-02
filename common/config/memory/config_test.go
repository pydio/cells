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

package memory

import (
	"testing"

	"github.com/pydio/cells/v4/common/config"

	. "github.com/smartystreets/goconvey/convey"
)

func TestConfig(t *testing.T) {
	config.Register(New())

	Convey("Test Set", t, func() {
		err := config.Set("my-test-config-value", "test")
		So(err, ShouldBeNil)
		So(config.Get("test").Default("").String(), ShouldEqual, "my-test-config-value")
	})

	Convey("Test Del", t, func() {
		err := config.Set(map[string]interface{}{
			"bool1": true,
			"bool2": false,
		}, "test")

		So(err, ShouldBeNil)
		config.Get("test/bool1").Del()
		// Get("test/bool2").Del()
		config.Save("test", "test")
	})

	Convey("Test setting", t, func() {
		config.Get("map").Set(map[string]string{"k1": "v1"})
		config.Get("map").Set(map[string]string{"k2": "v2"})

		So(config.Get("map/k1").String(), ShouldEqual, "")
		So(config.Get("map/k2").String(), ShouldEqual, "v2")
	})

	Convey("Test setting", t, func() {
		v := config.Get().Val("test/test/test")
		config.Set("test1", "test/test/test/test1")
		So(v.Val("test1").String(), ShouldEqual, "test1")
	})

	// TODO
	//Convey("Test Watch", t, func() {
	//	w, err := config.Watch("watch", "val")
	//	So(err, ShouldBeNil)
	//
	//	wg := &sync.WaitGroup{}
	//	wg.Add(1)
	//	go func() {
	//		for {
	//			w.Next()
	//
	//			wg.Done()
	//		}
	//	}()
	//
	//	config.Set("test", "watch", "val")
	//
	//	wg.Wait()
	//})
}
