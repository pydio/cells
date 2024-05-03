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

package runtimecontext

import (
	"context"
)

type contextType int

const (
	operationIDKey contextType = iota
	operationLabelKey

	ContextMetaJobUuid        = "X-Pydio-Job-Uuid"
	ContextMetaTaskUuid       = "X-Pydio-Task-Uuid"
	ContextMetaTaskActionPath = "X-Pydio-Task-Action-Path"
	ContextMetaTaskActionTags = "X-Pydio-Task-Action-Tags"
)

type serviceNameKey struct{}

var (
	ServiceNameKey = serviceNameKey{}
)

func init() {
	RegisterGenericInjector[string](ServiceNameKey)
}

// WithServiceName returns a context which knows its service name
func WithServiceName(ctx context.Context, serviceName string) context.Context {
	return context.WithValue(ctx, ServiceNameKey, serviceName)
}

// GetServiceName returns the service name associated to this context
func GetServiceName(ctx context.Context) string {
	if ctx == nil {
		return ""
	}

	v := ctx.Value(ServiceNameKey)
	if v == nil {
		return ""
	}

	name, ok := ctx.Value(ServiceNameKey).(string)
	if !ok {
		return ""
	}

	return name
}

// WithOperationID returns a context which knows its session ID
func WithOperationID(ctx context.Context, operationID string, operationLabel ...string) context.Context {
	c := context.WithValue(ctx, operationIDKey, operationID)
	if len(operationLabel) > 0 {
		c = context.WithValue(c, operationLabelKey, operationLabel[0])
	}
	return c
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
