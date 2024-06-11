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
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	errCauseIdKey       = "ErrorCauseId"
	errCauseMsgKey      = "ErrorCauseMsg"
	errHandlerSpanIDKey = "ErrorHandlerSpanID"
)

func HandleErrorRest(ctx context.Context, err error, prefix string) (string, []zap.Field) {
	var ff []zap.Field
	if errors.Is(err, errors.CellsError) {
		if errors.Is(err, HandledError) {
			errorMsg := err.Error()
			for k, v := range errors.AllDetails(err) {
				if k == errCauseIdKey {
					ff = append(ff, zap.String(errCauseIdKey, v.(string)))
				} else if k == errCauseMsgKey {
					errorMsg = v.(string)
				}
			}
			ff = append(ff, zap.String("error", errorMsg))
		} else {
			ff = append(ff, zap.Error(err))
		}
	} else {
		ff = append(ff, zap.Error(err))
	}
	return prefix, ff
}

func HandleErrorGRPC(ctx context.Context, err error, prefix string, infos ...zap.Field) error {
	if err == nil {
		return nil
	}
	if !errors.Is(err, HandledError) {
		var fields []zap.Field
		var details []any

		errorId := uuid.New()[:13]
		errorMsg := err.Error()

		fields = append(fields, zap.String("errorId", errorId))
		if len(infos) > 0 {
			fields = append(fields, infos...)
		}
		//		fields = append(fields, zap.String("method", info.FullMethod))
		if meta := metadata.ValueFromIncomingContext(ctx, common.CtxGrpcClientCaller); len(meta) > 0 {
			fields = append(fields, zap.String("ClientCaller", strings.Join(meta, "")))
		}
		if errors.Is(err, errors.CellsError) {
			js, _ := jsonx.Marshal(err)
			fields = append(fields, zap.Any("jsonErr", jsonx.RawMessage(js)))
		} else {
			fields = append(fields, zap.Error(err))
		}
		log.Logger(ctx).Error(prefix+" "+errorMsg, fields...)

		err = errors.Tag(err, HandledError)

		if trace.SpanFromContext(ctx).SpanContext().IsValid() {
			details = append(details, errHandlerSpanIDKey, trace.SpanFromContext(ctx).SpanContext().SpanID().String())
		}
		details = append(details, errCauseIdKey, errorId, errCauseMsgKey, errorMsg)
		err = errors.WithDetails(err, details...)

	}
	return err

}
