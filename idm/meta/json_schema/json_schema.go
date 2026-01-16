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
		props["minLength"] = withNumberType("Minimum Length")
		props["maxLength"] = withNumberType("Maximum Length")
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "url":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "integer":
		props["minimum"] = withNumberType("Minimum Value")
		props["maximum"] = withNumberType("Maximum Value")
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "array":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)
	case "boolean":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "date", "datetime":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "choice":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)
	case "stars_rate":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)
	case "css_label":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)
	case "tags":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)
	case "json":
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

		// Check if properties field exists and is not nil
		propsRaw, ok := schema_props["properties"]
		if !ok || propsRaw == nil {
			continue
		}

		props, ok := propsRaw.(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("namespace %s: properties field is not a map", n.Namespace)
		}

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
		usermeta = name
	}

	switch label {
	case "boolean":
		var t = fmt.Sprintf("%s-boolean", usermeta)
		f.root["title"] = t
		if name != "" {
			t = name
		}
		props[t] = withBooleanSchema()

	case "textarea":
		var t = fmt.Sprintf("%s-long-text", usermeta)
		if name != "" {
			t = name
		}
		f.root["title"] = t
		props[t] = withStringSchema()

	case "string":
		var t = fmt.Sprintf("%s-text", usermeta)
		if name != "" {
			t = name
		}
		f.root["title"] = t
		props[t] = withStringSchema()

	case "integer":
		var t = fmt.Sprintf("%s-number", usermeta)
		if name != "" {
			t = name
		}
		f.root["title"] = t
		props[t] = withNumberSchema()

	case "date", "datetime":
		var t = fmt.Sprintf("%s-datetime", usermeta)
		if name != "" {
			t = name
		}
		f.root["title"] = t
		props[t] = withDateTimeSchema()

	case "url":
		var t = fmt.Sprintf("%s-url", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withUrlSchema()

	case "choice":
		var t = fmt.Sprintf("%s-choice", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withStringSchema()
	case "stars_rate":
		var t = fmt.Sprintf("%s-stars_rate", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withNumberSchema()
	case "css_label":
		var t = fmt.Sprintf("%s-css_label", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withStringSchema()
	case "tags":
		var t = fmt.Sprintf("%s-tags", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withStringSchema()
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
			"title":     "minimum length",
		}
	}
	return map[string]interface{}{
		"minimum": min,
		"title":   "minimum",
	}
}

func withMax(max int, t string) map[string]interface{} {
	if t == "string" {
		return map[string]interface{}{
			"maxLength": max,
			"title":     "maximum length",
		}
	}
	return map[string]interface{}{
		"maximum": max,
		"title":   "maximum",
	}
}

func withStringSchema() map[string]interface{} {
	s, _ := Infer[string](nil)
	prop := marshalSchema(s)
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

func withUrlSchema() map[string]interface{} {
	s, _ := Infer[string](nil)
	prop := marshalSchema(s)
	prop["format"] = "uri"
	return prop
}

func withObjectSchema() map[string]interface{} {
	s, _ := Infer[map[string]interface{}](nil)
	prop := marshalSchema(s)
	return prop
}

func withArraySchema() map[string]interface{} {
	s, _ := Infer[[]interface{}](nil)
	prop := marshalSchema(s)
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

func withNumberType(title string) map[string]interface{} {
	return map[string]interface{}{
		"type":  "number",
		"title": title,
	}
}

func withStringType(title string) map[string]interface{} {
	return map[string]interface{}{
		"type":  "string",
		"title": title,
	}
}

func withBooleanType() map[string]interface{} {
	return map[string]interface{}{
		"type":  "boolean",
		"title": "Required",
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
