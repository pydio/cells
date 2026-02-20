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
		props["default"] = withStringType("Default Value")
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "url":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)

	case "tag_cloud":
		props["required"] = withBooleanType()
		return toProtoStruct(f.root)
	case "integer":
		props["minimum"] = withNumberType("Minimum Value")
		props["maximum"] = withNumberType("Maximum Value")
		props["default"] = withNumberType("Default Value")
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

	case "types":
		return toProtoStruct(map[string]interface{}{
			"string":        "Text",
			"textarea":      "Long Text",
			"integer":       "Number",
			"boolean":       "Boolean",
			"date":          "Date",
			"choice":        "Selection",
			"tags":          "Extensible Tags",
			"tag_cloud":     "Tag Cloud",
			"stars_rate":    "Stars Rating",
			"css_label":     "Color Labels",
			"json":          "JSON",
			"url":           "External URL",
			"auto_complete": "Auto Complete",
		})

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
			"$id":        fmt.Sprintf("https://pydio.com/%s", label),
			"type":       "object",
			"properties": map[string]interface{}{},
			// "additionalProperties": false,
			"required": []interface{}{},
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

func (f *JSONSchemaFactory) BuildJsonSchema(label string, name string, format string) ([]byte, error) {
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
		props[t] = withDateTimeSchema(format)

	case "url":
		var t = fmt.Sprintf("%s-url", usermeta)
		if name != "" {
			t = fmt.Sprintf("usermeta-%s", name)
		}
		f.root["title"] = t
		props[t] = withUrlSchema()

	case "choice":
		var t = fmt.Sprintf("%s-tags", usermeta)
		if name != "" {
			t = name
		}
		f.root["title"] = t
		props[t] = withArraySchema()
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
	case "auto_complete":
		var t = fmt.Sprintf("%s-tags", usermeta)
		if name != "" {
			t = name
		}
		f.root["title"] = t
		props[t] = withArraySchema()
	// TODO Switching tag cloud schema to a string to solve input issues in the frontend
	// Ideally it maybe a schema with anyOf an array of strings and a string to allow new inputs
	case "tag_cloud":
		var t = fmt.Sprintf("%s-tags", usermeta)
		if name != "" {
			t = name
		}
		f.root["title"] = t
		props[t] = withStringArraySchema()

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

func GetJsonSchema(label string, format string) ([]byte, error) {
	return NewJSONSchemaFactory(label).BuildJsonSchema(label, "", format)
}

func GetJsonSchemaSample(label string, name string, format string) (*structpb.Struct, error) {
	byte_schema, err := NewJSONSchemaFactory(label).BuildJsonSchema(label, name, format)
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
	// Create a slice type for string enums
	s := ArrayOfStrings([]string{})
	prop := marshalSchema(s)
	// Add additional array-specific constraints
	return prop
}

func withBooleanSchema() map[string]interface{} {
	s, _ := Infer[bool](nil)
	return marshalSchema(s)
}

func withDateTimeSchema(format string) map[string]interface{} {
	s, _ := Infer[string](nil)
	prop := marshalSchema(s)
	if format == "date" {
		prop["format"] = FormatDate
		return prop
	} else if format == "datetime" {
		prop["format"] = FormatDateTime
		return prop
	} else if format == "time" {
		prop["format"] = FormatTime
		return prop
	}

	prop["format"] = FormatDateTime
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

func withStringArraySchema() map[string]interface{} {
	s := &Schema{
		OneOf: []*Schema{
			{Type: "string"},
			{
				Type:  "array",
				Items: &Schema{Type: "string"},
			},
		},
	}
	return marshalSchema(s)
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
