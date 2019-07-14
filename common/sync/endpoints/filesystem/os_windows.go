/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"path/filepath"
	"syscall"
)

func (c *FSClient) SetHidden(relativePath string, hidden bool) error {
	osPath := filepath.Join(c.RootPath, relativePath)
	p, err := syscall.UTF16PtrFromString(osPath)
	if err != nil {
		return err
	}
	attrs, err := syscall.GetFileAttributes(p)
	if err != nil {
		return err
	}
	if hidden {
		attrs |= syscall.FILE_ATTRIBUTE_HIDDEN
	} else {
		attrs &^= syscall.FILE_ATTRIBUTE_HIDDEN
	}
	return syscall.SetFileAttributes(p, attrs)
}
