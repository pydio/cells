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

package log

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/manifoldco/promptui"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/telemetry/otel"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

type LoggerConfig struct {
	Level    string            `json:"level" yaml:"level"`
	Encoding string            `json:"encoding" yaml:"encoding"`
	Outputs  []string          `json:"outputs" yaml:"outputs"`
	Filters  map[string]string `json:"filters,omitempty" yaml:"filters,omitempty"`
}

func DefaultLegacyConfig(level, encoding, logToDir string) []LoggerConfig {
	outputs := []string{
		"stdout:///",
	}
	if logToDir != "" {
		outputs = append(outputs, "file://"+filepath.Join(logToDir, "pydio.log"))
	}
	return []LoggerConfig{{
		Encoding: encoding,
		Level:    level,
		Outputs:  outputs,
	}}
}

func LoadCores(ctx context.Context, svc otel.Service, cfg []LoggerConfig) (cores []zapcore.Core, closers []io.Closer, hasDebug bool) {
	closers = []io.Closer{}

	for _, conf := range cfg {
		var ss []zapcore.WriteSyncer
		var presetCores []zapcore.Core
		levelEnabler := conf.Enabler()

		if !hasDebug && levelEnabler.Enabled(zapcore.DebugLevel) {
			hasDebug = true
		}

		for _, u := range conf.Outputs {
			tpl, e := openurl.URLTemplate(u)
			if e != nil {
				panic(e)
			}
			u, e = tpl.Resolve(ctx)
			if e != nil {
				panic(e)
			}
			fmt.Println("Opening Log Core/Sync with URL", u)
			if syncer, er := DefaultURLMux().OpenSync(ctx, u); er == nil {
				ss = append(ss, syncer)
				closers = append(closers, syncer)
			} else if custom, er2 := DefaultURLMux().OpenCore(ctx, u, levelEnabler, svc); er2 == nil {
				if len(conf.Filters) > 0 {
					presetCores = append(presetCores, conf.Wrap(custom))
				} else {
					presetCores = append(presetCores, custom)
				}
				closers = append(closers, custom)
			} else {
				fmt.Println(er)
			}
		}
		if len(ss) == 0 && len(presetCores) == 0 {
			fmt.Println("ignoring logger as no cores or syncer were initialized")
			continue
		}
		// Append precompiled cores
		if len(presetCores) > 0 {
			cores = append(cores, presetCores...)
		}
		// Create a core for syncers
		if len(ss) > 0 {
			var syncer zapcore.WriteSyncer
			if len(ss) == 1 {
				syncer = ss[0]
			} else {
				syncer = zapcore.NewMultiWriteSyncer(ss...)
			}
			// Create a core with proper encoder, syncers and levels
			core := zapcore.NewCore(conf.Encoder(), syncer, conf.Enabler())
			// Wrap a filtering core if Filters are defined.
			if len(conf.Filters) > 0 {
				core = conf.Wrap(core)
			}
			cores = append(cores, core)
		}
	}

	return
}

// Encoder computes encoder based on textual Encoder key
// Currently supported are "json" and "console"
func (c LoggerConfig) Encoder() zapcore.Encoder {
	var e zapcore.Encoder
	switch c.Encoding {
	case "console":
		e = ConsoleEncoder
	case "json":
		e = JSONEncoder
	default:
		fmt.Println("no encoder set, use JSON by default")
		e = JSONEncoder
	}
	return e
}

// Enabler creates a dynamic enabler based on Level text value.
// Level may contain ">=debug" or "<debug" or "=debug"
// No comparator defaults to ">=", i.e "info" means Info and higher
func (c LoggerConfig) Enabler() zapcore.LevelEnabler {

	var bb []zapcore.LevelEnabler
	for _, search := range strings.Split(c.Level, "&") {
		comp := ""
		var cut int
		var level string
		for _, char := range search {
			if char == '>' || char == '<' || char == '=' {
				cut++
				comp += string(char)
			} else {
				level = search[cut:]
				break
			}
		}
		lev, er := zapcore.ParseLevel(level)
		if er != nil {
			fmt.Println("cannot parse logger level, use INFO instead", er)
			lev = zapcore.InfoLevel
		}
		bb = append(bb, &dynamicEnabler{
			ref:  lev,
			comp: comp,
		})
	}
	if len(bb) == 1 {
		return bb[0]
	} else {
		return &multipleEnabler{ee: bb}
	}

}

// Wrap precomputes a list of matchers if there are k:v filters set
// and wrap the passed core with a filteringCore.
func (c LoggerConfig) Wrap(core zapcore.Core) zapcore.Core {
	if c.Filters == nil || len(c.Filters) == 0 {
		return core
	}
	fmt.Println(promptui.IconWarn + " Wrapping logger with filters. Make sure to use it only in debug mode as it degrades performances.")
	var matchers []matcher
	for k, v := range c.Filters {
		if k == "logger" {
			matchers = append(matchers, func(e zapcore.Entry, field zapcore.Field) bool {
				return v == e.LoggerName
			})
		} else {
			matchers = append(matchers, func(e zapcore.Entry, field zapcore.Field) bool {
				return field.Key == k && field.String == v
			})
		}
	}
	return &filteringCore{
		Core:    core,
		filters: matchers,
	}
}

type multipleEnabler struct {
	ee []zapcore.LevelEnabler
}

func (m *multipleEnabler) Enabled(level zapcore.Level) bool {
	for _, e := range m.ee {
		if !e.Enabled(level) {
			return false
		}
	}
	return true
}

type dynamicEnabler struct {
	ref  zapcore.Level
	comp string
}

func (d *dynamicEnabler) Enabled(l zapcore.Level) bool {
	switch d.comp {
	case "", ">=":
		return l >= d.ref
	case "=":
		return l == d.ref
	case ">":
		return l > d.ref
	case "<":
		return l < d.ref
	case "<=":
		return l <= d.ref
	}
	return true
}

type matcher func(zapcore.Entry, zapcore.Field) bool

type filteringCore struct {
	zapcore.Core
	filters []matcher
}

func (f *filteringCore) apply(e zapcore.Entry, fields []zapcore.Field) bool {
	for _, fi := range fields {
		for _, m := range f.filters {
			if m(e, fi) {
				return true
			}
		}
	}
	return false
}

// Check overrides underlying Check method by adding this wrapper to CheckedEntry cores.
func (f *filteringCore) Check(e zapcore.Entry, ce *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if !f.Enabled(e.Level) {
		return ce
	}
	// Add this *filteringCore*
	return ce.AddCore(e, f)
}

// With overrides underlying With method by returning a wrapped clone or the underlying core if a matching field is
// directly found (no need to recheck when calling Write())
func (f *filteringCore) With(ff []zapcore.Field) zapcore.Core {
	if f.apply(zapcore.Entry{}, ff) {
		return f.Core.With(ff)
	}
	return &filteringCore{
		Core:    f.Core.With(ff),
		filters: f.filters,
	}
}

// Write overrides underlying Write method by checking incoming fields and entry.LoggerName
func (f *filteringCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	if !f.apply(entry, fields) {
		return nil
	}
	return f.Core.Write(entry, fields)
}
