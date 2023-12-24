package dbresolver

import (
	"math/rand"

	"gorm.io/gorm"
)

type Policy interface {
	Resolve([]gorm.ConnPool) gorm.ConnPool
}

type RandomPolicy struct {
}

func (RandomPolicy) Resolve(connPools []gorm.ConnPool) gorm.ConnPool {
	return connPools[rand.Intn(len(connPools))]
}
