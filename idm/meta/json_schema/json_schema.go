package json_schema

import (
	"encoding/json"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
	"gorm.io/datatypes"
)

type MetaSchemaFactory struct {
	root map[string]interface{}
}

func NewMetaSchemaFactory() *MetaSchemaFactory {
	return &MetaSchemaFactory{
		root: map[string]interface{}{
			"type":       "object",
			"properties": map[string]interface{}{},
		},
	}
}

func toProtoStruct(m map[string]interface{}) *structpb.Struct {
	s, err := structpb.NewStruct(m)
	if err != nil {
		return nil
	}
	return s
}

func JsonToProtoStruct(b *datatypes.JSON) (*structpb.Struct, error) {
	var m map[string]interface{}
	if b == nil {
		return nil, nil
	}
	if err := json.Unmarshal([]byte(*b), &m); err != nil {
		return nil, err
	}
	return structpb.NewStruct(m)
}

func ProtoStructToJson(s *structpb.Struct) (*datatypes.JSON, error) {
	b, err := protojson.Marshal(s)
	if err != nil {
		return nil, err
	}
	tmp := datatypes.JSON(b)
	return &tmp, nil
}

func marshalSchema(s *Schema) map[string]interface{} {
	b, err := s.MarshalJSON()
	if err != nil {
		return nil
	}
	var m map[string]interface{}
	if err := json.Unmarshal(b, &m); err != nil {
		return nil
	}
	return m
}

func (f *MetaSchemaFactory) BuildMetaSchema(label string) *structpb.Struct {
	props := f.root["properties"].(map[string]interface{})
	switch label {
	case "string":
		props["properties"] = map[string]interface{}{
			"minLength": withNumberType(),
			"maxLength": withNumberType(),
		}
		return toProtoStruct(props)

	case "number":
		props["properties"] = map[string]interface{}{
			"minimum": withNumberType(),
			"maximum": withNumberType(),
		}
		return toProtoStruct(props)

	case "array":
		props["properties"] = map[string]interface{}{
			"items": map[string]interface{}{
				"type": withBooleanSchema(),
			},
			"minItems": withNumberSchema(),
			"maxItems": withNumberSchema(),
			"uniqueItems": map[string]interface{}{
				"type": "boolean",
			},
		}
		return toProtoStruct(props)

	default:
		return nil
	}
}

type JSONSchemaFactory struct {
	root map[string]interface{}
}

func NewJSONSchemaFactory() *JSONSchemaFactory {
	return &JSONSchemaFactory{
		root: map[string]interface{}{
			"$id":                  "",
			"type":                 "object",
			"properties":           map[string]interface{}{},
			"additionalProperties": false,
		},
	}
}

type NamespaceDescriptor struct {
	Label      string
	Definition []byte
}

func BuildNamespacesJsonSchema(ns []NamespaceDescriptor) (*structpb.Struct, error) {
	props := map[string]interface{}{}

	for _, n := range ns {
		// TODO DRY
		var def map[string]any
		if err := json.Unmarshal(n.Definition, &def); err != nil {
			return nil, err
		}
		lt, _ := def["type"].(string)

		switch lt {
		case "string", "textarea":
			props[n.Label] = withStringSchema()
		case "number", "integer", "float":
			props[n.Label] = withNumberSchema()
		case "boolean":
			props[n.Label] = withBooleanSchema()
		case "date", "datetime", "date time":
			props[n.Label] = withDateTimeSchema()
		default:
			return nil, nil
		}
	}

	root := map[string]interface{}{
		"type":       "object",
		"title":      "Namespaces Json Schema",
		"properties": props,
		"required":   []interface{}{},
	}
	return toProtoStruct(root), nil
}

func (f *JSONSchemaFactory) BuildJsonSchema(label string) ([]byte, error) {
	props := f.root["properties"].(map[string]interface{})

	switch label {
	case "boolean":
		f.root["title"] = "Boolean"
		props["boolean"] = withBooleanSchema()

	case "textarea":
		f.root["title"] = "Long Text"
		props["longText"] = withStringSchema()

	case "string":
		f.root["title"] = "Text"
		props["text"] = withStringSchema()

	case "integer":
		f.root["title"] = "Number"
		props["number"] = withNumberSchema()

	case "date", "datetime":
		f.root["title"] = "Date Or Time"
		props["dateTime"] = withDateTimeSchema()

	default:
		return nil, nil
	}

	b, err := json.Marshal(f.root)
	if err != nil {
		return nil, err
	}
	return b, nil
}

func GetMetaSchema(label string) *structpb.Struct {
	return NewMetaSchemaFactory().BuildMetaSchema(label)
}

func GetJsonSchema(label string) ([]byte, error) {
	return NewJSONSchemaFactory().BuildJsonSchema(label)
}

func withMin(min int, t string) map[string]interface{} {
	if t == "string" {
		return map[string]interface{}{
			"minLength": min,
		}
	}
	return map[string]interface{}{
		"minimum": min,
	}
}

func withMax(max int, t string) map[string]interface{} {
	if t == "string" {
		return map[string]interface{}{
			"maxLength": max,
		}
	}
	return map[string]interface{}{
		"maximum": max,
	}
}

func withStringSchema() map[string]interface{} {
	s, _ := Infer[string](nil)
	prop := marshalSchema(s)
	prop["minLength"] = withMin(0, "string")["minLength"]
	prop["maxLength"] = withMax(0, "string")["maxLength"]
	// prop["pattern"] = ""
	// prop["format"] = ""
	return prop
}

func withNumberSchema() map[string]interface{} {
	s, _ := Infer[float64](nil)
	prop := marshalSchema(s)
	prop["minimum"] = withMin(0, "number")["minimum"]
	prop["maximum"] = withMax(0, "number")["maximum"]
	return prop
}

func withBooleanSchema() map[string]interface{} {
	s, _ := Infer[bool](nil)
	return marshalSchema(s)
}

func withDateTimeSchema() map[string]interface{} {
	s, _ := Infer[string](nil)
	prop := marshalSchema(s)
	prop["format"] = "date-time"
	return prop
}

func withNumberType() map[string]interface{} {
	return map[string]interface{}{
		"type": "number",
	}
}

func withStringType() map[string]interface{} {
	return map[string]interface{}{
		"type": "string",
	}
}

func LegacyTypeToLabel(d []byte) string {

	var tv string
	if len(d) > 0 {
		var def map[string]interface{}
		if err := json.Unmarshal(d, &def); err == nil {
			if t, e := def["type"].(string); e {
				tv = t
			}
		}
	}

	return tv
}
