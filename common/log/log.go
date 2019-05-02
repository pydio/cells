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
	"os"
	"path/filepath"
	"regexp"
	"time"

	micro "github.com/micro/go-log"
	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	config2 "github.com/pydio/cells/common/config"
	servicecontext "github.com/pydio/cells/common/service/context"
	"gopkg.in/natefinch/lumberjack.v2"
)

var (
	logger          *zap.Logger
	AuditLogger     *zap.Logger
	TasksLoggerImpl *zap.Logger
	StdOut          *os.File

	// Parse log lines like below:
	// ::1 - - [18/Apr/2018:15:10:58 +0200] "GET /graph/state/workspaces HTTP/1.1" 200 2837 "" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
	combinedRegexp = regexp.MustCompile(`^(?P<remote_addr>[^ ]+) (?P<user>[^ ]+) (?P<other>[^ ]+) \[(?P<time_local>[^]]+)\] "(?P<request>[^"]+)" (?P<code>[^ ]+) (?P<size>[^ ]+) "(?P<referrer>[^ ]*)" "(?P<user_agent>[^"]+)"$`)
)

func Init() {
	initLogger()
}

func initLogger() *zap.Logger {

	if logger != nil {
		return logger
	}
	StdOut = os.Stdout

	if common.LogConfig == common.LogConfigProduction {

		// Forwards logs to the pydio.grpc.logs service to store them
		serverSync := zapcore.AddSync(NewLogSyncer(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_LOG))

		// Additional logger: stores messages in local file
		pydioDir := config2.ApplicationDataDir()
		os.MkdirAll(filepath.Join(pydioDir, "logs"), 0755)
		rotaterSync := zapcore.AddSync(&lumberjack.Logger{
			Filename:   filepath.Join(pydioDir, "logs", "pydio.log"),
			MaxSize:    500, // megabytes
			MaxBackups: 3,
			MaxAge:     28, // days
		})

		w := zapcore.NewMultiWriteSyncer(
			StdOut,
			serverSync,
			rotaterSync,
		)

		// lumberjack.Logger is already safe for concurrent use, so we don't need to lock it.
		config := zap.NewProductionEncoderConfig()
		config.EncodeTime = RFC3369TimeEncoder

		core := zapcore.NewCore(
			zapcore.NewJSONEncoder(config),
			w,
			common.LogLevel,
		)

		logger = zap.New(core)
	} else {
		config := zap.NewDevelopmentEncoderConfig()
		config.EncodeLevel = zapcore.CapitalColorLevelEncoder

		core := zapcore.NewCore(
			zapcore.NewConsoleEncoder(config),
			StdOut,
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
					logger.Named(common.SERVICE_MICRO_API).Debug("Rest Api Call", fields...)
				} else {
					// Log the stdout line to my event logger
					logger.Info(line)
				}
			}
		}()
	}

	return logger
}

// Logger returns a zap logger with as much context as possible
func Logger(ctx context.Context) *zap.Logger {
	newLogger := initLogger()
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

// Auditer returns a zap logger for Audit with as much context as possible.
func Auditer(ctx context.Context) *zap.Logger {
	if AuditLogger == nil {
		return zap.New(nil)
	}
	newLogger := AuditLogger //initAuditLogger()
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

// TasksLogger returns a zap logger for tasks with as much context as possible.
func TasksLogger(ctx context.Context) *zap.Logger {
	if TasksLoggerImpl == nil {
		return zap.New(nil)
	}
	newLogger := TasksLoggerImpl
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

// RFC3369TimeEncoder serializes a time.Time to an RFC3339-formatted string.
func RFC3369TimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format(time.RFC3339))
}

func Debug(msg string, fields ...zapcore.Field) {
	logger.Debug(msg, fields...)
}

func Error(msg string, fields ...zapcore.Field) {
	logger.Error(msg, fields...)
}

func Fatal(msg string, fields ...zapcore.Field) {
	logger.Fatal(msg, fields...)
}

func Info(msg string, fields ...zapcore.Field) {
	logger.Info(msg, fields...)
}

// Enrich the passed logger with generic context info, used by the various defined loggers.
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
		uuid, _ := claims.DecodeUserUuid()
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
