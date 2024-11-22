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

package s3

import (
	"os"
	"path"
	"time"

	"github.com/pydio/cells/v5/common/nodes/models"
)

type fileInfo struct {
	Object models.ObjectInfo
	isDir  bool
}

// Name is the base name of the file
func (s *fileInfo) Name() string {
	if s.isDir {
		return path.Base(s.Object.Key)
	} else {
		return s.Object.Key
	}
}

// Size gets length in bytes for regular files; system-dependent for others
func (s *fileInfo) Size() int64 {
	return s.Object.Size
}

// Mode returns file mode bits
func (s *fileInfo) Mode() os.FileMode {
	if s.isDir {
		return os.ModePerm & os.ModeDir
	} else {
		return os.ModePerm
	}

}

// ModTime retuns modification time
func (s *fileInfo) ModTime() time.Time {
	return s.Object.LastModified
}

// IsDir is an abbreviation for Mode().IsDir()
func (s *fileInfo) IsDir() bool {
	return s.isDir
}

// Sys returns underlying data source (can return nil)
func (s *fileInfo) Sys() interface{} {
	return s.Object
}

func newFileInfo(object models.ObjectInfo) *fileInfo {
	return &fileInfo{
		Object: object,
		isDir:  false,
	}
}

func newFolderInfo(object models.ObjectInfo) *fileInfo {
	return &fileInfo{
		Object: object,
		isDir:  true,
	}
}
