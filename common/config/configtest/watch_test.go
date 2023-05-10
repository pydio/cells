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
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
	. "github.com/smartystreets/goconvey/convey"
	"golang.org/x/exp/maps"
	"sync"
	"testing"
	// Plugins to test
	_ "github.com/pydio/cells/v4/common/config/etcd"
	_ "github.com/pydio/cells/v4/common/config/file"
	_ "github.com/pydio/cells/v4/common/config/memory"
)

func testWatch(t *testing.T, store config.Store) {
	Convey("Given a default config initialised in a temp directory", t, func() {
		Convey("Simple GetSet Works", func() {
			//wg := &sync.WaitGroup{}
			//go func() {
			//	w, _ := store.Watch()
			//
			//	for {
			//		res, err := w.Next()
			//		if err != nil {
			//			wg.Done()
			//			return
			//		}
			//
			//		fmt.Println(string(res.(configx.Values).Bytes()))
			//		wg.Done()
			//	}
			//}()
			//
			//store.Val("first/second").Set("whatever")
			//wg.Wait()
			//store.Val("first/third").Set("whatever2")
			//wg.Wait()
			//
			//meta := make(map[string]string)
			//meta["test"] = "test"
			//
			//val := Teststruct{Name: "test", Meta: meta}
			//
			//fmt.Println("Setting val")
			//wg.Add(1)
			//store.Val("val").Set(val)
			//wg.Wait()
			//
			//val.Name = "test2"
			//meta["test"] = "test2"
			//
			//fmt.Println("Setting second val")
			//wg.Add(1)
			//store.Val("val").Set(val)
			//wg.Wait()
			//
			//fmt.Println("Finished")

			wg2 := &sync.WaitGroup{}
			go func() {
				w, _ := store.Watch(configx.WithPath("first", "*"), configx.WithChangesOnly())

				for {
					res, err := w.Next()
					if err != nil {
						wg2.Done()
						return
					}

					fmt.Println("In regexp ", res.(configx.Values).Map())
					wg2.Done()
				}
			}()

			fmt.Println("Regexp ")

			wg2.Add(2)
			store.Val("first/regexp1").Set("test")
			wg2.Wait()

			wg2.Add(1)
			store.Val("first/regexp2").Set("test")
			wg2.Wait()

			wg2.Add(1)
			store.Val("first/regexp2").Del()
			wg2.Wait()

		})
	})
}

type Teststruct struct {
	Name string            `diff:"Name"`
	Meta map[string]string `diff:"Meta"`
}

func (s Teststruct) Clone() interface{} {
	clone := Teststruct{}
	clone = s
	clone.Meta = maps.Clone(s.Meta)

	return clone
}
