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
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"regexp"
	"strings"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/otel"
)

// WriteSyncer implements zapcore.WriteSyncer
type WriteSyncer interface {
	io.Writer
	Sync() error
}

type ContextWrapper func(ctx context.Context, logger ZapLogger, fields ...zapcore.Field) ZapLogger

var (
	mainLogger     = newLogger()
	auditLogger    = newLogger()
	tasksLogger    = newLogger()
	contextWrapper = BasicContextWrapper

	ReadyLogSyncerContext context.Context

	StdOut *os.File

	currentConfig []LoggerConfig
	currentSvc    otel.Service

	mainClosers   []io.Closer
	customSyncers []LoggerConfig

	// Parse log lines like below:
	// 2022/04/21 07:53:46.226	[33mWARN[0m	tls	stapling OCSP	{"error": "no OCSP stapling for [charles-pydio.local kubernetes.docker.internal local.pydio local.pydio.com localhost localhost localpydio.com spnego.lab.py sub1.pydio sub2.pydio 127.0.0.1 192.168.10.101]: no OCSP server specified in certificate"}
	caddyInternals = regexp.MustCompile("^(?P<log_date>[^\t]+)\t(?P<log_level>[^\t]+)\t(?P<log_name>[^\t]+)\t(?P<log_message>[^\t]+)(\t)?(?P<log_fields>[^\t]+)$")
)

// Init for the log package - called by the main
func Init(svc otel.Service, conf []LoggerConfig, ww ...ContextWrapper) {

	currentConfig = conf
	currentSvc = svc

	SetLoggerInit(func() *zap.Logger {

		// TODO
		// - Handle legacy common.LogToFile runtime flag, same for common.LogConfig presets (e.g. common.LogConfigProduction)
		// - Are files logger really disabled on forks?
		// - Check skipServerSync setting for external libs
		// - Config for other loggers

		// Append custom configurations
		fullConfig := append(currentConfig, customSyncers...)

		for _, cl := range mainClosers {
			if e := cl.Close(); e != nil {
				fmt.Printf("Error while closing logger: %v\n", e)
			}
		}

		ctx := context.Background()
		cores, closers, hasDebug := LoadCores(ctx, currentSvc, fullConfig)
		mainClosers = closers

		var loggerOptions []zap.Option
		if hasDebug || traceFatalEnabled() {
			loggerOptions = append(loggerOptions, zap.AddStacktrace(zap.ErrorLevel))
		}
		zl := zap.New(zapcore.NewTee(cores...), loggerOptions...)
		if traceFatalEnabled() {
			_, _ = zap.RedirectStdLogAt(zl, zap.ErrorLevel) // log anything at ErrorLevel with a stack trace
		} else {
			_, _ = zap.RedirectStdLogAt(zl, zap.DebugLevel)
		}

		return zl

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
	mainLogger.forceReset()
}

func CaptureCaddyStdErr(serviceName string) context.Context {
	ctx := runtime.WithServiceName(context.Background(), serviceName)
	lg := Logger(ctx)
	if traceFatalEnabled() {
		return ctx
	}
	r, w, err := os.Pipe()
	if err != nil {
		return ctx
	}
	rootErr := os.Stderr
	os.Stderr = w
	//caddyLogger := logger.Named("pydio.server.caddy")
	go func() {
		scanner := bufio.NewScanner(r)
		for scanner.Scan() {
			line := scanner.Text()
			if parsed := caddyInternals.FindStringSubmatch(line); len(parsed) == 7 {
				level := strings.Trim(parsed[2], "[340m ")
				msg := parsed[3] + " - " + parsed[4] + parsed[6]
				if strings.Contains(level, "INFO") {
					lg.Info(msg)
				} else if strings.Contains(level, "WARN") {
					lg.Warn(msg)
				} else if strings.Contains(level, "ERROR") {
					lg.Error(msg)
				} else { // DEBUG, WARN, or other value
					lg.Debug(msg)
				}
			} else {
				_, _ = rootErr.WriteString(line)
			}
		}
	}()
	return ctx
}

// RegisterWriteSyncer optional writers for logs
func RegisterWriteSyncer(syncer LoggerConfig) {
	customSyncers = append(customSyncers, syncer)

	mainLogger.forceReset() // Will force reinit next time
}

// SetSkipServerSync can disable the core syncing to cells service
// Must be called before initialization
func SetSkipServerSync() {
	panic("should be simply ignored by configuration or if grpc context is not initialized")
}

// initLogger sets the initializer and eventually registers a GlobalConnConsumer function.
func initLogger(l *logger, f func() *zap.Logger, globalConnInit func(ctx context.Context)) {
	l.set(f)
	if globalConnInit != nil {
		runtime.RegisterGlobalConnConsumer("main", func(ctx context.Context) {
			globalConnInit(ctx)
			l.forceReset()
		})
	}
}

// SetLoggerInit defines what function to use to init the logger
func SetLoggerInit(f func() *zap.Logger, globalConnInit func(ctx context.Context)) {
	initLogger(mainLogger, f, globalConnInit)
}

// Logger returns a zap logger with as much context as possible.
func Logger(ctx context.Context) ZapLogger {
	return contextWrapper(ctx, mainLogger.get())
}

// SetAuditerInit defines what function to use to init the auditer
func SetAuditerInit(f func() *zap.Logger, globalConnInit func(ctx context.Context)) {
	initLogger(auditLogger, f, globalConnInit)
}

// Auditer returns a zap logger with as much context as possible
func Auditer(ctx context.Context) ZapLogger {
	return contextWrapper(ctx, auditLogger.get(), zap.String("LogType", "audit"))
}

// SetTasksLoggerInit defines what function to use to init the tasks logger
func SetTasksLoggerInit(f func() *zap.Logger, globalConnInit func(ctx context.Context)) {
	initLogger(tasksLogger, f, globalConnInit)
}

// TasksLogger returns a zap logger with as much context as possible.
func TasksLogger(ctx context.Context) ZapLogger {
	return contextWrapper(ctx, tasksLogger.get(), zap.String("LogType", "tasks"))
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
	mainLogger.Debug(msg, fields...)
}

func Warn(msg string, fields ...zapcore.Field) {
	mainLogger.Warn(msg, fields...)
}

func Error(msg string, fields ...zapcore.Field) {
	mainLogger.Error(msg, fields...)
}

func Fatal(msg string, fields ...zapcore.Field) {
	mainLogger.Fatal(msg, fields...)
}

func Info(msg string, fields ...zapcore.Field) {
	mainLogger.Info(msg, fields...)
}
