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
	"slices"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/buffer"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common"
)

const (
	ConsoleColorRest  = 32
	ConsoleColorGrpc  = 35
	ConsoleColorOther = 36
)

var (
	JSONEncoder    zapcore.Encoder
	ConsoleEncoder zapcore.Encoder
)

func init() {
	cfg := zap.NewProductionEncoderConfig()
	cfg.EncodeTime = RFC3369TimeEncoder
	JSONEncoder = zapcore.NewJSONEncoder(cfg)

	cfg2 := zap.NewDevelopmentEncoderConfig()
	cfg2.EncodeLevel = zapcore.CapitalColorLevelEncoder
	ConsoleEncoder = newColorConsoleEncoder(cfg2)
}

func newColorConsoleEncoder(config zapcore.EncoderConfig) zapcore.Encoder {
	return &colorConsoleEncoder{Encoder: zapcore.NewConsoleEncoder(config)}
}

var (
	EncoderHttpMetaKeys []string

	ConsoleSkipKeys = []string{
		// Tracing Keys
		common.KeySpanOtel,
		common.KeySpanUuid,
		common.KeySpanRootUuid,
		common.KeySpanParentUuid,
		common.KeySchedulerJobId,
		common.KeySchedulerActionPath,
		common.KeySchedulerActionTags,
		common.KeySchedulerTaskId,
		// Claims Keys
		common.KeyUsername,
		common.KeyUserUuid,
		common.KeyGroupPath,
		common.KeyProfile,
		common.KeyRoles,
	}

	consoleNamedColors map[string]int
)

// RegisterConsoleNamedColor allows external registration of colors based on Logger Name.
func RegisterConsoleNamedColor(serviceName string, color int) {
	if consoleNamedColors == nil {
		consoleNamedColors = make(map[string]int)
	}
	consoleNamedColors[serviceName] = color
}

// Custom Encoder to skip some specific fields and colorize logger name
type colorConsoleEncoder struct {
	zapcore.Encoder
}

func (c *colorConsoleEncoder) Clone() zapcore.Encoder {
	return &colorConsoleEncoder{Encoder: c.Encoder.Clone()}
}

func (c *colorConsoleEncoder) EncodeEntry(e zapcore.Entry, ff []zapcore.Field) (*buffer.Buffer, error) {
	color := ConsoleColorOther
	if strings.HasPrefix(e.LoggerName, common.ServiceGrpcNamespace_) {
		color = ConsoleColorGrpc
	} else if strings.HasPrefix(e.LoggerName, common.ServiceRestNamespace_) {
		color = ConsoleColorRest
	}
	if consoleNamedColors != nil {
		if col, o := consoleNamedColors[e.LoggerName]; o {
			color = col
		}
	}
	var filtered []zapcore.Field
	for _, f := range ff {
		if slices.Contains(ConsoleSkipKeys, f.Key) || slices.Contains(EncoderHttpMetaKeys, f.Key) {
			continue
		}
		filtered = append(filtered, f)
	}
	e.LoggerName = fmt.Sprintf("\x1b[%dm%s\x1b[0m", color, e.LoggerName)
	return c.Encoder.EncodeEntry(e, filtered)
}
