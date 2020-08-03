package configx

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
