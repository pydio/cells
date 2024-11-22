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

import "github.com/pydio/cells/v5/common/utils/i18n"

const (
	SwitchFieldValueKey   = "@value"
	SwitchFieldTypePrefix = "group_switch:"
)

type SwitchValue struct {
	Name   string
	Value  string
	Label  string
	Fields []Field
}

type SwitchField struct {
	Name        string
	Label       string
	Description string
	Default     string
	Mandatory   bool
	Editable    bool

	Values []*SwitchValue
}

func (g *SwitchField) Serialize(T i18n.TranslateFunc) (params []*SerialFormParam) {

	// Append master field
	params = append(params, &SerialFormParam{
		Name:        g.Name,
		Label:       T(g.Label),
		Type:        SwitchFieldTypePrefix + g.Name,
		Description: T(g.Description),
		Default:     g.Default,
		Mandatory:   g.Mandatory,
		Editable:    g.Editable,
	})

	for _, value := range g.Values {

		// Add a hidden field for this value
		params = append(params, &SerialFormParam{
			Name:    SwitchFieldValueKey,
			Default: value.Value,
			Type:    string(ParamHidden),

			GroupSwitchName:  g.Name,
			GroupSwitchLabel: T(value.Label),
			GroupSwitchValue: value.Value,
		})

		// Now add subforms
		for _, subField := range value.Fields {
			serialSubs := subField.Serialize(T)
			for _, serial := range serialSubs {
				// Do not replace GroupSwitch if it's already a sub-group-switch
				if serial.GroupSwitchName == "" {
					serial.GroupSwitchName = g.Name
					serial.GroupSwitchValue = value.Value
					serial.GroupSwitchLabel = T(value.Label)
				}
				params = append(params, serial)
			}
		}

	}

	return params
}
