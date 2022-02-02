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

	"github.com/nicksnyder/go-i18n/i18n"

	i18n2 "github.com/pydio/cells/v4/common/utils/i18n"
)

// Should reflect the frontend Form definitions
// XSD is
//<xs:complexType>
//	<xs:attribute name="name" use="required" type="xs:NCName"/>
//	<xs:attribute name="type" use="required" type="xs:Name"/>
//	<xs:attribute name="label" use="required"/>
//	<xs:attribute name="description" use="required"/>
//	<xs:attribute name="default"/>
//	<xs:attribute name="choices"/>
//	<xs:attribute name="group"/>
//	<xs:attribute name="replicationGroup"/>
//	<xs:attribute name="replicationTitle" type="xs:Name" use="optional"/>
//	<xs:attribute name="replicationDescription" type="xs:Name" use="optional"/>
//	<xs:attribute name="replicationMandatory" type="xs:boolean" use="optional"/>
//	<xs:attribute name="mandatory" type="xs:boolean"/>
//	<xs:attribute name="editable" type="xs:boolean" use="optional"/>
//	<xs:attribute name="uploadAction" use="optional"/>
//	<xs:attribute name="loadAction" use="optional"/>
//	<xs:attribute name="defaultImage" use="optional"/>
//	<xs:attribute name="group_switch_name" use="optional"/>
//	<xs:attribute name="group_switch_value" use="optional"/>
//	<xs:attribute name="group_switch_label" use="optional"/>
//</xs:complexType>

type ParamType string

const (
	ParamString        ParamType = "string"
	ParamTextarea      ParamType = "textarea"
	ParamPassword      ParamType = "password"
	ParamValidLogin    ParamType = "valid-login"
	ParamValidPassword ParamType = "valid-password"
	ParamBool          ParamType = "boolean"
	ParamInteger       ParamType = "integer"
	ParamIntegerBytes  ParamType = "integer-bytes"
	ParamLegend        ParamType = "legend"
	ParamHidden        ParamType = "hidden"

	ParamSelect           ParamType = "select"
	ParamAutoComplete     ParamType = "autocomplete"
	ParamAutoCompleteTree ParamType = "autocomplete-tree"

	ParamButton  ParamType = "button"
	ParamMonitor ParamType = "monitor"
	ParamImage   ParamType = "image"
)

type SerialFormParam struct {
	XMLName xml.Name `xml:"param" json:"-"`

	GroupSwitchName  string `xml:"group_switch_name,attr,omitempty" json:"group_switch_name,omitempty"`
	GroupSwitchValue string `xml:"group_switch_value,attr,omitempty" json:"group_switch_value,omitempty"`
	GroupSwitchLabel string `xml:"group_switch_label,attr,omitempty" json:"group_switch_label,omitempty"`

	Name        string `xml:"name,attr" json:"name"`
	Type        string `xml:"type,attr" json:"type"`
	Label       string `xml:"label,attr,omitempty" json:"label,omitempty"`
	Description string `xml:"description,attr,omitempty" json:"description,omitempty"`
	Group       string `xml:"group,attr" json:"group"`
	Default     string `xml:"default,omitempty,attr" json:"default,omitempty"`
	Mandatory   bool   `xml:"mandatory,omitempty,attr" json:"mandatory,omitempty"`
	Editable    bool   `xml:"editable,omitempty,attr" json:"editable,omitempty"`

	Choices string `xml:"choices,omitempty,attr" json:"choices,omitempty"`

	UploadAction string `xml:"uploadAction,attr,omitempty" json:"uploadAction,omitempty"`
	LoadAction   string `xml:"loadAction,attr,omitempty" json:"loadAction,omitempty"`
	DefaultImage string `xml:"defaultImage,attr,omitempty" json:"defaultImage,omitempty"`

	ReplicationGroup       string `xml:"replicationGroup,attr,omitempty" json:"replicationGroup,omitempty"`
	ReplicationTitle       string `xml:"replicationTitle,attr,omitempty" json:"replicationTitle,omitempty"`
	ReplicationDescription string `xml:"replicationDescription,attr,omitempty" json:"replicationDescription,omitempty"`
	ReplicationMandatory   string `xml:"replicationMandatory,attr,omitempty" json:"replicationMandatory,omitempty"`
}

type SerialForm struct {
	XMLName xml.Name `xml:"form" json:"-"`
	Params  []*SerialFormParam
}

type Field interface {
	Serialize(T i18n.TranslateFunc) []*SerialFormParam
}

type Group struct {
	Label  string
	Fields []Field
}

type Form struct {
	Groups     []*Group
	I18NBundle *i18n2.I18nBundle
}

// Serialize returns a list of serializable fields
func (f *Form) Serialize(languages ...string) interface{} {
	sForm := &SerialForm{}
	var T i18n.TranslateFunc
	if f.I18NBundle != nil {
		T = f.I18NBundle.GetTranslationFunc(languages...)
	} else {
		T = i18n.IdentityTfunc()
	}
	for _, group := range f.Groups {
		for _, field := range group.Fields {
			serials := field.Serialize(T)
			for _, serial := range serials {
				serial.Group = T(group.Label)
				sForm.Params = append(sForm.Params, serial)
			}
		}
	}
	return sForm
}
