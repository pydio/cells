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
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"syscall"
	"time"
	"unsafe"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

func CanonicalPath(path string) (string, error) {
	// Remove any leading slash/backslash
	path = strings.TrimLeft(path, "/\\")
	p, e := filepath.EvalSymlinks(path)
	if e != nil {
		return path, e
	}
	// Make sure drive letter is lowerCase
	volume := filepath.VolumeName(p)
	if strings.HasSuffix(volume, ":") {
		path = strings.ToLower(volume) + strings.TrimPrefix(p, volume)
	}

	return path, nil
}

func SetHidden(osPath string, hidden bool) error {
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

func BrowseVolumes(ctx context.Context) (volumes []*tree.Node) {
	h := syscall.MustLoadDLL("kernel32.dll")
	doneChan := make(chan string, 1)

	for _, drive := range "ABCDEFGHIJKLMNOPQRSTUVWXYZ" {
		go func() {
			driveLetter := string(drive) + ":"
			_, err := os.Open(driveLetter)
			if err == nil {
				doneChan <- ""
			}
		}()

		select {
		case <-doneChan:
			c := h.MustFindProc("GetDiskFreeSpaceExW")
			var freeBytes uint64
			rootDrive := string(drive) + ":"
			_, _, _ = c.Call(uintptr(unsafe.Pointer(syscall.StringToUTF16Ptr(rootDrive))), uintptr(unsafe.Pointer(&freeBytes)), 0, 0)

			log.Logger(ctx).Info("detected volume " + strings.ToUpper(string(drive)))
			volumes = append(volumes, &tree.Node{
				Uuid: fmt.Sprintf("%c-drive", drive),
				Path: fmt.Sprintf("%c:/", drive),
				Type: tree.NodeType_COLLECTION,
				Size: int64(freeBytes),
			})
		case <-time.After(time.Millisecond * 10):
		}
	}
	return
}

func ToFilePath(nodePath string) string {
	path := strings.TrimLeft(nodePath, "/")
	return strings.Replace(path, "/", "\\", -1)
}

func ToNodePath(p string) string {
	//path := "/" + strings.ToUpper(p[0:1])
	path := strings.Replace(p, "\\", "/", -1)
	path = strings.Replace(path, "//", "/", -1)
	return path
}
