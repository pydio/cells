/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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

package fs

import (
	"context"
	"io"
	"log"
	"os"
	"path/filepath"
	"syscall"

	"github.com/hanwen/go-fuse/v2/fs"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
)

type fileS3 struct {
	snapNode
	mc         nodes.StorageClient
	bucketName string
	cached     string
	cacheSet   func(string)
}

func (c *fileS3) Open(ctx context.Context, flags uint32) (fh fs.FileHandle, fuseFlags uint32, errno syscall.Errno) {
	if c.cached == "" {
		c.cached = filepath.Join(os.TempDir(), c.GetUuid())
		log.Println("Caching a copy for file " + c.cached)
		tgt, er := os.OpenFile(c.cached, os.O_WRONLY|os.O_CREATE, 0755)
		if er != nil {
			return nil, 0, fs.ToErrno(er)
		}
		reader, _, er := c.mc.GetObject(ctx, c.bucketName, c.GetUuid(), models.ReadMeta{})
		if er != nil {
			log.Println("[ERROR] Cannot read from remote", er)
			_ = tgt.Close()
			return nil, 0, fs.ToErrno(er)
		}
		_, er = io.Copy(tgt, reader)
		_ = tgt.Close()
		_ = reader.Close()
		if er != nil {
			log.Println("[ERROR] Cannot copy file to cache", er)
			return nil, 0, fs.ToErrno(er)
		}
		cacheEntries = append(cacheEntries, c.cached)
	}
	// Now reopen cached
	fd, err := syscall.Open(c.cached, int(flags), 0644)
	if err != nil {
		return nil, 0, fs.ToErrno(err)
	}
	return fs.NewLoopbackFile(fd), 0, 0
}
