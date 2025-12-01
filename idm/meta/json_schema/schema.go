package json_schema

// provides a small dependency wrapper around
// github.com/google/jsonschema-go/jsonschema.

import (
	"encoding/json"
	"reflect"

	"github.com/google/jsonschema-go/jsonschema"
)

// Type aliases
type (
	Schema         = jsonschema.Schema
	Resolved       = jsonschema.Resolved
	ForOptions     = jsonschema.ForOptions
	ResolveOptions = jsonschema.ResolveOptions
	Loader         = jsonschema.Loader
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
