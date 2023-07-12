package service

import (
	"context"

	"github.com/pydio/cells/v4/common/config"
	servercontext "github.com/pydio/cells/v4/common/server/context"
)

func (s *service) config(ctx context.Context) config.Store {
	return servercontext.GetConfig(ctx)
}
