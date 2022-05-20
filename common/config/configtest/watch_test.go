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

package configtest

import (
	"fmt"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/config"
	// Plugins to test
	_ "github.com/pydio/cells/v4/common/config/etcd"
	_ "github.com/pydio/cells/v4/common/config/file"
	_ "github.com/pydio/cells/v4/common/config/memory"
)

func testWatch(t *testing.T, store config.Store) {
	Convey("Given a default config initialised in a temp directory", t, func() {
		Convey("Simple GetSet Works", func() {
			go func() {
				w, _ := store.Watch()

				for {
					res, err := w.Next()
					if err != nil {
						return
					}

					fmt.Println(string(res.Bytes()))
				}
			}()

			store.Val("first/second").Set("whatever")
			<-time.After(1 * time.Second)
			store.Val("first/third").Set("whatever2")
			<-time.After(3 * time.Second)
		})
	})
}
