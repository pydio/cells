package configx

import (
	"encoding/json"
)

type ref struct {
	v map[string]interface{}
}

func Reference(s string) Ref {
	return &ref{
		v: map[string]interface{}{
			"$ref": s,
		},
	}
}

func (r *ref) Get() string {
	return r.v["$ref"].(string)
}

func (r *ref) MarshalJSON() ([]byte, error) {
	return json.Marshal(r.v)
}
