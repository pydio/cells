package common

type Scanner interface {
	Scan(val interface{}) error
}

type XMLSerializableForm interface {
	Serialize(languages ...string) interface{}
}
