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

package log

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"time"

	micro "github.com/micro/go-log"
	"github.com/micro/go-micro/metadata"
	context2 "github.com/pydio/cells/common/utils/context"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	config2 "github.com/pydio/cells/common/config"
	servicecontext "github.com/pydio/cells/common/service/context"
	"gopkg.in/natefinch/lumberjack.v2"
)

// WriteSyncer implements zapcore.WriteSyncer
type WriteSyncer interface {
	io.Writer
	Sync() error
}

var (
	mainLogger  = newLogger()
	auditLogger = newLogger()
	tasksLogger = newLogger()

	StdOut *os.File

	customSyncers []zapcore.WriteSyncer
	// Parse log lines like below:
	// ::1 - - [18/Apr/2018:15:10:58 +0200] "GET /graph/state/workspaces HTTP/1.1" 200 2837 "" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
	combinedRegexp = regexp.MustCompile(`^(?P<remote_addr>[^ ]+) (?P<user>[^ ]+) (?P<other>[^ ]+) \[(?P<time_local>[^]]+)\] "(?P<request>[^"]+)" (?P<code>[^ ]+) (?P<size>[^ ]+) "(?P<referrer>[^ ]*)" "(?P<user_agent>[^"]+)"$`)
)

// Init for the log package - called by the main
func Init() {
	SetLoggerInit(func() *zap.Logger {

		StdOut = os.Stdout

		var logger *zap.Logger

		if common.LogConfig == common.LogConfigProduction {

			// Forwards logs to the pydio.grpc.logs service to store them
			serverSync := zapcore.AddSync(NewLogSyncer(context.Background(), common.ServiceGrpcNamespace_+common.ServiceLog))

			// Additional logger: stores messages in local file
			logDir := config2.ApplicationWorkingDir(config2.ApplicationDirLogs)
			rotaterSync := zapcore.AddSync(&lumberjack.Logger{
				Filename:   filepath.Join(logDir, "pydio.log"),
				MaxSize:    10, // megabytes
				MaxBackups: 100,
				MaxAge:     28, // days
			})

			syncers := []zapcore.WriteSyncer{StdOut, serverSync, rotaterSync}
			syncers = append(syncers, customSyncers...)
			w := zapcore.NewMultiWriteSyncer(syncers...)

			// lumberjack.Logger is already safe for concurrent use, so we don't need to lock it.
			config := zap.NewProductionEncoderConfig()
			config.EncodeTime = RFC3369TimeEncoder

			core := zapcore.NewCore(
				zapcore.NewJSONEncoder(config),
				w,
				zapcore.InfoLevel,
			)

			logger = zap.New(core)
		} else {
			config := zap.NewDevelopmentEncoderConfig()
			config.EncodeLevel = zapcore.CapitalColorLevelEncoder

			var syncer zapcore.WriteSyncer
			syncer = StdOut
			if len(customSyncers) > 0 {
				syncers := []zapcore.WriteSyncer{StdOut}
				syncers = append(syncers, customSyncers...)
				syncer = zapcore.NewMultiWriteSyncer(syncers...)
			}
			core := zapcore.NewCore(
				zapcore.NewConsoleEncoder(config),
				syncer,
				common.LogLevel,
			)

			if common.LogLevel == zap.DebugLevel {
				logger = zap.New(core, zap.AddStacktrace(zap.ErrorLevel))
			} else {
				logger = zap.New(core)
			}
		}
		nop := zap.NewNop()
		_, _ = zap.RedirectStdLogAt(logger, zap.DebugLevel)
		micro.SetLogger(micrologger{nop})

		// Catch StdOut
		if !common.LogCaptureStdOut {
			return logger
		}

		r, w, err := os.Pipe()
		if err == nil {
			os.Stdout = w
			go func() {
				scanner := bufio.NewScanner(r)
				for scanner.Scan() {
					line := scanner.Text()
					if parsed := combinedRegexp.FindStringSubmatch(line); len(parsed) > 0 {
						var fields []zapcore.Field
						for i, exp := range combinedRegexp.SubexpNames() {
							if exp == "" || exp == "user" || exp == "other" || exp == "time_local" {
								continue
							}
							fields = append(fields, zap.String(exp, parsed[i]))
						}
						logger.Named(common.ServiceMicroApi).Debug("Rest Api Call", fields...)
					} else {
						// Log the stdout line to my event logger
						logger.Info(line)
					}
				}
			}()
		}

		return logger
	})
}

// RegisterWriteSyncer optional writers for logs
func RegisterWriteSyncer(syncer WriteSyncer) {
	customSyncers = append(customSyncers, syncer)

	mainLogger.forceReset() // Will force reinit next time
}

// SetLoggerInit defines what function to use to init the logger
func SetLoggerInit(f func() *zap.Logger) {
	mainLogger.set(f)
}

// Logger returns a zap logger with as much context as possible.
func Logger(ctx context.Context) *zap.Logger {
	newLogger := mainLogger.get()

	if ctx != nil {
		if serviceName := servicecontext.GetServiceName(ctx); serviceName != "" {
			if serviceColor := servicecontext.GetServiceColor(ctx); serviceColor > 0 && common.LogConfig != common.LogConfigProduction {
				newLogger = newLogger.Named(fmt.Sprintf("\x1b[%dm%s\x1b[0m", serviceColor, serviceName))
			} else {
				newLogger = newLogger.Named(serviceName)
			}
		}
		if opID, opLabel := servicecontext.GetOperationID(ctx); opID != "" {
			if opLabel != "" {
				newLogger = newLogger.With(zap.String(common.KEY_OPERATION_UUID, opID), zap.String(common.KEY_OPERATION_LABEL, opLabel))
			} else {
				newLogger = newLogger.With(zap.String(common.KEY_OPERATION_UUID, opID))
			}
		}
		if common.LogConfig == common.LogConfigProduction {
			newLogger = fillLogContext(ctx, newLogger)
		}
	}

	return newLogger
}

// SetAuditerInit defines what function to use to init the auditer
func SetAuditerInit(f func() *zap.Logger) {
	auditLogger.set(f)
}

// Auditer returns a zap logger with as much context as possible
func Auditer(ctx context.Context) *zap.Logger {
	newLogger := auditLogger.get()

	if ctx != nil {
		newLogger = newLogger.With(zap.String("LogType", "audit"))
		if serviceName := servicecontext.GetServiceName(ctx); serviceName != "" {
			newLogger = newLogger.Named(serviceName)
		}
		// Add context info to the logger
		newLogger = fillLogContext(ctx, newLogger)
	}

	return newLogger
}

// SetTasksLoggerInit defines what function to use to init the tasks logger
func SetTasksLoggerInit(f func() *zap.Logger) {
	tasksLogger.set(f)
}

// TasksLogger returns a zap logger with as much context as possible.
func TasksLogger(ctx context.Context) *zap.Logger {
	newLogger := tasksLogger.get()
	if ctx != nil {
		newLogger = newLogger.With(zap.String("LogType", "tasks"))
		if serviceName := servicecontext.GetServiceName(ctx); serviceName != "" {
			newLogger = newLogger.Named(serviceName)
		}
		// Add context info to the logger
		newLogger = fillLogContext(ctx, newLogger)
	}

	return newLogger
}

// GetAuditId simply returns a zap field that contains this message id to ease audit log analysis.
func GetAuditId(msgId string) zapcore.Field {
	return zap.String(common.KEY_MSG_ID, msgId)
}

type micrologger struct {
	*zap.Logger
}

func (m micrologger) Log(v ...interface{}) {
	m.Info(fmt.Sprint(v...))
}

func (m micrologger) Logf(f string, v ...interface{}) {
	m.Info(fmt.Sprintf(f, v...))
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

// Enrich the passed logger with generic context info, used by both syslog and audit loggers
func fillLogContext(ctx context.Context, logger *zap.Logger) *zap.Logger {

	if span, ok := servicecontext.SpanFromContext(ctx); ok {
		if len(span.RootParentId) > 0 {
			logger = logger.With(zap.String(common.KEY_SPAN_ROOT_UUID, span.RootParentId))
		}
		if len(span.ParentId) > 0 {
			logger = logger.With(zap.String(common.KEY_SPAN_PARENT_UUID, span.RootParentId))
		}
		logger = logger.With(zap.String(common.KEY_SPAN_UUID, span.SpanId))
	}
	if opId, opLabel := servicecontext.GetOperationID(ctx); opId != "" {
		logger = logger.With(zap.String(common.KEY_OPERATION_UUID, opId))
		if opLabel != "" {
			logger = logger.With(zap.String(common.KEY_OPERATION_LABEL, opLabel))
		}
	}
	if jobId, has := context2.CanonicalMeta(ctx, servicecontext.ContextMetaJobUuid); has {
		logger = logger.With(zap.String(common.KEY_SCHEDULER_JOB_ID, jobId))
	}
	if taskUuid, has := context2.CanonicalMeta(ctx, servicecontext.ContextMetaTaskUuid); has {
		logger = logger.With(zap.String(common.KEY_SCHEDULER_TASK_ID, taskUuid))
	}
	if taskPath, has := context2.CanonicalMeta(ctx, servicecontext.ContextMetaTaskActionPath); has {
		logger = logger.With(zap.String(common.KEY_SCHEDULER_ACTION_PATH, taskPath))
	}
	if ctxMeta, has := metadata.FromContext(ctx); has {
		for _, key := range []string{
			servicecontext.HttpMetaRemoteAddress,
			servicecontext.HttpMetaUserAgent,
			servicecontext.HttpMetaContentType,
			servicecontext.HttpMetaProtocol,
		} {
			if val, hasKey := ctxMeta[key]; hasKey {
				logger = logger.With(zap.String(key, val))
			}
		}
	}
	if claims, ok := ctx.Value(claim.ContextKey).(claim.Claims); ok {
		uuid := claims.Subject
		logger = logger.With(
			zap.String(common.KEY_USERNAME, claims.Name),
			zap.String(common.KEY_USER_UUID, uuid),
			zap.String(common.KEY_GROUP_PATH, claims.GroupPath),
			zap.String(common.KEY_PROFILE, claims.Profile),
			zap.String(common.KEY_ROLES, claims.Roles),
		)
	}
	return logger
}
