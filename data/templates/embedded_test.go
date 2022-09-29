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

package templates

import (
	"context"
	"io"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestGetProvider(t *testing.T) {
	Convey("Test Providers and Embedded DAO", t, func() {
		dao := GetProvider()
		ctx := context.Background()
		nodes, er := dao.List(ctx)
		So(er, ShouldBeNil)
		So(nodes, ShouldHaveLength, 11)
		n := nodes[0]
		So(n.AsTemplate().UUID, ShouldEqual, "01-Microsoft Word.docx")
		So(n.AsTemplate().Label, ShouldEqual, "Microsoft Word")
		So(n.IsLeaf(), ShouldBeTrue)
		reader, size, e := n.Read(ctx)
		So(e, ShouldBeNil)
		So(size, ShouldBeGreaterThan, 0)
		data, _ := io.ReadAll(reader)
		So(len(data), ShouldBeGreaterThan, 0)

		byId, e := dao.ByUUID(ctx, "05-MS PowerPoint Template.pot")
		So(e, ShouldBeNil)
		So(byId.AsTemplate().UUID, ShouldEqual, "05-MS PowerPoint Template.pot")
	})
}
