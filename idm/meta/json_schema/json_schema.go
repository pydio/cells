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
			"$id":        fmt.Sprintf("pydio://schemas/meta-schema/%s", label),
			"type":       "object",
			"properties": map[string]interface{}{},
			"required":   []interface{}{},
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
	case "string", "textarea":
		props["minLength"] = withNumberType()
		props["maxLength"] = withNumberType()
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "integer":
		props["minimum"] = withNumberType()
		props["maximum"] = withNumberType()
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "array":
		props["items"] = map[string]interface{}{
			"type": withBooleanSchema(),
		}
		props["minItems"] = withNumberSchema()
		props["maxItems"] = withNumberSchema()
		props["uniqueItems"] = map[string]interface{}{
			"type": "boolean",
		}
		return toProtoStruct(f.root)
	case "boolean":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)
	case "date", "datetime":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	default:
		return nil
	}
}

type JSONSchemaFactory struct {
	root map[string]interface{}
}

func NewJSONSchemaFactory(label string) *JSONSchemaFactory {
	return &JSONSchemaFactory{
		root: map[string]interface{}{
			"$id":                  fmt.Sprintf("https://pydio.com/%s", label),
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
		err := json.Unmarshal([]byte(*n.JsonSchema), &schema_props)
		if err != nil {
			return nil, err
		}

		props := schema_props["properties"].(map[string]interface{})
		// NOTE: Should it ever happen?? Check the format in ./json_schema_test.go:75
		if len(props) > 1 {
			return nil, fmt.Errorf("namespace property has more than one definition: %s", n.Namespace)
		}

		for _, v := range props {
			properties[n.Namespace] = v
		}

		if raw, ok := schema_props["required"]; ok && raw != nil {
			arr := raw.([]interface{})
			if len(arr) > 0 {
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

func (f *JSONSchemaFactory) BuildJsonSchema(label string, name string) ([]byte, error) {
	props := f.root["properties"].(map[string]interface{})
	var usermeta = "usermeta"
	if name != "" {
		usermeta = fmt.Sprintf("usermeta-%s", name)
	}

	switch label {
	case "boolean":
		var t = fmt.Sprintf("%s-boolean", usermeta)
		f.root["title"] = t
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		props[t] = withBooleanSchema()

	case "textarea":
		var t = fmt.Sprintf("%s-long-text", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withStringSchema()

	case "string":
		var t = fmt.Sprintf("%s-text", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withStringSchema()

	case "integer":
		var t = fmt.Sprintf("%s-number", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withNumberSchema()

	case "date", "datetime":
		var t = fmt.Sprintf("%s-datetime", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withDateTimeSchema()

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
	return NewJSONSchemaFactory(label).BuildJsonSchema(label, "")
}

func GetJsonSchemaSample(label string, name string) (*structpb.Struct, error) {
	byte_schema, err := NewJSONSchemaFactory(label).BuildJsonSchema(label, name)
	if err != nil {
		return nil, err
	}
	var m map[string]interface{}
	if err := json.Unmarshal(byte_schema, &m); err != nil {
		return nil, err
	}
	return toProtoStruct(m), nil
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
	// prop["minLength"] = withMin(0, "string")["minLength"]
	// prop["maxLength"] = withMax(0, "string")["maxLength"]
	// prop["pattern"] = ""
	return prop
}

func withNumberSchema() map[string]interface{} {
	s, _ := Infer[float64](nil)
	prop := marshalSchema(s)
	// prop["minimum"] = withMin(0, "number")["minimum"]
	// prop["maximum"] = withMax(0, "number")["maximum"]
	// prop["format"] = ""
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

func withBooleanType() map[string]interface{} {
	return map[string]interface{}{
		"type": "boolean",
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
