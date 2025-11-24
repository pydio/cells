package json_schema

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/jsonschema-go/jsonschema"
	"google.golang.org/protobuf/types/known/structpb"
)

func GetFieldSchema(ctx context.Context, ft string) (schema *structpb.Struct) {
	return BuildJsonSchema(ft)
}

func toProtoStruct(v interface{}) *structpb.Struct {
	b, _ := json.Marshal(v)

	var normalized map[string]interface{}
	json.Unmarshal(b, &normalized)
	s, _ := structpb.NewStruct(normalized)
	return s
}

func marshalSchema(s *jsonschema.Schema) map[string]interface{} {
	b, _ := s.MarshalJSON()
	var m map[string]interface{}
	_ = json.Unmarshal(b, &m)
	return m
}

func BuildJsonSchema(label string) *structpb.Struct {
	root := func(id, title string, propName string, propSchema map[string]interface{}) *structpb.Struct {
		s := map[string]interface{}{
			"$id":     fmt.Sprintf("https://pydio.com/%s.schema.json", id),
			"$schema": "https://json-schema.org/draft/2020-12/schema",
			"title":   title,
			"type":    "object",
			"properties": map[string]interface{}{
				propName: propSchema,
			},
		}
		return toProtoStruct(s)
	}

	switch label {
	case "Boolean", "boolean":
		s, _ := jsonschema.For[bool](nil)
		return root("boolean", "Boolean", "boolean", marshalSchema(s))

	case "Long Text", "longText":
		s, _ := jsonschema.For[string](nil)
		prop := marshalSchema(s)
		prop["minLength"] = 0
		prop["maxLength"] = 5000
		return root("longText", "Long Text", "longText", prop)

	case "Text", "string":
		s, _ := jsonschema.For[string](nil)
		prop := marshalSchema(s)
		prop["minLength"] = 0
		prop["maxLength"] = 255
		return root("text", "Text", "text", prop)

	case "Number", "number":
		s, _ := jsonschema.For[float64](nil)
		prop := marshalSchema(s)
		prop["minimum"] = 0
		return root("number", "Number", "number", prop)

	case "Date Or Time", "dateTime":
		s, _ := jsonschema.For[string](nil)
		prop := marshalSchema(s)
		prop["format"] = "date-time"
		return root("dateTime", "Date Or Time", "dateTime", prop)

	case "Colors Labels", "colorLabels":
		vals := []string{"Low", "Todo", "Personal", "Work", "Important"}
		oneOf := make([]map[string]interface{}, 0, len(vals))
		for _, v := range vals {
			oneOf = append(oneOf, map[string]interface{}{"const": v, "title": v, "type": "string"})
		}
		items := map[string]interface{}{"type": "string", "oneOf": oneOf}
		prop := map[string]interface{}{"type": "array", "title": "A set of color labels", "items": items, "uniqueItems": true}
		return root("colorLabels", "Colors Labels", "colorLabels", prop)

	case "Tags", "tags":
		items, _ := jsonschema.For[[]string](nil)
		return root("tags", "Tags", "tags", marshalSchema(items))

	case "Tags Values", "tagsvalues": //TODO TBD
		vals := []string{"t1", "t2", "t3", "t4", "t5"}
		oneOf := make([]map[string]interface{}, 0, len(vals))
		for _, v := range vals {
			oneOf = append(oneOf, map[string]interface{}{"const": v, "title": v, "type": "string"})
		}
		items := map[string]interface{}{"type": "string", "oneOf": oneOf}
		prop := map[string]interface{}{"type": "array", "title": "A list of tag values", "items": items, "uniqueItems": true}
		return root("tagValues", "Tags Values", "tagValues", prop)

	case "Stars Rating", "starsrating":
		s, _ := jsonschema.For[float64](nil)
		prop := marshalSchema(s)
		prop["minimum"] = 1.0
		prop["maximum"] = 5.0
		return root("starsRating", "Stars Rating", "starsRating", prop)

	case "External Url", "externalurl":
		s, _ := jsonschema.For[string](nil)
		prop := marshalSchema(s)
		prop["format"] = "uri"
		return root("externalUrl", "External Url", "externalUrl", prop)

	default:
		switch label {
		case "text", "shortText":
			return BuildJsonSchema("Text")
		case "number":
			return BuildJsonSchema("Number")
		case "boolean":
			return BuildJsonSchema("Boolean")
		case "dateTime", "datetime":
			return BuildJsonSchema("Date Or Time")
		case "tags":
			return BuildJsonSchema("Tags")
		case "externalUrl":
			return BuildJsonSchema("External Url")
		}
		return nil
	}
}
