package loadsx

import (
	"bytes"
	"encoding/gob"
	"fmt"

	"github.com/go-openapi/analysis"
	"github.com/go-openapi/loads"
	"github.com/go-openapi/spec"
	"github.com/go-openapi/swag"

	json "github.com/pydio/cells/x/jsonx"
)

type Document interface {
	Spec() *spec.Swagger
}

// Analyzed creates a new analyzed spec document
func Analyzed(data json.RawMessage, version string) (*Document, error) {
	if version == "" {
		version = "2.0"
	}
	if version != "2.0" {
		return nil, fmt.Errorf("spec version %q is not supported", version)
	}

	raw := data
	trimmed := bytes.TrimSpace(data)
	if len(trimmed) > 0 {
		if trimmed[0] != '{' && trimmed[0] != '[' {
			yml, err := swag.BytesToYAMLDoc(trimmed)
			if err != nil {
				return nil, fmt.Errorf("analyzed: %v", err)
			}
			d, err := swag.YAMLToJSON(yml)
			if err != nil {
				return nil, fmt.Errorf("analyzed: %v", err)
			}
			raw = d
		}
	}

	swspec := new(spec.Swagger)
	if err := json.Unmarshal(raw, swspec); err != nil {
		return nil, err
	}

	origsqspec, err := cloneSpec(swspec)
	if err != nil {
		return nil, err
	}

	d := &loads.Document{
		Analyzer: analysis.New(swspec),
		schema:   spec.MustLoadSwagger20Schema(),
		spec:     swspec,
		raw:      raw,
		origSpec: origsqspec,
	}
	return d, nil
}

func cloneSpec(src *spec.Swagger) (*spec.Swagger, error) {
	var b bytes.Buffer
	if err := gob.NewEncoder(&b).Encode(src); err != nil {
		return nil, err
	}

	var dst spec.Swagger
	if err := gob.NewDecoder(&b).Decode(&dst); err != nil {
		return nil, err
	}
	return &dst, nil
}
