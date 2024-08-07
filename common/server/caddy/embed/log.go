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

package embed

import (
	"context"
	"io"
	"sync"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/jsonx"
)

func newWriterOpenerModule(loggerPrefix string) caddy.Module {
	return &caddyWriterOpener{
		loggerPrefix: loggerPrefix,
	}
}

type caddyWriterOpener struct {
	loggerPrefix string
}

type writer struct {
	log.ZapLogger
	pool         *sync.Pool
	loggerPrefix string
}

func (w *caddyWriterOpener) String() string {
	return "caddy.logging.writers.cells"
}

// WriterKey is a string that uniquely identifies this
// writer configuration. It is not shown to humans.
func (w *caddyWriterOpener) WriterKey() string {
	return "cells"
}

func (w *caddyWriterOpener) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID: "caddy.logging.writers.cells",
		New: func() caddy.Module {
			return &caddyWriterOpener{}
		},
	}
}

func (w *caddyWriterOpener) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	return nil

}

// OpenWriter opens a log for writing. The writer
// should be safe for concurrent use but need not
// be synchronous.
func (w *caddyWriterOpener) OpenWriter() (io.WriteCloser, error) {
	mainLogger := log.Logger(runtime.AsCoreContext(context.Background()))
	pool := &sync.Pool{
		New: func() interface{} {
			return map[string]interface{}{}
		},
	}
	return &writer{
		ZapLogger:    mainLogger,
		pool:         pool,
		loggerPrefix: w.loggerPrefix,
	}, nil
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
