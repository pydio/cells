package plugins

import (
	"context"
	"strings"
)

var (
	initializers        = make(map[string][]func(ctx context.Context))
)

func Register(typ string, y ...func(ctx context.Context)) {
	for _, t := range strings.Split(typ, ",") {
		initializers[t] = append(initializers[t], y...)
	}
}

func Init(ctx context.Context, typ string) {
	for _, init := range initializers[typ] {
		init(ctx)
	}
}
