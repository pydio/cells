/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package service

import (
	"context"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/dao"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

type StorageOptions struct {
	StorageKey       string
	SupportedDrivers []string
	DefaultDriver    dao.DriverProviderFunc
	Migrator         dao.MigratorFunc
	prefix           interface{}
}

func (o *StorageOptions) Prefix(options *ServiceOptions) string {
	val := ""
	if o.prefix == nil {
		return val
	}
	switch v := o.prefix.(type) {
	case func(*ServiceOptions) string:
		val = v(options)
	case func(*StorageOptions) string:
		val = v(o)
	case string:
		val = v
	}
	return val
}

type StorageOption func(options *StorageOptions)

// WithStoragePrefix sets a prefix to be used differently depending on driver name
func WithStoragePrefix(i interface{}) StorageOption {
	return func(options *StorageOptions) {
		options.prefix = i
	}
}

// WithStorageSupport declares wich drivers can be supported by this service
func WithStorageSupport(dd ...string) StorageOption {
	return func(options *StorageOptions) {
		options.SupportedDrivers = append(options.SupportedDrivers, dd...)
	}
}

// WithStorageDefaultDriver provides a default driver/dsn couple if not set in the configuration
func WithStorageDefaultDriver(d func() (string, string)) StorageOption {
	return func(options *StorageOptions) {
		options.DefaultDriver = d
	}
}

// WithStorageMigrator provides a Migrate function from one DAO to another
func WithStorageMigrator(d dao.MigratorFunc) StorageOption {
	return func(options *StorageOptions) {
		options.Migrator = d
	}
}

func daoFromOptions(o *ServiceOptions, fd dao.DaoWrapperFunc, indexer bool, opts *StorageOptions) (dao.DAO, error) {
	prefix := opts.Prefix(o)

	cfgKey := "storage"
	if indexer {
		cfgKey = "indexer"
	}
	driver, dsn, defined := config.GetStorageDriver(cfgKey, o.Name)
	if !defined && opts.DefaultDriver != nil {
		driver, dsn = opts.DefaultDriver()
	}

	var c dao.DAO
	var e error
	cfg := config.Get("services", o.Name)

	if indexer {
		c, e = dao.InitIndexer(o.Context, driver, dsn, prefix, fd, cfg)
	} else {
		c, e = dao.InitDAO(o.Context, driver, dsn, prefix, fd, cfg)
	}
	if e != nil {
		return nil, e
	}

	if c.LocalAccess() {
		o.Unique = true
	}

	return c, nil

}

// WithStorage adds a storage handler to the current service
func WithStorage(fd dao.DaoWrapperFunc, opts ...StorageOption) ServiceOption {
	return makeStorageServiceOption(false, fd, opts...)
}

// WithIndexer adds an indexer handler to the current service
func WithIndexer(fd dao.DaoWrapperFunc, opts ...StorageOption) ServiceOption {
	return makeStorageServiceOption(true, fd, opts...)
}

func makeStorageServiceOption(indexer bool, fd dao.DaoWrapperFunc, opts ...StorageOption) ServiceOption {
	return func(o *ServiceOptions) {
		storageKey := "storage"
		if indexer {
			storageKey = "indexer"
		}
		sOpts := &StorageOptions{
			StorageKey: storageKey,
		}
		for _, op := range opts {
			op(sOpts)
		}
		o.Storages = append(o.Storages, sOpts)
		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			d, err := daoFromOptions(o, fd, indexer, sOpts)
			if err != nil {
				return err
			}
			if indexer {
				ctx = servicecontext.WithIndexer(ctx, d)
			} else {
				ctx = servicecontext.WithDAO(ctx, d)
			}
			o.Context = ctx
			return nil
		})

	}
}
