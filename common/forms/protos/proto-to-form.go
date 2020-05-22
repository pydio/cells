package protos

import (
	"reflect"
	"strings"

	"github.com/golang/protobuf/proto"

	"github.com/pydio/cells/common/forms"
)

func GenerateProtoToForm(msg interface{}, asSwitch ...bool) *forms.Form {
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
	makeSwitch := len(asSwitch) > 0 && asSwitch[0]

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
		if field := fieldForValue(fieldName, value.Kind(), value.Type(), pp); field != nil {
			if f, ok := field.(*forms.ReplicableFields); ok && makeSwitch {
				f.Mandatory = true
				field = f
			}
			g.Fields = append(g.Fields, field)
			sw.Values = append(sw.Values, &forms.SwitchValue{
				Name:   fieldName,
				Value:  fieldName,
				Label:  valueField.Name,
				Fields: []forms.Field{field},
			})
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

func fieldForValue(name string, kind reflect.Kind, vType reflect.Type, prop *proto.Properties) forms.Field {
	switch kind {
	case reflect.String:
		return &forms.FormField{
			Name:  name,
			Type:  "string",
			Label: name,
		}
	case reflect.Bool:
		return &forms.FormField{
			Name:  name,
			Type:  "boolean",
			Label: name,
		}
	case reflect.Int64:
		return &forms.FormField{
			Name:  name,
			Type:  "integer",
			Label: name,
		}
	case reflect.Int32:
		if prop != nil && prop.Enum != "" {
			// Enum?
			msi := proto.EnumValueMap(prop.Enum)
			var mss []map[string]string
			for k, _ := range msi {
				kV := make(map[string]string, 1)
				kV[k] = k
				mss = append(mss, kV)
			}
			selector := &forms.FormField{
				Name:             name,
				Type:             "select",
				Label:            name,
				ChoicePresetList: mss,
			}
			return selector
		} else {
			return &forms.FormField{
				Name:  name,
				Type:  "integer",
				Label: name,
			}
		}
	case reflect.Slice:
		//fmt.Println("Slice of", value.Type().Elem().Kind())
		sKind := vType.Elem().Kind()
		replicable := &forms.ReplicableFields{Id: name, Title: name + "[]"}
		if field := fieldForValue(name, sKind, vType, prop); field != nil {
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
