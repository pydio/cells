package manager

import "context"

type contextType int

const (
	clientManagerKey contextType = iota
)

func With(ctx context.Context, m Manager) context.Context {
	return context.WithValue(ctx, clientManagerKey, m)
}

func Get(ctx context.Context) (Manager, bool) {
	m, ok := ctx.Value(clientManagerKey).(Manager)
	return m, ok
}
