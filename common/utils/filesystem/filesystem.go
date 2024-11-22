//go:build !windows
// +build !windows

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

package filesystem

import (
	"context"

	"github.com/pydio/cells/v5/common/proto/tree"
)

func CanonicalPath(path string) (string, error) {
	return path, nil
}

func SetHidden(osPath string, hidden bool) error {
	return nil
}

func BrowseVolumes(ctx context.Context) []*tree.Node {
	return nil
}

func ToFilePath(nodePath string) string {
	return nodePath
}

func ToNodePath(p string) string {
	return p
}
