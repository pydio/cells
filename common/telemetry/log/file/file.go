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

package file

import (
	"context"
	"net/url"
	"strconv"

	lumberjack "gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/v5/common/telemetry/log"
)

func init() {
	log.DefaultURLMux().RegisterSync("file", &op{})
}

type op struct{}

func (o *op) OpenSync(ctx context.Context, u *url.URL) (log.WriteSyncerCloser, error) {
	lj := &lumberjack.Logger{
		Filename:   u.Path,
		MaxSize:    10, // megabytes
		MaxBackups: 100,
		MaxAge:     28, // days
		Compress:   false,
	}
	params := u.Query()
	if s := params.Get("maxSize"); s != "" {
		if i, e := strconv.Atoi(s); e == nil {
			lj.MaxSize = i
		}
	}
	if s := params.Get("maxBackups"); s != "" {
		if i, e := strconv.Atoi(s); e == nil {
			lj.MaxBackups = i
		}
	}
	if s := params.Get("maxAge"); s != "" {
		if i, e := strconv.Atoi(s); e == nil {
			lj.MaxAge = i
		}
	}
	if s := params.Get("compress"); s == "true" {
		lj.Compress = true
	}
	return &wrapper{Logger: lj}, nil

}

type wrapper struct {
	*lumberjack.Logger
}

func (w *wrapper) Sync() (err error) {
	return nil
}
