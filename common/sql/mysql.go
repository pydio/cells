package sql

import (
	"strings"
)

type mysql struct{}

func (m *mysql) Concat(s ...string) string {
	if len(s) == 1 {
		return s[0]
	}

	return `CONCAT(` + strings.Join(s, ", ") + `)`
}

func (m *mysql) Hash(s ...string) string {
	return `SHA1(` + m.Concat(s...) + `)`
}

func (m *mysql) HashParent(name string, s ...string) string {
	pmpath := `SUBSTRING_INDEX(` + m.Concat(s...) + `, '.', level-1)`
	return m.Hash(name, "__###PARENT_HASH###__", pmpath)
}
