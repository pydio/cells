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
	"log"
	"testing"

	json "github.com/pydio/cells/v5/common/utils/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

func TestFormField_Serialize(t *testing.T) {

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
						&FormField{
							Type:    ParamHidden,
							Name:    "hidden-field",
							Default: "hidden-value",
						},
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
							Name:        "field2",
							Type:        ParamString,
							Label:       "String Field 2",
							Description: "Field Description 2",
							Mandatory:   true,
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
						&FormField{
							Name:        "field4",
							Type:        ParamPassword,
							Label:       "Password Field",
							Description: "Field Description 4",
						},
						&FormField{
							Name:        "field5",
							Type:        ParamValidPassword,
							Label:       "Valid Password Field",
							Description: "Field Description 5",
						},
						&FormField{
							Name:        "field6",
							Type:        ParamInteger,
							Label:       "Integer Field",
							Description: "Field Description 6",
							Default:     6,
						},
					},
				},
			},
		}

		marshalled, e := xml.MarshalIndent(form.Serialize(), "", "  ")
		So(e, ShouldBeNil)
		So(string(marshalled), ShouldEqual, `<form>
  <param name="legend" type="legend" description="A simple legend text" group="Group 1"></param>
  <param name="hidden-field" type="hidden" group="Group 1" default="hidden-value"></param>
  <param name="field1" type="string" label="String Field" description="Field Description" group="Group 1" default="default_value" editable="true"></param>
  <param name="field2" type="string" label="String Field 2" description="Field Description 2" group="Group 1" mandatory="true" editable="true"></param>
  <param name="field3" type="boolean" label="Bool Field" description="Field Description 3" group="Group 1" default="true" mandatory="true" editable="true"></param>
  <param name="field4" type="password" label="Password Field" description="Field Description 4" group="Group 1"></param>
  <param name="field5" type="valid-password" label="Valid Password Field" description="Field Description 5" group="Group 1"></param>
  <param name="field6" type="integer" label="Integer Field" description="Field Description 6" group="Group 1" default="6"></param>
</form>`)

		jsonMarsh, e := json.MarshalIndent(form.Serialize(), "", "  ")
		So(e, ShouldBeNil)
		log.Print(string(jsonMarsh))

	})

	Convey("Choice Fields", t, func() {

		form := &Form{
			Groups: []*Group{
				{
					Label: "Group 1",
					Fields: []Field{
						&FormField{
							Name:        "field1",
							Type:        ParamSelect,
							Label:       "Choice Field",
							Description: "Field Description",
							ChoicePresetList: []map[string]string{
								{"value1": "Label 1"},
								{"value2": "Label 2"},
								{"value3": "Label 3"},
							},
						},
						&FormField{
							Name:           "field2",
							Type:           ParamSelect,
							Label:          "Choice Field 2",
							Description:    "Field Description 2",
							ChoiceJsonList: "list_all_countries",
						},
					},
				},
			},
		}

		marshalled, e := xml.MarshalIndent(form.Serialize(), "", "  ")
		So(e, ShouldBeNil)
		So(string(marshalled), ShouldEqual, `<form>
  <param name="field1" type="select" label="Choice Field" description="Field Description" group="Group 1" choices="value1|Label 1,value2|Label 2,value3|Label 3"></param>
  <param name="field2" type="select" label="Choice Field 2" description="Field Description 2" group="Group 1" choices="json:list_all_countries"></param>
</form>`)

	})

}
