package sql

import(
	"strings"
)

type mysql struct {}

func (m *mysql) Concat(s ...string) string {
	return `CONCAT(` + strings.Join(s, ", ") + `)`
}