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
	"github.com/pydio/cells/v4/common/dao"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type StorageOptions struct {
	Key              string
	SupportedDrivers []string
	Handler          any
	Default          bool
	DefaultDriver    dao.DriverProviderFunc
	Migrator         dao.MigratorFunc
	prefix           interface{}

	jsonMeta string
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

func (o *StorageOptions) ToMeta() string {
	if o.jsonMeta == "" {
		m := make(map[string]interface{})
		m["supportedDrivers"] = o.SupportedDrivers
		if o.Migrator != nil {
			m["hasMigrator"] = true
		}
		d, _ := json.Marshal(m)
		o.jsonMeta = string(d)
	}
	return o.jsonMeta
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

func Default(b bool) StorageOption {
	return func(options *StorageOptions) {
		options.Default = true
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

//func daoFromOptions(ctx context.Context, o *ServiceOptions, fd dao.DaoWrapperFunc, indexer bool, opts *StorageOptions) (dao.DAO, error) {
//	prefix := opts.Prefix(o)
//
//	cfgKey := "storage"
//	if indexer {
//		cfgKey = "indexer"
//	}
//	driver, dsn, defined := config.GetStorageDriver(cfgKey, o.Name)
//	if !defined && opts.DefaultDriver != nil {
//		driver, dsn = opts.DefaultDriver()
//	}
//
//	var c dao.DAO
//	var e error
//	cfg := config.Get("services", o.Name)
//
//	// Setting a lock on the registry in case of multiple services starting up at the same time
//	reg := servicecontext.GetRegistry(ctx)
//	if lock := reg.NewLocker("dao-init-" + o.Name); lock != nil {
//		lock.Lock()
//		defer lock.Unlock()
//	}
//
//	if indexer {
//		c, e = dao.InitIndexer(ctx, driver, dsn, prefix, fd, cfg)
//	} else {
//		c, e = dao.InitDAO(ctx, driver, dsn, prefix, fd, cfg)
//	}
//
//	if e != nil {
//		return nil, errors.Wrap(e, "dao.Initialization "+driver)
//	}
//
//	return c, nil
//}
//
//func isLocalDao(o *ServiceOptions, indexer bool, opts *StorageOptions) bool {
//
//	cfgKey := "storage"
//	if indexer {
//		cfgKey = "indexer"
//	}
//	driver, _, defined := config.GetStorageDriver(cfgKey, o.Name)
//	if !defined && opts.DefaultDriver != nil {
//		driver, _ = opts.DefaultDriver()
//	}
//	s, e := dao.IsShared(driver)
//	if e != nil {
//		if driver != "" {
//			fmt.Println("cannot check if driver " + driver + " is shared:" + e.Error())
//		}
//		return false
//	}
//	return !s
//}

func WithDefaultStorageConn(name string) ServiceOption {
	return func(o *ServiceOptions) {
		o.DefaultStorageConn = name
	}
}

// WithStorage adds a storage handler to the current service
func WithStorage(name string, fd any, opts ...StorageOption) ServiceOption {
	return makeStorageServiceOption(name, fd, opts...)
}

// WithIndexer adds an indexer handler to the current service
//func WithIndexer(name string, fd dao.DaoWrapperFunc, opts ...StorageOption) ServiceOption {
//	return makeStorageServiceOption(fd, opts...)
//}

func makeStorageServiceOption(name string, fd any, opts ...StorageOption) ServiceOption {
	return func(o *ServiceOptions) {
		sOpts := &StorageOptions{
			Key:     name,
			Handler: fd,
		}
		for _, op := range opts {
			op(sOpts)
		}
		o.Storages = append(o.Storages, sOpts)

		// Pre-check DAO config and add flag Unique if necessary
		//if isLocalDao(o, indexer, sOpts) {
		//	o.Unique = true
		//	o.BeforeStop = append(o.BeforeStop, func(ctx context.Context) error {
		//		var stopDao dao.DAO
		//		if indexer {
		//			stopDao = servicecontext.GetIndexer(ctx)
		//		} else {
		//			stopDao = servicecontext.GetDAO(ctx)
		//		}
		//		if stopDao == nil {
		//			return nil
		//		}
		//		log.Logger(ctx).Info("Closing DAO connection now")
		//		return stopDao.CloseConn(ctx)
		//	})
		//}

		//o.BeforeRequest = append(o.BeforeRequest, func(ctx context.Context) (context.Context, error) {
		//
		//	for _, storage := range o.Storages {
		//		store := storage.S
		//	}
		//	d, err := daoFromOptions(ctx, o, fd, indexer, sOpts)
		//	if err != nil {
		//		return ctx, err
		//	}
		//	if indexer {
		//		ctx = servicecontext.WithIndexer(ctx, d)
		//	} else {
		//		ctx = servicecontext.WithDAO(ctx, d)
		//	}
		//
		//	// Now register DAO
		//	reg := servicecontext.GetRegistry(ctx)
		//	if reg == nil {
		//		return ctx, nil
		//	}
		//	var regItem registry.Dao
		//	if !d.As(&regItem) {
		//		return ctx, nil
		//	}
		//
		//	// Build Edge Metadata
		//	mm := map[string]string{
		//		"SupportedDrivers": strings.Join(sOpts.SupportedDrivers, ","),
		//	}
		//	prefix := sOpts.Prefix(o)
		//	if prefix != "" {
		//		mm["Prefix"] = prefix
		//	}
		//	if sOpts.Migrator != nil {
		//		mm["SupportedMigration"] = "true"
		//	}
		//	options := []registry.RegisterOption{
		//		registry.WithEdgeTo(o.ID, "DAO", mm),
		//	}
		//	var regStatus registry.StatusReporter
		//	if d.As(&regStatus) {
		//		options = append(options, registry.WithWatch(regStatus))
		//	}
		//	if er := reg.Register(regItem, options...); er != nil {
		//		log.Logger(ctx).Error(" -- Cannot register DAO: "+er.Error(), zap.Error(er))
		//	}
		//
		//	return ctx, nil
		//})
	}
}
