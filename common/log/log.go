/*
 * Copyright (c) 2018-2021. Abstrium SAS <team (at) pydio.com>
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
	"strings"
	"time"

	micro "github.com/micro/go-log"
	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	lumberjack "gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	servicecontext "github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"
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

	skipServerSync bool
	customSyncers  []zapcore.WriteSyncer
	// Parse log lines like below:
	// ::1 - - [18/Apr/2018:15:10:58 +0200] "GET /graph/state/workspaces HTTP/1.1" 200 2837 "" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
	combinedRegexp = regexp.MustCompile(`^(?P<remote_addr>[^ ]+) (?P<user>[^ ]+) (?P<other>[^ ]+) \[(?P<time_local>[^]]+)\] "(?P<request>[^"]+)" (?P<code>[^ ]+) (?P<size>[^ ]+) "(?P<referrer>[^ ]*)" "(?P<user_agent>[^"]+)"$`)
)

// Init for the log package - called by the main
func Init() {
	SetLoggerInit(func() *zap.Logger {

		StdOut = os.Stdout

		var logger *zap.Logger

		serverCore := zapcore.NewNopCore()
		if !skipServerSync {
			// Create core for internal indexing service
			// It forwards logs to the pydio.grpc.logs service to store them
			// Format is always JSON + ProductionEncoderConfig
			srvConfig := zap.NewProductionEncoderConfig()
			srvConfig.EncodeTime = RFC3369TimeEncoder
			serverSync := zapcore.AddSync(NewLogSyncer(context.Background(), common.ServiceGrpcNamespace_+common.ServiceLog))
			serverCore = zapcore.NewCore(
				zapcore.NewJSONEncoder(srvConfig),
				serverSync,
				common.LogLevel,
			)
		}

		syncers := []zapcore.WriteSyncer{StdOut}
		if common.LogToFile {
			// Additional logger: stores messages in local file
			logDir := config.ApplicationWorkingDir(config.ApplicationDirLogs)
			rotaterSync := zapcore.AddSync(&lumberjack.Logger{
				Filename:   filepath.Join(logDir, "pydio.log"),
				MaxSize:    10, // megabytes
				MaxBackups: 100,
				MaxAge:     28, // days
			})
			syncers = append(syncers, rotaterSync)
		}
		syncers = append(syncers, customSyncers...)
		syncer := zapcore.NewMultiWriteSyncer(syncers...)

		if common.LogConfig == common.LogConfigProduction {

			// lumberjack.Logger is already safe for concurrent use, so we don't need to lock it.
			cfg := zap.NewProductionEncoderConfig()
			cfg.EncodeTime = RFC3369TimeEncoder
			core := zapcore.NewCore(
				zapcore.NewJSONEncoder(cfg),
				syncer,
				common.LogLevel,
			)
			core = zapcore.NewTee(core, serverCore)
			logger = zap.New(core)

		} else {

			cfg := zap.NewDevelopmentEncoderConfig()
			cfg.EncodeLevel = zapcore.CapitalColorLevelEncoder
			core := zapcore.NewCore(
				newColorConsoleEncoder(cfg),
				syncer,
				common.LogLevel,
			)
			core = zapcore.NewTee(core, serverCore)
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
						logger.Named(common.ServiceMicroApi).Debug("Rest API Call", fields...)
					} else if strings.Contains(line, "[DEV NOTICE]") {
						logger.Named(common.ServiceGatewayProxy).Debug(line)
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

// SetSkipServerSync can disable the core syncing to cells service
// Must be called before initialization
func SetSkipServerSync() {
	skipServerSync = true
}

// SetLoggerInit defines what function to use to init the logger
func SetLoggerInit(f func() *zap.Logger) {
	mainLogger.set(f)
}

// Logger returns a zap logger with as much context as possible.
func Logger(ctx context.Context) *zap.Logger {
	return fillLogContext(ctx, mainLogger.get())
}

// SetAuditerInit defines what function to use to init the auditer
func SetAuditerInit(f func() *zap.Logger) {
	auditLogger.set(f)
}

// Auditer returns a zap logger with as much context as possible
func Auditer(ctx context.Context) *zap.Logger {
	return fillLogContext(ctx, auditLogger.get(), zap.String("LogType", "audit"))
}

// SetTasksLoggerInit defines what function to use to init the tasks logger
func SetTasksLoggerInit(f func() *zap.Logger) {
	tasksLogger.set(f)
}

// TasksLogger returns a zap logger with as much context as possible.
func TasksLogger(ctx context.Context) *zap.Logger {
	return fillLogContext(ctx, tasksLogger.get(), zap.String("LogType", "tasks"))
}

// GetAuditId simply returns a zap field that contains this message id to ease audit log analysis.
func GetAuditId(msgId string) zapcore.Field {
	return zap.String(common.KeyMsgId, msgId)
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
func fillLogContext(ctx context.Context, logger *zap.Logger, fields ...zapcore.Field) *zap.Logger {

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
