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

package service

import (
	"strings"
	"testing"

	"github.com/micro/protobuf/jsonpb"
	"github.com/micro/protobuf/ptypes"
	. "github.com/smartystreets/goconvey/convey"
)

func TestQuery_UnmarshalJSONPB(t *testing.T) {

	Convey("Test basic unmarshalling", t, func() {

		data := `{"SubQueries": [{"Data": {"Success": true},"Name": "ActionOutputQuery"}]}`
		q := &Query{}
		unmarshaler := &jsonpb.Unmarshaler{}
		e := unmarshaler.Unmarshal(strings.NewReader(data), q)

		So(e, ShouldBeNil)
		So(q.SubQueries, ShouldHaveLength, 1)

		output := ActionOutputQuery{}
		e2 := ptypes.UnmarshalAny(q.SubQueries[0], &output)
		So(e2, ShouldBeNil)
		So(output, ShouldResemble, ActionOutputQuery{
			Success: true,
		})

	})

}
