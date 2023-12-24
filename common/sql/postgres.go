package sql

import (
	"strings"
)

type postgres struct{}

func (p *postgres) Concat(s ...string) string {
	if len(s) == 1 {
		return s[0]
	}

	return `CONCAT(` + strings.Join(s, ", ") + `)`
}

func (p *postgres) Hash(s ...string) string {
	return `SHA1(` + p.Concat(s...) + `)`
}

func (p *postgres) HashParent(name string, s ...string) string {
	pmpath := `SPLIT_PART(` + p.Concat(s...) + `, '.', level-1)`
	return p.Hash(name, "'__###PARENT_HASH###__'", pmpath)
}
