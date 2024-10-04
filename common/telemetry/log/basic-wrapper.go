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

package log

import (
	"context"

	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/runtime"
)

// BasicContextWrapper creates a Named logger from serviceName found in context
func BasicContextWrapper(ctx context.Context, logger ZapLogger, fields ...zapcore.Field) ZapLogger {
	if ctx == nil {
		return logger
	}
	if serviceName := runtime.GetServiceName(ctx); serviceName != "" {
		logger = logger.Named(serviceName)
		if mustIncrease(serviceName) {
			logger = logger.WithOptions(zap.IncreaseLevel(zap.InfoLevel))
		}
	} else if mustIncrease(EmptyServiceKey) {
		logger = logger.WithOptions(zap.IncreaseLevel(zap.InfoLevel))
	}
	return logger
}

func tracingWrapper(ctx context.Context, logger ZapLogger, fields ...zapcore.Field) ZapLogger {
	return &tracingLogger{ZapLogger: logger, Span: trace.SpanFromContext(ctx)}
}

type tracingLogger struct {
	ZapLogger
	trace.Span
}

func (tl *tracingLogger) Debug(msg string, fields ...zap.Field) {
	if tl.Span.IsRecording() {
		tl.Span.AddEvent(msg)
	}
	tl.ZapLogger.Debug(msg, fields...)
}
