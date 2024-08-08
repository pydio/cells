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

package log

import (
	"context"
	"io"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/otel"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

// WriteSyncer implements zapcore.WriteSyncer
type WriteSyncer interface {
	io.Writer
	Sync() error
}

type ContextWrapper func(ctx context.Context, logger ZapLogger, fields ...zapcore.Field) ZapLogger

var (
	mainLoggerPool = openurl.MustMemPool(context.Background(), func(ctx context.Context, url string) *logger {
		return newLogger()
	})
	auditLoggerPool = openurl.MustMemPool(context.Background(), func(ctx context.Context, url string) *logger {
		return newLogger()
	})
	tasksLoggerPool = openurl.MustMemPool(context.Background(), func(ctx context.Context, url string) *logger {
		return newLogger()
	})

	//	auditLogger    = newLogger()
	//	tasksLogger    = newLogger()
	contextWrapper = BasicContextWrapper

	ReadyLogSyncerContext context.Context

	StdOut *os.File

	currentConfig []LoggerConfig
	currentSvc    otel.Service

	//mainClosers   []io.Closer
	customSyncers []LoggerConfig
)

// Init for the log package - called by the main
func Init(svc otel.Service, conf []LoggerConfig, ww ...ContextWrapper) {

	currentConfig = conf
	currentSvc = svc

	SetLoggerInit(func(ctx context.Context) (*zap.Logger, []io.Closer) {

		// TODO
		// - Handle legacy common.LogToFile runtime flag, same for common.LogConfig presets (e.g. common.LogConfigProduction)
		// - Are files logger disabled on forks?
		// - Check skipServerSync setting for external libs
		// - Config for other loggers

		// Append custom configurations
		fullConfig := append(currentConfig, customSyncers...)

		cores, closers, hasDebug := LoadCores(ctx, currentSvc, fullConfig)
		var loggerOptions []zap.Option
		if hasDebug || traceFatalEnabled() {
			loggerOptions = append(loggerOptions, zap.AddStacktrace(zap.FatalLevel))
		}
		zl := zap.New(zapcore.NewTee(cores...), loggerOptions...)
		if traceFatalEnabled() {
			_, _ = zap.RedirectStdLogAt(zl, zap.FatalLevel) // log anything at ErrorLevel with a stack trace
		} else {
			_, _ = zap.RedirectStdLogAt(zl, zap.DebugLevel)
		}

		return zl, closers

	}, func(ctx context.Context) {
		ReadyLogSyncerContext = ctx
	})
	if len(ww) > 0 {
		contextWrapper = ww[0]
	}
}

// ReloadMainLogger passes an updated config and force logger reset
func ReloadMainLogger(scv otel.Service, cfg []LoggerConfig) {
	currentSvc = scv
	currentConfig = cfg
	resetLoggerPool(mainLoggerPool)
}

// RegisterWriteSyncer optional writers for logs
func RegisterWriteSyncer(syncer LoggerConfig) {
	customSyncers = append(customSyncers, syncer)
	resetLoggerPool(mainLoggerPool)
}

// SetSkipServerSync can disable the core syncing to cells service
// Must be called before initialization
func SetSkipServerSync() {
	panic("should be simply ignored by configuration or if grpc context is not initialized")
}

// initLogger sets the initializer and eventually registers a GlobalConnConsumer function.
func initLoggerPool(f LoggerInitializer, globalConnInit func(ctx context.Context)) LoggerPool {
	return openurl.MustMemPool[*logger](context.Background(), func(ctx context.Context, url string) *logger {
		l := newLogger()
		l.set(f)
		if globalConnInit != nil {
			runtime.RegisterGlobalConnConsumer("main", func(ctx context.Context) {
				globalConnInit(ctx)
				l.forceReset()
			})
		}
		return l
	})
}

func resetLoggerPool(p LoggerPool) {
	_ = (*p).Iterate(context.Background(), func(key string, res *logger) error {
		res.forceReset()
		return nil
	})
}

// SetLoggerInit defines what function to use to init the logger
func SetLoggerInit(f LoggerInitializer, globalConnInit func(ctx context.Context)) {
	//initLogger(mainLogger, f, globalConnInit)
	_ = (*mainLoggerPool).Close(context.Background())
	mainLoggerPool = initLoggerPool(f, globalConnInit)
}

// Logger returns a zap logger with as much context as possible.
func Logger(ctx context.Context) ZapLogger {
	ml, _ := (*mainLoggerPool).Get(ctx)
	return contextWrapper(ctx, ml.get(ctx))
}

// SetAuditerInit defines what function to use to init the auditer
func SetAuditerInit(f LoggerInitializer, globalConnInit func(ctx context.Context)) {
	_ = (*auditLoggerPool).Close(context.Background())
	auditLoggerPool = initLoggerPool(f, globalConnInit)
}

// Auditer returns a zap logger with as much context as possible
func Auditer(ctx context.Context) ZapLogger {
	ml, _ := (*auditLoggerPool).Get(ctx)
	return contextWrapper(ctx, ml.get(ctx), zap.String("LogType", "audit"))
}

// SetTasksLoggerInit defines what function to use to init the tasks logger
func SetTasksLoggerInit(f LoggerInitializer, globalConnInit func(ctx context.Context)) {
	_ = (*tasksLoggerPool).Close(context.Background())
	tasksLoggerPool = initLoggerPool(f, globalConnInit)
}

// TasksLogger returns a zap logger with as much context as possible.
func TasksLogger(ctx context.Context) ZapLogger {
	ml, _ := (*tasksLoggerPool).Get(ctx)
	return contextWrapper(ctx, ml.get(ctx), zap.String("LogType", "tasks"))
}

// GetAuditId simply returns a zap field that contains this message id to ease audit log analysis.
func GetAuditId(msgId string) zapcore.Field {
	return zap.String(common.KeyMsgId, msgId)
}

// RFC3369TimeEncoder serializes a time.Time to an RFC3339-formatted string
func RFC3369TimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format(time.RFC3339))
}

func Debug(msg string, fields ...zapcore.Field) {
	l, _ := mainLoggerPool.Get(context.Background())
	l.Debug(msg, fields...)
}

func Warn(msg string, fields ...zapcore.Field) {
	l, _ := mainLoggerPool.Get(context.Background())
	l.Warn(msg, fields...)
}

func Error(msg string, fields ...zapcore.Field) {
	l, _ := mainLoggerPool.Get(context.Background())
	l.Error(msg, fields...)
}

func Fatal(msg string, fields ...zapcore.Field) {
	l, _ := mainLoggerPool.Get(context.Background())
	l.Fatal(msg, fields...)
}

func Info(msg string, fields ...zapcore.Field) {
	l, _ := mainLoggerPool.Get(context.Background())
	l.Info(msg, fields...)
}
