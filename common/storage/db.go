package storage

import (
	"context"

	"github.com/pydio/cells/v4/common/registry"
)

type Storage interface {
	Get(ctx context.Context, out interface{}) (provides bool, er error)
	CloseConns(ctx context.Context, clean ...bool) (er error)
}

type Conn interface {
	registry.Item
	Driver() string
	DSN() string
}

var storages []Storage

func Get(ctx context.Context, out interface{}) (provides bool, er error) {
	for _, store := range storages {
		if ok, er := store.Get(ctx, out); ok {
			return true, er
		}
	}

	return false, nil
}
