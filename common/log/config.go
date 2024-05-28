package log

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/manifoldco/promptui"
	"go.uber.org/zap/zapcore"
)

type CfgLogger struct {
	Level    string            `json:"level" yaml:"level"`
	Encoding string            `json:"encoding" yaml:"encoding"`
	Outputs  []string          `json:"writers" yaml:"writers"`
	Filters  map[string]string `json:"filters" yaml:"filters"`
}

type Config []CfgLogger

func DefaultLegacyConfig(level, encoding, logToDir string) Config {
	outputs := []string{
		"stdout:///",
	}
	if logToDir != "" {
		outputs = append(outputs, "file://"+filepath.Join(logToDir, "pydio.log"))
	}
	return Config{{
		Encoding: encoding,
		Level:    level,
		Outputs:  outputs,
	}}
}

func (cfg Config) LoadCores(ctx context.Context) (cores []zapcore.Core, closers []io.Closer, hasDebug bool) {
	closers = []io.Closer{}

	for _, conf := range cfg {
		var ss []zapcore.WriteSyncer
		var presetCores []zapcore.Core
		coreEncoder := conf.Encoder()
		levelEnabler := conf.Enabler()

		if !hasDebug && levelEnabler.Enabled(zapcore.DebugLevel) {
			hasDebug = true
		}

		for _, u := range conf.Outputs {
			if syncer, er := DefaultURLMux().OpenSync(ctx, u); er == nil {
				ss = append(ss, syncer)
				closers = append(closers, syncer)
			} else if custom, er2 := DefaultURLMux().OpenCore(ctx, u, coreEncoder, levelEnabler); er2 == nil {
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
func (c CfgLogger) Encoder() zapcore.Encoder {
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
func (c CfgLogger) Enabler() zapcore.LevelEnabler {

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
func (c CfgLogger) Wrap(core zapcore.Core) zapcore.Core {
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
