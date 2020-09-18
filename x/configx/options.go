package configx

type Unmarshaler interface {
	Unmarshal([]byte, interface{}) error
}

type Option func(*Options)

type Options struct {
	Unmarshaler
}
