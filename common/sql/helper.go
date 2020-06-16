package sql

import "fmt"

type Helper interface {
	Concat(...string) string
	Hash(...string) string
}

func newHelper(d string) (Helper, error) {
	switch d {
	case "mysql":
		return new(mysql), nil
	case "sqlite3":
		return new(sqlite), nil
	default:
		return nil, fmt.Errorf("wrong driver")
	}
}
