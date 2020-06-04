package sql

import (
	"strings"
)

type sqlite struct{}

func (*sqlite) Concat(s ...string) string {
	return strings.Join(s, " || ")
}
