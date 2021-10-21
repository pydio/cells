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

	"github.com/pkg/errors"

	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/x/configx"
)

type contextType int

const (
	serviceNameKey contextType = iota
	operationIDKey
	operationLabelKey
	daoKey
	configKey

	ContextMetaJobUuid        = "X-Pydio-Job-Uuid"
	ContextMetaTaskUuid       = "X-Pydio-Task-Uuid"
	ContextMetaTaskActionPath = "X-Pydio-Task-ActionPath"
)

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

// WithConfig links a config to the context
func WithConfig(ctx context.Context, config configx.Values) context.Context {
	return context.WithValue(ctx, configKey, config)
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

// GetConfig returns the config from the context in argument
func GetConfig(ctx context.Context) configx.Values {
	if conf, ok := ctx.Value(configKey).(configx.Values); ok {
		return conf
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
