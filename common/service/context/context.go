/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

// Package servicecontext performs context values read/write, generally through server or client wrappers
package servicecontext

import (
	"context"
	"github.com/pydio/cells/v4/common/runtime"

	"github.com/pkg/errors"

	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type contextType int

const (
	serviceNameKey contextType = iota
	operationIDKey
	operationLabelKey
	daoKey
	indexerKey
	configKey
	keyringKey
	loggerKey
	brokerKey
	registryKey
	serversKey

	ContextMetaJobUuid        = "X-Pydio-Job-Uuid"
	ContextMetaTaskUuid       = "X-Pydio-Task-Uuid"
	ContextMetaTaskActionPath = "X-Pydio-Task-Action-Path"
)

func init() {
	runtime.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		if s := GetServiceName(parent); s != "" {
			ctx = WithServiceName(ctx, s)
		}
		return WithRegistry(ctx, GetRegistry(parent))
	})
}

// WithServiceName returns a context which knows its service name
func WithServiceName(ctx context.Context, serviceName string) context.Context {
	return context.WithValue(ctx, serviceNameKey, serviceName)
}

// WithOperationID returns a context which knows its session ID
func WithOperationID(ctx context.Context, operationID string, operationLabel ...string) context.Context {
	c := context.WithValue(ctx, operationIDKey, operationID)
	if len(operationLabel) > 0 {
		c = context.WithValue(c, operationLabelKey, operationLabel[0])
	}
	return c
}

// WithDAO links a dao to the context
func WithDAO(ctx context.Context, dao dao.DAO) context.Context {
	return context.WithValue(ctx, daoKey, dao)
}

// WithIndexer links a dao for indexation to the context
func WithIndexer(ctx context.Context, dao dao.DAO) context.Context {
	return context.WithValue(ctx, indexerKey, dao)
}

// WithLogger links a logger to the context
func WithLogger(ctx context.Context, logger interface{}) context.Context {
	return context.WithValue(ctx, loggerKey, logger)
}

// WithConfig links a config to the context
func WithConfig(ctx context.Context, config configx.Values) context.Context {
	return context.WithValue(ctx, configKey, config)
}

func WithKeyring(ctx context.Context, keyring crypto.Keyring) context.Context {
	return context.WithValue(ctx, keyringKey, keyring)
}

// WithBroker links a broker to the context
func WithBroker(ctx context.Context, bkr broker.Broker) context.Context {
	return context.WithValue(ctx, brokerKey, bkr)
}

// WithRegistry links a registry to the context
func WithRegistry(ctx context.Context, reg registry.Registry) context.Context {
	return context.WithValue(ctx, registryKey, reg)
}

// GetServiceName returns the service name associated to this context
func GetServiceName(ctx context.Context) string {
	if name, ok := ctx.Value(serviceNameKey).(string); ok {
		return name
	}
	return ""
}

// GetOperationID returns the session id associated to this context
func GetOperationID(ctx context.Context) (string, string) {
	if id, ok := ctx.Value(operationIDKey).(string); ok {
		var label string
		if l, o := ctx.Value(operationLabelKey).(string); o {
			label = l
		}
		return id, label
	}
	return "", ""
}

// GetDAO returns the dao from the context in argument
func GetDAO(ctx context.Context) dao.DAO {
	if db, ok := ctx.Value(daoKey).(dao.DAO); ok {
		return db
	}
	return nil
}

// GetIndexer returns the dao for indexing from the context in argument
func GetIndexer(ctx context.Context) dao.DAO {
	if db, ok := ctx.Value(indexerKey).(dao.DAO); ok {
		return db
	}
	return nil
}

func GetLogger(ctx context.Context) interface{} {
	return ctx.Value(loggerKey)
}

// GetConfig returns the config from the context in argument
func GetConfig(ctx context.Context) configx.Values {
	if conf, ok := ctx.Value(configKey).(configx.Values); ok {
		return conf
	}
	return nil
}

// GetBroker returns the broker from the context in argument
func GetBroker(ctx context.Context) broker.Broker {
	if conf, ok := ctx.Value(brokerKey).(broker.Broker); ok {
		return conf
	}
	return nil
}

// GetRegistry returns the registry from the context in argument
func GetRegistry(ctx context.Context) registry.Registry {
	if conf, ok := ctx.Value(registryKey).(registry.Registry); ok {
		return conf
	}
	return nil
}

// GetKeyring returns the keyring from the context in argument
func GetKeyring(ctx context.Context) crypto.Keyring {
	if keyring, ok := ctx.Value(keyringKey).(crypto.Keyring); ok {
		return keyring
	}
	return nil
}

// ScanConfig already unmarshalled in a specific format
func ScanConfig(ctx context.Context, target interface{}) error {
	conf := GetConfig(ctx)
	if conf == nil {
		return errors.New("cannot find config in this context")
	}

	return conf.Scan(target)
}
