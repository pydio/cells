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
	"time"

	"github.com/hanwen/go-fuse/v2/fs"
	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

type ReferenceBolt struct {
	*snapshot.BoltSnapshot
	bPath string
}

func (r *ReferenceBolt) CloseAndClear() error {
	r.Close()
	return os.RemoveAll(r.bPath)
}

func StorageUrlAsProvider(storageURL string) (FileNodeProvider, *ReferenceBolt, int, error) {
	sc, folderOrBucket, snap, keys, e := ParseStorageURL(storageURL)
	if e != nil {
		return nil, nil, 0, e
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

	return fp, snap, keys, nil
}

func ParseStorageURL(storageUrl string) (sc nodes.StorageClient, folderOrBucket string, snap *ReferenceBolt, totalKeys int, e error) {
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

	snFile := filepath.Join(tmpSnapFolder, "snapshot-"+tmpSnapUuid)
	log.Println("Copying snapshot to temporary location", snFile)
	target, er := os.OpenFile(snFile, os.O_CREATE|os.O_WRONLY, 0755)
	if er != nil {
		e = er
		return
	}
	if _, e = io.Copy(target, snReader); e != nil {
		return
	}
	_ = target.Close()

	log.Println("Pre-open DB to get total nodes count")
	options := bbolt.DefaultOptions
	options.Timeout = 5 * time.Second
	db, err := bbolt.Open(snFile, 0644, options)
	if err != nil {
		e = err
		return
	}
	e = db.View(func(tx *bbolt.Tx) error {
		bk := tx.Bucket([]byte("snapshot"))
		if bk == nil {
			return fmt.Errorf("cannot find bucket in snapshot")
		}
		totalKeys = bk.Stats().KeyN
		return nil
	})
	_ = db.Close()

	log.Printf("Now Opening snapshot %s, should load %d nodes", snFile, totalKeys)
	sn, e := snapshot.NewBoltSnapshot(tmpSnapFolder, tmpSnapUuid)
	if e != nil {
		return
	}
	snap = &ReferenceBolt{
		BoltSnapshot: sn,
		bPath:        filepath.Join(tmpSnapFolder, "snapshot-"+tmpSnapUuid),
	}
	return
}
