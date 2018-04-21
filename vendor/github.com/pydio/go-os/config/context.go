package config

import (
	"golang.org/x/net/context"
)

type configKey struct{}

func FromContext(ctx context.Context) (Config, bool) {
	c, ok := ctx.Value(configKey{}).(Config)
	return c, ok
}

func NewContext(ctx context.Context, c Config) context.Context {
	return context.WithValue(ctx, configKey{}, c)
}
