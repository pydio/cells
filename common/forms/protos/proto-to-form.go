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

package protos

import (
	"reflect"
	"strings"

	"github.com/golang/protobuf/proto"

	"github.com/pydio/cells/common/forms"
)

func GenerateProtoToForm(prefix string, msg interface{}, makeSwitch bool, i18nKeys ...map[string]string) *forms.Form {
	s := reflect.ValueOf(msg).Elem()
	var structProperties *proto.StructProperties
	if _, ok := msg.(proto.Message); ok {
		structProperties = proto.GetProperties(s.Type())
	}
	g := &forms.Group{}

	sw := &forms.SwitchField{
		Name:   "fieldname",
		Label:  "Field Name",
		Values: []*forms.SwitchValue{},
	}

	for i := 0; i < s.NumField(); i++ {
		value := s.Field(i)
		valueField := s.Type().Field(i)
		var fieldName = valueField.Name
		if jsonTag := valueField.Tag.Get("json"); jsonTag != "" && jsonTag != "-" {
			// check for possible comma as in "...,omitempty"
			var commaIdx int
			if commaIdx = strings.Index(jsonTag, ","); commaIdx < 0 {
				commaIdx = len(jsonTag)
			}
			fieldName = jsonTag[:commaIdx]
		}
		var pp *proto.Properties
		if structProperties != nil {
			pp = structProperties.Prop[i]
		}
		if field := fieldForValue(prefix, fieldName, value.Kind(), value.Type(), pp, i18nKeys...); field != nil {
			if f, ok := field.(*forms.ReplicableFields); ok && makeSwitch {
				f.Mandatory = true
				field = f
			}
			g.Fields = append(g.Fields, field)
			sw.Values = append(sw.Values, &forms.SwitchValue{
				Name:   fieldName,
				Value:  fieldName,
				Label:  prefix + "." + valueField.Name,
				Fields: []forms.Field{field},
			})
			if len(i18nKeys) > 0 {
				i18nKeys[0][prefix+"."+valueField.Name] = valueField.Name
			}
		}
	}
	if makeSwitch {
		// return a unique switch
		g.Fields = []forms.Field{sw}
	}
	f := &forms.Form{
		Groups: []*forms.Group{g},
	}
	return f
}

func fieldForValue(prefix, name string, kind reflect.Kind, vType reflect.Type, prop *proto.Properties, i18nKeys ...map[string]string) forms.Field {

	if len(i18nKeys) > 0 {
		i18nKeys[0][prefix+"."+name] = name
	}

	switch kind {
	case reflect.String:
		return &forms.FormField{
			Name:  name,
			Type:  "string",
			Label: prefix + "." + name,
		}
	case reflect.Bool:
		return &forms.FormField{
			Name:  name,
			Type:  "boolean",
			Label: prefix + "." + name,
		}
	case reflect.Int64:
		return &forms.FormField{
			Name:  name,
			Type:  "integer",
			Label: prefix + "." + name,
		}
	case reflect.Int32:
		if prop != nil && prop.Enum != "" {
			// Enum?
			msi := proto.EnumValueMap(prop.Enum)
			var mss []map[string]string
			for k := range msi {
				kV := make(map[string]string, 1)
				kV[k] = prefix + "." + name + "." + k
				mss = append(mss, kV)
				if len(i18nKeys) > 0 {
					i18nKeys[0][prefix+"."+name+"."+k] = k
				}
			}
			selector := &forms.FormField{
				Name:             name,
				Type:             "select",
				Label:            prefix + "." + name,
				ChoicePresetList: mss,
			}
			return selector
		} else {
			return &forms.FormField{
				Name:  name,
				Type:  "integer",
				Label: prefix + "." + name,
			}
		}
	case reflect.Slice:
		//fmt.Println("Slice of", value.Type().Elem().Kind())
		sKind := vType.Elem().Kind()
		replicable := &forms.ReplicableFields{Id: name, Title: name + "[]"}
		if field := fieldForValue(prefix, name, sKind, vType, prop, i18nKeys...); field != nil {
			replicable.Fields = append(replicable.Fields, field)
			return replicable
		}
		return nil
	case reflect.Ptr:
		//fmt.Println("Struct of", kind, vType)
		return nil
	default:
		//fmt.Println("Unkown type: ", name, kind)
		return nil
	}
}
