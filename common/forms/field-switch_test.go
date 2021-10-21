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

func TestGroupSwitchField_Serialize(t *testing.T) {

	Convey("Basic Form Fields", t, func() {

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
						&SwitchField{
							Name:        "switch",
							Label:       "Select value",
							Description: "Change will update sub form",
							Values: []*SwitchValue{
								{
									Name:  "VALUE1",
									Label: "Value 1",
									Value: "VALUE1",
									Fields: []Field{
										&FormField{
											Name:        "field1",
											Type:        ParamString,
											Label:       "String Field",
											Description: "Field Description",
											Default:     "default_value",
										},
									},
								},
								{
									Name:  "VALUE2",
									Label: "Value 2",
									Value: "VALUE2",
									Fields: []Field{
										&FormField{
											Name:        "field2",
											Type:        ParamString,
											Label:       "String Field 2",
											Description: "Field Description 2",
										},
									},
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
  <param name="switch" type="group_switch:switch" label="Select value" description="Change will update sub form" group="Group 1"></param>
  <param group_switch_name="switch" group_switch_value="VALUE1" group_switch_label="Value 1" name="@value" type="hidden" group="Group 1" default="VALUE1"></param>
  <param group_switch_name="switch" group_switch_value="VALUE1" group_switch_label="Value 1" name="field1" type="string" label="String Field" description="Field Description" group="Group 1" default="default_value"></param>
  <param group_switch_name="switch" group_switch_value="VALUE2" group_switch_label="Value 2" name="@value" type="hidden" group="Group 1" default="VALUE2"></param>
  <param group_switch_name="switch" group_switch_value="VALUE2" group_switch_label="Value 2" name="field2" type="string" label="String Field 2" description="Field Description 2" group="Group 1"></param>
</form>`)

	})

}
