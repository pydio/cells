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

package docstore

import (
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/docstore"
)

func TestNewBoltStore(t *testing.T) {

	Convey("Test NewBoltStore", t, func() {

		p := newPath("bolt-test1.db")
		bs, e := NewBoltStore(p, true)
		So(e, ShouldBeNil)
		So(bs, ShouldNotBeNil)

		bs.PutDocument("mystore", &docstore.Document{ID: "1", Data: "Data"})
		stores, e := bs.ListStores()
		So(e, ShouldBeNil)
		So(stores, ShouldHaveLength, 1)
		So(stores[0], ShouldEqual, "mystore")

		e = bs.Close()
		So(e, ShouldBeNil)
		stat, _ := os.Stat(p)
		So(stat, ShouldBeNil)

	})

}
