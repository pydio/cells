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

package context_wrapper

import (
	"context"

	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	servicecontext "github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"
)

// RichContext enriches the passed logger with as much info as possible
func RichContext(ctx context.Context, logger *zap.Logger, fields ...zapcore.Field) *zap.Logger {

	if ctx == nil {
		return logger
	}

	// Name Logger
	if serviceName := servicecontext.GetServiceName(ctx); serviceName != "" {
		logger = logger.Named(serviceName)
	}

	// Compute all fields
	if span, ok := servicecontext.SpanFromContext(ctx); ok {
		if len(span.RootParentId) > 0 {
			fields = append(fields, zap.String(common.KeySpanRootUuid, span.RootParentId))
		}
		if len(span.ParentId) > 0 {
			fields = append(fields, zap.String(common.KeySpanParentUuid, span.RootParentId))
		}
		fields = append(fields, zap.String(common.KeySpanUuid, span.SpanId))
	}
	if opId, opLabel := servicecontext.GetOperationID(ctx); opId != "" {
		fields = append(fields, zap.String(common.KeyOperationUuid, opId))
		if opLabel != "" {
			fields = append(fields, zap.String(common.KeyOperationLabel, opLabel))
		}
	}
	if jobId, has := context2.CanonicalMeta(ctx, servicecontext.ContextMetaJobUuid); has {
		fields = append(fields, zap.String(common.KeySchedulerJobId, jobId))
	}
	if taskUuid, has := context2.CanonicalMeta(ctx, servicecontext.ContextMetaTaskUuid); has {
		fields = append(fields, zap.String(common.KeySchedulerTaskId, taskUuid))
	}
	if taskPath, has := context2.CanonicalMeta(ctx, servicecontext.ContextMetaTaskActionPath); has {
		fields = append(fields, zap.String(common.KeySchedulerActionPath, taskPath))
	}
	if ctxMeta, has := metadata.FromContext(ctx); has {
		for _, key := range []string{
			servicecontext.HttpMetaRemoteAddress,
			servicecontext.HttpMetaUserAgent,
			servicecontext.HttpMetaContentType,
			servicecontext.HttpMetaProtocol,
		} {
			if val, hasKey := ctxMeta[key]; hasKey {
				fields = append(fields, zap.String(key, val))
			}
		}
	}
	if claims, ok := ctx.Value(claim.ContextKey).(claim.Claims); ok {
		uuid := claims.Subject
		fields = append(fields,
			zap.String(common.KeyUsername, claims.Name),
			zap.String(common.KeyUserUuid, uuid),
			zap.String(common.KeyGroupPath, claims.GroupPath),
			zap.String(common.KeyProfile, claims.Profile),
			zap.String(common.KeyRoles, claims.Roles),
		)
	}
	if len(fields) == 0 {
		return logger
	}
	return logger.With(fields...)
}
