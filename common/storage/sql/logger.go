package sql

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.uber.org/zap"
	glog "gorm.io/gorm/logger"
	"gorm.io/gorm/utils"

	log2 "github.com/pydio/cells/v4/common/telemetry/log"
)

var (
	TestPrintQueries = false
)

// NewLogger initialize logger
func NewLogger(config glog.Config) glog.Interface {
	var (
		traceStr     = "[SQL] [%.3fms] [rows:%v] %s"
		traceWarnStr = "[SQL] %s [%.3fms] [rows:%v] %s"
		traceErrStr  = "[SQL] %s [%.3fms] [rows:%v] %s"
	)

	return &zapLogger{
		Config:       config,
		traceStr:     traceStr,
		traceWarnStr: traceWarnStr,
		traceErrStr:  traceErrStr,
	}
}

type zapLogger struct {
	glog.Config
	infoStr, warnStr, errStr            string
	traceStr, traceErrStr, traceWarnStr string
}

// LogMode log mode
func (l *zapLogger) LogMode(level glog.LogLevel) glog.Interface {
	newlogger := *l
	newlogger.LogLevel = level
	return &newlogger
}

// Info print info
func (l *zapLogger) Info(ctx context.Context, msg string, data ...interface{}) {

	if l.LogLevel >= glog.Info {
		log2.Logger(ctx).Info("[SQL] "+fmt.Sprintf(msg, data...), zap.String("file", utils.FileWithLineNum()), zap.String("layer", "sql"))
	}
}

// Warn print warn messages
func (l *zapLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= glog.Warn {
		log2.Logger(ctx).Warn("[SQL] "+fmt.Sprintf(msg, data...), zap.String("file", utils.FileWithLineNum()), zap.String("layer", "sql"))
	}
}

// Error print error messages
func (l *zapLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= glog.Error {
		log2.Logger(ctx).Error("[SQL] "+fmt.Sprintf(msg, data...), zap.String("file", utils.FileWithLineNum()), zap.String("layer", "sql"))
	}
}

// Trace print sql message
func (l *zapLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if l.LogLevel <= glog.Silent {
		return
	}

	elapsed := time.Since(begin)
	var logLine string
	ff := []zap.Field{
		zap.String("file", utils.FileWithLineNum()),
		zap.String("layer", "sql"),
	}
	switch {
	case err != nil && l.LogLevel >= glog.Error && (!errors.Is(err, glog.ErrRecordNotFound) || !l.IgnoreRecordNotFoundError) && !errors.Is(err, context.Canceled):
		sql, rows := fc()
		if rows == -1 {
			logLine = fmt.Sprintf(l.traceErrStr, err, float64(elapsed.Nanoseconds())/1e6, "-", sql)
		} else {
			logLine = fmt.Sprintf(l.traceErrStr, err, float64(elapsed.Nanoseconds())/1e6, rows, sql)
		}
	case elapsed > l.SlowThreshold && l.SlowThreshold != 0 && l.LogLevel >= glog.Warn:
		sql, rows := fc()
		slowLog := fmt.Sprintf("SLOW QUERY >= %v", l.SlowThreshold)
		ff = append(ff, zap.Bool("slow-query", true))
		if rows == -1 {
			logLine = fmt.Sprintf(l.traceWarnStr, slowLog, float64(elapsed.Nanoseconds())/1e6, "-", sql)
		} else {
			logLine = fmt.Sprintf(l.traceWarnStr, slowLog, float64(elapsed.Nanoseconds())/1e6, rows, sql)
		}
	case l.LogLevel == glog.Info || TestPrintQueries:
		sql, rows := fc()
		if rows == -1 {
			logLine = fmt.Sprintf(l.traceStr, float64(elapsed.Nanoseconds())/1e6, "-", sql)
		} else {
			logLine = fmt.Sprintf(l.traceStr, float64(elapsed.Nanoseconds())/1e6, rows, sql)
		}
	}
	if logLine != "" {
		if TestPrintQueries {
			fmt.Println(logLine)
		}
		log2.Logger(ctx).Info(logLine, ff...)
	}
}

// ParamsFilter filter params
func (l *zapLogger) ParamsFilter(ctx context.Context, sql string, params ...interface{}) (string, []interface{}) {
	if l.Config.ParameterizedQueries {
		return sql, nil
	}
	return sql, params
}
