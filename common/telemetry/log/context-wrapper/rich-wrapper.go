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
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

// RichContext enriches the passed logger with as much info as possible
func RichContext(ctx context.Context, logger log.ZapLogger, fields ...zapcore.Field) log.ZapLogger {

	if ctx == nil {
		return logger
	}

	// Name Logger
	logger = log.BasicContextWrapper(ctx, logger, fields...)

	// Compute all fields
	var svc service.Service
	if propagator.Get(ctx, service.ContextKey, &svc) {
		for _, t := range svc.Tags() {
			fields = append(fields, zap.String("tag", t))
		}
	}
	var multi string
	if propagator.Get(ctx, runtime.MultiContextKey, &multi) {
		fields = append(fields, zap.String("Contextualizer", multi))
	}
	if span := middleware.SpanFromContext(ctx); span.HasSpanID() {
		fields = append(fields, zap.Any(common.KeySpanOtel, span))
	}
	if opId, has := propagator.CanonicalMeta(ctx, common.CtxSchedulerOperationId); has {
		fields = append(fields, zap.String(common.KeyOperationUuid, opId))
	}
	if opLabel, has := propagator.CanonicalMeta(ctx, common.CtxSchedulerOperationLabel); has {
		fields = append(fields, zap.String(common.KeyOperationLabel, opLabel))
	}
	if jobId, has := propagator.CanonicalMeta(ctx, common.CtxMetaJobUuid); has {
		fields = append(fields, zap.String(common.KeySchedulerJobId, jobId))
	}
	if taskUuid, has := propagator.CanonicalMeta(ctx, common.CtxMetaTaskUuid); has {
		fields = append(fields, zap.String(common.KeySchedulerTaskId, taskUuid))
	}
	if taskPath, has := propagator.CanonicalMeta(ctx, common.CtxMetaTaskActionPath); has {
		fields = append(fields, zap.String(common.KeySchedulerActionPath, taskPath))
	}
	if taskTags, has := propagator.CanonicalMeta(ctx, common.CtxMetaTaskActionTags); has {
		tt := strings.Split(taskTags, ",")
		if len(tt) > 0 {
			fields = append(fields, zap.Strings(common.KeySchedulerActionTags, tt))
		}
	}
	if debug, has := propagator.CanonicalMeta(ctx, common.XPydioDebugSession); has {
		fields = append(fields, zap.String(common.XPydioDebugSession, debug))
	}
	if ctxMeta, has := propagator.FromContextRead(ctx); has {
		for _, key := range log.EncoderHttpMetaKeys {
			if val, hasKey := ctxMeta[key]; hasKey {
				fields = append(fields, zap.String(key, val))
			}
		}
	}
	if claims, ok := claim.FromContext(ctx); ok {
		uuid := claims.Subject
		fields = append(fields,
			zap.String(common.KeyUsername, claims.Name),
			zap.String(common.KeyUserUuid, uuid),
			zap.String(common.KeyGroupPath, claims.GroupPath),
			zap.String(common.KeyProfile, claims.Profile),
			zap.String(common.KeyRoles, claims.Roles),
		)
	} else if u := claim.UserNameFromContext(ctx); u != "" && u != common.PydioSystemUsername {
		fields = append(fields,
			zap.String(common.KeyUsername, u),
		)
	}
	if len(fields) == 0 {
		return logger
	}
	return logger.With(fields...)
}
