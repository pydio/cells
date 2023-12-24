package storage

import (
	"strings"
)

type postgresHelper struct{}

func (p *postgresHelper) Concat(s ...string) string {
	if len(s) == 1 {
		return s[0]
	}

	return `CONCAT(` + strings.Join(s, ", ") + `)`
}

func (p *postgresHelper) Hash(s ...string) string {
	return `SHA1(` + p.Concat(s...) + `)`
}

func (p *postgresHelper) HashParent(name string, s ...string) string {
	pmpath := `SPLIT_PART(` + p.Concat(s...) + `, '.', level-1)`
	return p.Hash(name, "'__###PARENT_HASH###__'", pmpath)
}
