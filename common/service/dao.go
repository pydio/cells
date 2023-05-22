package service

import (
	"context"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/dao"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

func DAOFromContext[T any](s Service) func(context.Context) T {
	return func(ctx context.Context) T {
		var c dao.DAO

		// Pick the connection
		if cfgFromCtx := servercontext.GetConfig(ctx); cfgFromCtx != nil {
			driver, dsn, _ := config.GetStorageDriver(cfgFromCtx, "storage", s.Name())

			// Now pick the dao
			for _, storage := range s.Options().Storages {
				for _, supportedDriver := range storage.SupportedDrivers {
					if driver == supportedDriver && storage.DAOWrapper != nil && storage.DAOProvider != nil {
						d, _ := storage.DAOProvider(ctx, driver, dsn, storage.Prefix(s.Options()))
						c, _ = storage.DAOWrapper(ctx, d)

						c.Init(ctx, cfgFromCtx.Val())

						UpdateServiceVersion(servicecontext.WithDAO(ctx, c), cfgFromCtx, s.Options())
					}
				}
			}
		}

		if c == nil {
			c = servicecontext.GetDAO(s.Options().Context)
		}

		return c.(T)
	}
}
