/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"encoding/json"
	"sync/atomic"

	"github.com/pkg/errors"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/dao"
)

type contextType int

const (
	serviceColorKey contextType = iota
	serviceNameKey
	requestIDKey
	sessionIDKey
	daoKey
	connKey
	configKey
)

var serviceColorCount uint64 = 30

// WithServiceColor returns a context which knows its service assigned color
func WithServiceColor(ctx context.Context, color ...uint64) context.Context {
	if len(color) > 0 {
		return context.WithValue(ctx, serviceColorKey, color[0])
	}

	atomic.AddUint64(&serviceColorCount, 1)
	return context.WithValue(ctx, serviceColorKey, atomic.LoadUint64(&serviceColorCount))
}

// WithServiceName returns a context which knows its service name
func WithServiceName(ctx context.Context, serviceName string) context.Context {
	return context.WithValue(ctx, serviceNameKey, serviceName)
}

// WithRequestID returns a context which knows its request ID
func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, requestIDKey, requestID)
}

// WithSessionID returns a context which knows its session ID
func WithSessionID(ctx context.Context, sessionID string) context.Context {
	return context.WithValue(ctx, sessionIDKey, sessionID)
}

// WithDAO links a dao to the context
func WithDAO(ctx context.Context, dao dao.DAO) context.Context {
	return context.WithValue(ctx, daoKey, dao)
}

// WithConn links a storage connection to the context
func WithConn(ctx context.Context, conn dao.Conn) context.Context {
	return context.WithValue(ctx, connKey, conn)
}

// WithConfig links a config to the context
func WithConfig(ctx context.Context, config config.Map) context.Context {
	return context.WithValue(ctx, configKey, config)
}

// GetServiceColor returns the service name associated to this context
func GetServiceColor(ctx context.Context) uint64 {
	if color, ok := ctx.Value(serviceColorKey).(uint64); ok {
		return color
	}
	return 0
}

// GetServiceName returns the service name associated to this context
func GetServiceName(ctx context.Context) string {
	if name, ok := ctx.Value(serviceNameKey).(string); ok {
		return name
	}
	return ""
}

// GetRequestID returns the session id associated to this context
func GetRequestID(ctx context.Context) string {
	if id, ok := ctx.Value(requestIDKey).(string); ok {
		return id
	}
	return ""
}

// GetSessionID returns the session id associated to this context
func GetSessionID(ctx context.Context) string {
	if id, ok := ctx.Value(sessionIDKey).(string); ok {
		return id
	}
	return ""
}

// GetDAO returns the dao from the context in argument
func GetDAO(ctx context.Context) dao.DAO {
	if db, ok := ctx.Value(daoKey).(dao.DAO); ok {
		return db
	}

	return nil
}

// GetConfig returns the config from the context in argument
func GetConfig(ctx context.Context) config.Map {
	if conf, ok := ctx.Value(configKey).(config.Map); ok {
		return conf
	}
	return nil
}

// GetConfig already unmarshalled in a specific format
func ScanConfig(ctx context.Context, target interface{}) error {
	conf := GetConfig(ctx)
	if conf == nil {
		return errors.New("cannot find config in this context")
	}
	marsh, _ := json.Marshal(conf)
	return json.Unmarshal(marsh, &target)
}
