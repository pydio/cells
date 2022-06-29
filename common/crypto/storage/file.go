/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package storage

import (
	"context"
	"net/url"
	"os"

	"github.com/caddyserver/certmagic"
)

func init() {
	defaultURLMux.Register("file", &fileProvider{})
}

type fileProvider struct{}

// OpenURL opens a file-based implementation of certmagic.Storage. URL Path is used as a file path.
func (f *fileProvider) OpenURL(ctx context.Context, u *url.URL) (certmagic.Storage, error) {
	location := u.Path
	if er := os.MkdirAll(location, 0755); er != nil {
		return nil, er
	}
	return &certmagic.FileStorage{Path: location}, nil
}
