package caddy

import (
	"context"
	"io"
	"sync"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/utils/jsonx"
)

type writerOpener struct {
}

type writer struct {
	log.ZapLogger
	pool *sync.Pool
}

func (w *writerOpener) String() string {
	return "caddy.logging.writers.cells"
}

// WriterKey is a string that uniquely identifies this
// writer configuration. It is not shown to humans.
func (w *writerOpener) WriterKey() string {
	return "cells"
}

func (w *writerOpener) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID: "caddy.logging.writers.cells",
		New: func() caddy.Module {
			return &writerOpener{}
		},
	}
}

func (w *writerOpener) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	return nil

}

// OpenWriter opens a log for writing. The writer
// should be safe for concurrent use but need not
// be synchronous.
func (w *writerOpener) OpenWriter() (io.WriteCloser, error) {
	mainLogger := log.Logger(context.Background())
	pool := &sync.Pool{
		New: func() interface{} {
			return map[string]interface{}{}
		},
	}
	return &writer{ZapLogger: mainLogger, pool: pool}, nil
}

func (w *writer) Write(p []byte) (n int, err error) {
	line := w.pool.Get().(map[string]interface{})
	clear(line)
	defer w.pool.Put(line)
	if e := jsonx.Unmarshal(p, &line); e == nil {
		var name, msg, level string
		var other []zap.Field
		for k, v := range line {
			switch k {
			case "logger":
				name = v.(string)
			case "level":
				level = v.(string)
			case "msg":
				msg = v.(string)
			case "ts":
				continue
			default:
				other = append(other, zap.Any(k, v))
			}
		}
		if msg != "" && name != "" {
			parent := w.Named("pydio.caddy." + name)
			switch level {
			case "error":
				parent.Error(msg, other...)
			case "info":
				parent.Info(msg, other...)
			case "warn":
				parent.Warn(msg, other...)
			case "debug":
				parent.Debug(msg, other...)
			default:
				parent.Debug(msg, other...)
			}
		}
	}
	return len(p), nil
}

func (w *writer) Close() error {
	return nil
}
