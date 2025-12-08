package json_schema

import (
	"encoding/json"
	"fmt"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
	"gorm.io/datatypes"
)

type MetaSchemaFactory struct {
	root map[string]interface{}
}

func NewMetaSchemaFactory(label string) *MetaSchemaFactory {
	return &MetaSchemaFactory{
		root: map[string]interface{}{
			"$id":        fmt.Sprint("pydio://schemas/meta-schema/" + label),
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
			"required":             []interface{}{},
		},
	}
}

type NamespaceDescriptor struct {
	Namespace      string
	Label          string
	Definition     []byte
	PromptOnUpload bool
	EnforceDefault bool
	JsonSchema     *datatypes.JSON
}

func BuildNamespacesJsonSchema(mns []NamespaceDescriptor) (*structpb.Struct, error) {
	properties := map[string]interface{}{}
	requiredSet := make(map[string]struct{})
	var rootRequired []string

	for _, n := range mns {
		if n.JsonSchema == nil || len(*n.JsonSchema) == 0 {
			continue
		}

		var schema_props map[string]interface{}
		if err := json.Unmarshal([]byte(*n.JsonSchema), &schema_props); err == nil {
			if p, ok := schema_props["properties"]; ok && p != nil {
				properties[n.Namespace] = p
			}
		}
		entry := map[string]interface{}{}
		if p, ok := schema_props["properties"]; ok && p != nil {
			entry["properties"] = p
		}

		if raw, ok := schema_props["required"]; ok && raw != nil {
			arr, ok := raw.([]interface{})
			if ok && len(arr) > 0 {
				if s, ok := arr[0].(string); ok && s != "" {
					schema_props["required"] = []string{s}
					if _, seen := requiredSet[s]; !seen {
						requiredSet[s] = struct{}{}
						rootRequired = append(rootRequired, s)
					}
				}
			}
		}

	}

	reqList := make([]interface{}, 0, len(rootRequired))
	for _, s := range rootRequired {
		reqList = append(reqList, s)
	}
	root := map[string]interface{}{
		"type":       "object",
		"title":      "user-namespaces-schema",
		"properties": properties,
		"required":   reqList,
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
	return NewMetaSchemaFactory(label).BuildMetaSchema(label)
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
