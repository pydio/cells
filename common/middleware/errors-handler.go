/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package middleware

import (
	"context"
	"strings"

	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

const (
	errCauseIdKey       = "ErrorCauseId"
	errCauseMsgKey      = "ErrorCauseMsg"
	errHandlerSpanIDKey = "ErrorHandlerSpanID"
)

var (
	commonIgnores = []error{
		errors.EmptyIDToken,
		errors.InvalidIDToken,
		errors.StatusCancelled,
		context.Canceled,
		errors.NodeNotFound,
		errors.JobNotFound,
		errors.WorkspaceNotFound,
		errors.DocStoreDocNotFound,
		errors.UserNotFound,
	}
	commonWarns = []error{
		errors.NodeIndexConflict,
		errors.StatusServiceUnavailable,
	}
)

func logRestError(ctx context.Context, err error, prefix string, logLevel zapcore.Level) {
	for _, ignore := range commonIgnores {
		if errors.Is(err, ignore) {
			return
		}
	}
	errorMsg := strings.ReplaceAll(err.Error(), "\n", " || ")
	var ff []zap.Field
	if errors.Is(err, errors.CellsError) {
		if errors.Is(err, HandledError) {
			for k, v := range errors.AllDetails(err) {
				if k == errCauseIdKey {
					ff = append(ff, zap.String(errCauseIdKey, v.(string)))
				} else if k == errCauseMsgKey {
					errorMsg = v.(string)
				}
			}
			ff = append(ff, zap.String("error", errorMsg))
		} else {
			ff = append(ff, errors.Zap(err))
		}
	} else {
		ff = append(ff, zap.Error(err))
	}
	if logLevel == zapcore.WarnLevel {
		log.Logger(ctx).Warn(prefix+" "+errorMsg, ff...)
	} else if logLevel == zapcore.DebugLevel {
		log.Logger(ctx).Debug(prefix+" "+errorMsg, ff...)
	} else {
		log.Logger(ctx).Error(prefix+" "+errorMsg, ff...)
	}
}

func handleGrpcError(ctx context.Context, err error, prefix string, infos ...zap.Field) error {
	if err == nil {
		return nil
	}
	if !errors.Is(err, HandledError) {
		var details []any

		errorId := uuid.New()[:13]
		errorMsg := strings.ReplaceAll(err.Error(), "\n", " || ")

		ignoreLog := false
		warnLog := false
		for _, ig := range commonIgnores {
			if errors.Is(err, ig) {
				ignoreLog = true
				break
			}
		}
		for _, ig := range commonWarns {
			if errors.Is(err, ig) {
				warnLog = true
				break
			}
		}
		if !ignoreLog {
			var fields []zap.Field
			fields = append(fields, zap.String("errorId", errorId))
			if len(infos) > 0 {
				fields = append(fields, infos...)
			}
			//		fields = append(fields, zap.String("method", info.FullMethod))
			if meta := metadata.ValueFromIncomingContext(ctx, common.CtxGrpcClientCaller); len(meta) > 0 {
				fields = append(fields, zap.String("ClientCaller", strings.Join(meta, "")))
			}
			if warnLog {
				log.Logger(ctx).Warn(prefix+" "+errorMsg, fields...)
			} else {
				fields = append(fields, errors.Zap(err))
				log.Logger(ctx).Error(prefix+" "+errorMsg, fields...)
			}
		}

		if errors.Is(err, context.Canceled) {
			err = errors.Tag(err, errors.StatusCancelled)
		}

		err = errors.Tag(err, HandledError)

		if trace.SpanFromContext(ctx).SpanContext().IsValid() {
			details = append(details, errHandlerSpanIDKey, trace.SpanFromContext(ctx).SpanContext().SpanID().String())
		}
		details = append(details, errCauseIdKey, errorId, errCauseMsgKey, errorMsg)
		err = errors.WithDetails(err, details...)

	}
	return err

}
