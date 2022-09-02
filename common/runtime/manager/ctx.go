package manager

import (
	"context"
	"github.com/pydio/cells/v4/common"
)

func With(ctx context.Context, m Manager) context.Context {
	return context.WithValue(ctx, common.CtxManagerKey, m)
}

func Get(ctx context.Context) (Manager, bool) {
	m, ok := ctx.Value(common.CtxManagerKey).(Manager)
	return m, ok
}
