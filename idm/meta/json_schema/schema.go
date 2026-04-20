package json_schema

// provides a small dependency wrapper around
// github.com/google/jsonschema-go/jsonschema.

import (
	"encoding/json"
	"reflect"

	"github.com/google/jsonschema-go/jsonschema"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
)

// Type aliases
type (
	Schema         = jsonschema.Schema
	Resolved       = jsonschema.Resolved
	ForOptions     = jsonschema.ForOptions
	ResolveOptions = jsonschema.ResolveOptions
	Loader         = jsonschema.Loader
)

const (
	// FormatEmail represents the email format validation
	FormatEmail               = "email"
	FormatDateTime            = "date-time"
	FormatDate                = "date"
	FormatTime                = "time"
	FormatURI                 = "uri"
	FormatURIRef              = "uri-reference"
	FormatUUID                = "uuid"
	FormatHostname            = "hostname"
	FormatIPv4                = "ipv4"
	FormatIPv6                = "ipv6"
	FormatRegex               = "regex"
	FormatIdnEmail            = "idn-email"
	FormatIdnHostname         = "idn-hostname"
	FormatIRI                 = "iri"
	FormatIRIRef              = "iri-reference"
	FormatURITemplate         = "uri-template"
	FormatJSONPointer         = "json-pointer"
	FormatRelativeJSONPointer = "relative-json-pointer"
	FormatDuration            = "duration"
)

// ---------------------------------------------------------------------------
// Schema inference helpers
// ---------------------------------------------------------------------------

// Infer returns a *Schema describing the JSONSchema type T.
func Infer[T any](opts *ForOptions) (*Schema, error) {
	return jsonschema.For[T](opts)
}

// InferType returns a *Schema for an arbitrary reflect.Type.
func InferType(t reflect.Type, opts *ForOptions) (*Schema, error) {
	return jsonschema.ForType(t, opts)
}

// InferBytes infers a schema for T and marshals it to JSON bytes.
func InferBytes[T any](opts *ForOptions) ([]byte, error) {
	s, err := Infer[T](opts)
	if err != nil {
		return nil, err
	}
	return json.Marshal(s)
}

// FromJSON parses a JSON Schema document into a *Schema.
func FromJSON(data []byte) (*Schema, error) {
	var s Schema
	if err := json.Unmarshal(data, &s); err != nil {
		return nil, err
	}
	return &s, nil
}

// Array of strings
func ArrayOfStrings(items []string) *Schema {
	return &Schema{
		Type:        "array",
		Items:       &Schema{Type: "string"},
		UniqueItems: true,
	}
}

func ValidateSchemaFromPbStruct(m *structpb.Struct) error {
	if m == nil {
		return nil
	}
	b, err := protojson.Marshal(m)
	if err != nil {
		return err
	}
	return ValidateSchema(b)
}

func ValidateSchema(schemaJSON []byte) error {
	schema, err := FromJSON(schemaJSON)
	if err != nil {
		return err
	}

	if _, err := schema.Resolve(nil); err != nil {
		return err
	}

	var m map[string]any
	if err := json.Unmarshal(schemaJSON, &m); err != nil {
		return err
	}

	isObjectLike := false
	if t, ok := m["type"]; ok {
		if ts, ok := t.(string); ok && ts == "object" {
			isObjectLike = true
		}
	}
	if _, ok := m["required"]; ok {
		isObjectLike = true
	}
	if _, ok := m["additionalProperties"]; ok {
		isObjectLike = true
	}

	// If schema appears to describe an object, ensure 'properties' exists and is non-empty.
	if isObjectLike {
		props, ok := m["properties"]
		if !ok {
			return nil
		}
		if pm, ok := props.(map[string]any); !ok || len(pm) == 0 {
			return nil
		}
	}

	return nil
}

func IsUUID(id string) bool {
	schema := &Schema{
		Type:   "string",
		Format: FormatUUID,
	}
	resolved, err := schema.Resolve(nil)
	if err != nil {
		return false
	}
	return resolved.Validate(id) == nil
}
