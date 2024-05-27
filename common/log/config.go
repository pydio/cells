package log

import (
	"fmt"
	"strings"

	"github.com/manifoldco/promptui"
	"go.uber.org/zap/zapcore"
)

type CfgLogger struct {
	Encoding   string
	Level      string
	Filters    map[string]string
	WritersURL []string
}

type Config []CfgLogger

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
