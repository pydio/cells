/*
 * Copyright (c) 2019-2022 Abstrium SAS <team (at) pydio.com>
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

package filex

import (
	"fmt"
	"path/filepath"
	"time"

	"encoding/binary"
	"github.com/bep/debounce"
	bolt "go.etcd.io/bbolt"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config/revisions"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	versionsBucket = []byte("versions")
)

// BoltStore is a BoltDB implementation of the Store interface
type BoltStore struct {
	FileName  string
	debouncer func(f func())
	versions  chan *revisions.Version
}

// NewStore opens a new store
func NewStore(configDir string, debounceTime ...time.Duration) revisions.Store {
	filename := filepath.Join(configDir, "configs-versions.db")
	bs := &BoltStore{
		FileName: filename,
		versions: make(chan *revisions.Version, 100),
	}
	if len(debounceTime) > 0 {
		bs.debouncer = debounce.New(debounceTime[0])
	}
	return bs
}

func (b *BoltStore) GetConnection(readOnly bool) (*bolt.DB, error) {
	options := bolt.DefaultOptions
	options.Timeout = 10 * time.Second
	options.ReadOnly = readOnly
	db, err := bolt.Open(b.FileName, 0644, options)
	if err != nil {
		return nil, err
	}

	if !readOnly {
		err = db.Update(func(tx *bolt.Tx) error {
			_, e := tx.CreateBucketIfNotExists(versionsBucket)
			return e
		})
		if err != nil {
			return nil, err
		}
	}
	return db, nil
}

// put stores version in Bolt
func (b *BoltStore) flush() {
	db, err := b.GetConnection(false)
	if err != nil {
		// TODO logs
		fmt.Println("[Configs Versions] no connection", zap.Error(err))
		return
	}
	defer db.Close()
	if err := db.Update(func(tx *bolt.Tx) error {
		for {
			select {
			case version := <-b.versions:
				bucket := tx.Bucket(versionsBucket)
				objectId, _ := bucket.NextSequence()
				version.Id = objectId

				objectKey := make([]byte, 8)
				binary.BigEndian.PutUint64(objectKey, objectId)

				data, _ := json.Marshal(version)
				if err := bucket.Put(objectKey, data); err != nil {
					return err
				}
			case <-time.After(100 * time.Millisecond):
				return nil
			}
		}
	}); err != nil {
		fmt.Println("[Configs Versions] could not update", zap.Error(err))
	}
}

func (b *BoltStore) Put(version *revisions.Version) error {
	b.versions <- version
	if b.debouncer != nil {
		b.debouncer(b.flush)
	} else {
		b.flush()
	}
	return nil
}

// List lists all version starting at a given id
func (b *BoltStore) List(offset uint64, limit uint64) (result []*revisions.Version, err error) {

	db, er := b.GetConnection(true)
	if er != nil {
		err = er
		return
	}
	defer db.Close()

	err = db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket(versionsBucket)
		c := bucket.Cursor()
		var count uint64
		if offset > 0 {
			offsetKey := make([]byte, 8)
			binary.BigEndian.PutUint64(offsetKey, offset)
			c.Seek(offsetKey)
			for k, v := c.Seek(offsetKey); k != nil; k, v = c.Prev() {
				var version revisions.Version
				if e := json.Unmarshal(v, &version); e == nil {
					result = append(result, &version)
				}
				count++
				if count >= limit {
					break
				}
			}
		} else {
			for k, v := c.Last(); k != nil; k, v = c.Prev() {
				var version revisions.Version
				if e := json.Unmarshal(v, &version); e == nil {
					result = append(result, &version)
				}
				count++
				if count >= limit {
					break
				}
			}
		}
		return nil
	})

	return
}

// Retrieve loads data from db by version ID
func (b *BoltStore) Retrieve(id uint64) (*revisions.Version, error) {
	db, err := b.GetConnection(true)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	var version revisions.Version
	objectKey := make([]byte, 8)
	binary.BigEndian.PutUint64(objectKey, id)
	e := db.View(func(tx *bolt.Tx) error {
		data := tx.Bucket(versionsBucket).Get(objectKey)
		return json.Unmarshal(data, &version)
	})
	if e != nil {
		return nil, e
	}
	return &version, nil
}
