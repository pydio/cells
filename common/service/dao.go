package service

import (
	"context"

	"github.com/pydio/cells/v4/common/crypto"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

//type ServiceDAOProvider[T dao.DAO] func(ctx context.Context) T
//
//type ServiceDAO[T dao.DAO] interface {
//	Service
//	DAO(ctx context.Context) T
//}
//
//type serviceDAO[T dao.DAO] struct {
//	Service
//
//	daos []T
//}

//func (s *serviceDAO[T]) DAO(ctx context.Context) T {
//	var t T
//	c := s.Service.config(ctx)
//	if c == nil {
//		return t
//	}
//
//	driver, dsn, _ := config.GetStorageDriver(c, "storage", s.Name())
//
//	// Now pick the dao
//	for _, storage := range s.Options().Storages {
//		for _, supportedDriver := range storage.SupportedDrivers {
//			if driver == supportedDriver {
//				found := false
//				// Check if we already have it
//				for _, dao := range s.daos {
//					if dao.Driver() == driver && dao.DSN() == dsn && dao.Prefix() == storage.prefix {
//						t = dao
//						found = true
//					}
//				}
//
//				if !found && storage.DAOWrapper != nil && storage.DAOProvider != nil {
//					dp, _ := storage.DAOProvider(ctx, driver, dsn, storage.Prefix(s.Options()))
//					dw, _ := storage.DAOWrapper(ctx, dp)
//
//					t = dw.(T)
//
//					dw.Init(ctx, c.Val())
//
//					versionStore, err := config.OpenStore(ctx, openurl.DSNToURL(driver, dsn, "dao_versions").String())
//					if err != nil {
//						fmt.Println("I have an error !! ", err)
//					}
//					if versionStore == nil {
//						fmt.Println("It is empty but I don't know why ", driver, dsn)
//					}
//
//					UpdateServiceVersion(servicecontext.WithDAO(ctx, dw), versionStore, s.Options())
//
//					s.daos = append(s.daos, t)
//				}
//			}
//		}
//	}
//
//	return t
//}

//func WithDAO[T dao.DAO](s Service) ServiceDAO[T] {
//	return &serviceDAO[T]{Service: s}
//}

//	func DAOProvider[T dao.DAO](s Service) ServiceDAOProvider[T] {
//		return (&serviceDAO[T]{Service: s}).DAO
//	}
//
// type DAOProviderFunc[T dao.DAO] func(context.Context) T
//
//	func DAOFromContext[T dao.DAO](ctx context.Context) T {
//		c := servicecontext.GetDAO(ctx)
//
//		return c.(T)
//	}
func KeyringFromContext(ctx context.Context) crypto.Keyring {
	return servicecontext.GetKeyring(ctx)
}
