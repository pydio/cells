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

package forms

import (
	"encoding/xml"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestReplicableFields_Serialize(t *testing.T) {

	Convey("Replication Groups", t, func() {

		form := &Form{
			Groups: []*Group{
				{
					Label: "Group 1",
					Fields: []Field{
						&FormField{
							Type:        ParamLegend,
							Name:        "legend",
							Description: "A simple legend text",
						},
						&ReplicableFields{
							Id:          "replication-group",
							Title:       "One or more value",
							Description: "Please provide one or more of these",
							Mandatory:   false,
							Fields: []Field{
								&FormField{
									Name:        "field1",
									Type:        ParamString,
									Label:       "String Field",
									Description: "Field Description",
									Default:     "default_value",
									Mandatory:   false,
									Editable:    true,
								},
								&FormField{
									Name:        "field3",
									Type:        ParamBool,
									Label:       "Bool Field",
									Description: "Field Description 3",
									Default:     true,
									Mandatory:   true,
									Editable:    true,
								},
							},
						},
					},
				},
			},
		}

		marshalled, e := xml.MarshalIndent(form.Serialize(), "", "  ")
		So(e, ShouldBeNil)
		So(string(marshalled), ShouldEqual, `<form>
  <param name="legend" type="legend" description="A simple legend text" group="Group 1"></param>
  <param name="field1" type="string" label="String Field" description="Field Description" group="Group 1" default="default_value" editable="true" replicationGroup="replication-group" replicationTitle="One or more value" replicationDescription="Please provide one or more of these" replicationMandatory="false"></param>
  <param name="field3" type="boolean" label="Bool Field" description="Field Description 3" group="Group 1" default="true" mandatory="true" editable="true" replicationGroup="replication-group" replicationTitle="One or more value" replicationDescription="Please provide one or more of these" replicationMandatory="false"></param>
</form>`)

	})

}
