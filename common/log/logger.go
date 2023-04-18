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
	"fmt"
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type ZapLogger interface {
	Named(s string) ZapLogger
	WithOptions(opts ...zap.Option) ZapLogger
	With(fields ...zap.Field) ZapLogger

	Debug(msg string, fields ...zap.Field)
	Info(msg string, fields ...zap.Field)
	Warn(msg string, fields ...zap.Field)
	Error(msg string, fields ...zap.Field)
	DPanic(msg string, fields ...zap.Field)
	Panic(msg string, fields ...zap.Field)
	Fatal(msg string, fields ...zap.Field)

	Debugf(format string, args ...interface{})
	Infof(format string, args ...interface{})
	Warnf(format string, args ...interface{})
	Errorf(format string, args ...interface{})

	Sugar() *zap.SugaredLogger
	Check(lvl zapcore.Level, msg string) *zapcore.CheckedEntry
	Sync() error
	Core() zapcore.Core
}

type logger struct {
	*zap.Logger

	init func() *zap.Logger
	once *sync.Once

	namedMu sync.Mutex
	named   map[string]ZapLogger

	fields []zap.Field
}

func newLogger() *logger {
	return &logger{
		Logger: zap.New(nil),
		once:   &sync.Once{},
		named:  make(map[string]ZapLogger),
	}
}

func (l *logger) set(init func() *zap.Logger) {
	l.init = init
	l.once = &sync.Once{}
}

func (l *logger) forceReset() {
	l.once = &sync.Once{}
	// Clear subloggers
	l.namedMu.Lock()
	l.named = make(map[string]ZapLogger)
	l.namedMu.Unlock()
}

func (l *logger) get() ZapLogger {
	l.once.Do(func() {
		if l.init != nil {
			l.Logger = l.init()
		}
	})

	return l
}

func (l *logger) Named(s string) ZapLogger {
	l.namedMu.Lock()
	defer l.namedMu.Unlock()
	if n, ok := l.named[s]; ok {
		return n
	}
	core := l.Logger.Named(s)
	if mustIncrease(s) {
		core = core.WithOptions(zap.IncreaseLevel(zap.InfoLevel))
	}
	n := &logger{Logger: core}
	l.named[s] = n
	return n
}

func (l *logger) With(fields ...zap.Field) ZapLogger {
	return &logger{
		Logger: l.Logger,
		fields: fields,
	}
}

func (l *logger) Info(msg string, fields ...zap.Field) {
	l.Logger.Info(msg, append(fields, l.fields...)...)
}

func (l *logger) Debug(msg string, fields ...zap.Field) {
	l.Logger.Debug(msg, append(fields, l.fields...)...)
}

func (l *logger) Warn(msg string, fields ...zap.Field) {
	l.Logger.Warn(msg, append(fields, l.fields...)...)
}

func (l *logger) Error(msg string, fields ...zap.Field) {
	l.Logger.Error(msg, append(fields, l.fields...)...)
}

func (l *logger) DPanic(msg string, fields ...zap.Field) {
	l.Logger.DPanic(msg, append(fields, l.fields...)...)
}

func (l *logger) Panic(msg string, fields ...zap.Field) {
	l.Logger.Panic(msg, append(fields, l.fields...)...)
}

func (l *logger) Fatal(msg string, fields ...zap.Field) {
	l.Logger.Fatal(msg, append(fields, l.fields...)...)
}

func (l *logger) Debugf(format string, args ...interface{}) {
	l.Logger.Debug(fmt.Sprintf(format, args...))
}
func (l *logger) Infof(format string, args ...interface{}) {
	l.Logger.Info(fmt.Sprintf(format, args...))
}
func (l *logger) Warnf(format string, args ...interface{}) {
	l.Logger.Warn(fmt.Sprintf(format, args...))
}
func (l *logger) Errorf(format string, args ...interface{}) {
	l.Logger.Error(fmt.Sprintf(format, args...))
}

func (l *logger) WithOptions(opts ...zap.Option) ZapLogger {
	return &logger{Logger: l.Logger.WithOptions(opts...)}
}
