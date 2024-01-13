package storage

import "context"

type ProviderFunc func() Storage

type Provider interface {
	Provide(conn any) ProviderFunc
}

type Storage interface {
	Provides(conn any) bool
	Register(conn any, tenant string, service string)
	Get(ctx context.Context, out interface{}) bool
}

var storages []Storage

func Provides(conn any) bool {
	for _, storage := range storages {
		if storage.Provides(conn) {
			return true
		}
	}

	return false
}

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
