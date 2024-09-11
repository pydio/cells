package configx

type Ref struct {
	Ref string `json:"$ref"`
}

func Reference(ref string) *Ref {
	return &Ref{Ref: ref}
}
