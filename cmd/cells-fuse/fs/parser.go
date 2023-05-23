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
	"fmt"
	"io"
	"log"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/hanwen/go-fuse/v2/fs"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func StorageUrlAsProvider(storageURL string) (FileNodeProvider, *snapshot.BoltSnapshot, error) {
	sc, folderOrBucket, snap, e := ParseStorageURL(storageURL)
	if e != nil {
		return nil, nil, e
	}
	var fp FileNodeProvider
	if sc != nil {
		fp = func(inode uint64, treeNode *tree.Node) fs.InodeEmbedder {
			return &fileS3{
				bucketName: folderOrBucket,
				mc:         sc,
				snapNode: snapNode{
					Inode: &fs.Inode{},
					ino:   inode,
					Node:  treeNode,
				},
			}
		}
	} else {
		fp = func(inode uint64, treeNode *tree.Node) fs.InodeEmbedder {
			return &fileLocal{
				snapNode: snapNode{
					Inode: &fs.Inode{},
					ino:   inode,
					Node:  treeNode,
				},
				baseFolder: folderOrBucket,
			}
		}
	}

	return fp, snap, nil
}

func ParseStorageURL(storageUrl string) (sc nodes.StorageClient, folderOrBucket string, snap *snapshot.BoltSnapshot, e error) {
	u, ee := url.Parse(storageUrl)
	if ee != nil {
		e = ee
		return
	}
	tmpSnapFolder := os.TempDir()
	tmpSnapUuid := uuid.New() + ".db"
	var snReader io.Reader

	switch u.Scheme {
	case "file":

		// Copy snapshot to snapshot-uuid.db
		sn, er := os.OpenFile(u.Path, os.O_RDONLY, 0755)
		if er != nil {
			e = er
			return
		}
		defer sn.Close()
		snReader = sn
		folderOrBucket = filepath.Dir(u.Path)

	case "s3", "s3s":
		cfg := configx.New()
		_ = cfg.Val("endpoint").Set(u.Host)
		_ = cfg.Val("key").Set(u.User.Username())
		pass, _ := u.User.Password()
		_ = cfg.Val("secret").Set(pass)
		if u.Scheme == "s3s" {
			_ = cfg.Val("secure").Set(true)
		}
		_ = cfg.Val("type").Set("mc")
		scl, er := nodes.NewStorageClient(cfg)
		if er != nil {
			e = er
			return
		}
		sc = scl
		bucket, snapName := path.Split(u.Path)
		folderOrBucket = strings.Trim(bucket, "/")
		snReader, _, e = sc.GetObject(context.Background(), folderOrBucket, snapName, models.ReadMeta{})
		if e != nil {
			return
		}

	default:
		e = fmt.Errorf("unrecognized scheme")
		return
	}

	target, er := os.OpenFile(filepath.Join(tmpSnapFolder, "snapshot-"+tmpSnapUuid), os.O_CREATE|os.O_WRONLY, 0755)
	if er != nil {
		e = er
		return
	}
	io.Copy(target, snReader)
	_ = target.Close()

	log.Println("Open snapshot", tmpSnapFolder, tmpSnapUuid)
	snap, e = snapshot.NewBoltSnapshot(tmpSnapFolder, tmpSnapUuid)
	if e != nil {
		return
	}
	return
}
