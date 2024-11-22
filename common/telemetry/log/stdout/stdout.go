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

package stdout

import (
	"context"
	"fmt"
	"net/url"
	"os"

	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common/telemetry/log"
)

func init() {
	log.DefaultURLMux().RegisterSync("stdout", &opener{})
	log.DefaultURLMux().RegisterSync("err", &opener{})
}

type opener struct{}

func (o *opener) OpenSync(ctx context.Context, u *url.URL) (log.WriteSyncerCloser, error) {
	if u.Scheme == "stdout" {
		log.StdOut = os.Stdout
		return &wrapper{log.StdOut}, nil
	} else if u.Scheme == "stderr" {
		return &wrapper{os.Stderr}, nil
	} else {
		return nil, fmt.Errorf("unsupported WriteSyncer scheme %s", u.Scheme)
	}
}

type wrapper struct {
	zapcore.WriteSyncer
}

func (w *wrapper) Close() error {
	return nil
}
