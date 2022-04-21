package configx

type ref struct {
	V string `json:"$ref"`
}

func Reference(s string) Ref {
	return &ref{
		V: s,
	}
}

func GetReference(i interface{}) (Ref, bool) {
	r, ok := i.(*ref)
	if ok {
		if r.V != "" {
			return r, true
		}
	}

	return nil, false
}

func (r *ref) Get() string {
	return r.V
}

//func (r *ref) MarshalJSON() ([]byte, error) {
//	return json.Marshal(r)
//}
