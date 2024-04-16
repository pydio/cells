package storage

import (
	"context"

	"github.com/pydio/cells/v4/common/registry"
)

type ProviderFunc func() Storage

type Provider interface {
	Provide(conn any) ProviderFunc
}

type Storage interface {
	GetConn(str string) (Conn, error)
	Provides(conn any) bool
	Register(conn any, tenant string, service string)
	Get(ctx context.Context, out interface{}) bool
}

type Conn interface {
	registry.Item
	Driver() string
	DSN() string
}

var storages []Storage

func Register(conn any, tenant string, service string) {
	for _, storage := range storages {
		if storage.Provides(conn) {
			storage.Register(conn, tenant, service)
		}
	}
}

func Get(ctx context.Context, out interface{}) bool {
	for _, store := range storages {
		if store.Get(ctx, out) {
			return true
		}
	}

	return false
}
