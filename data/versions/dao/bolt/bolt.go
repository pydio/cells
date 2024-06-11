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

package bolt

import (
	"context"
	"encoding/binary"

	"go.etcd.io/bbolt"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/data/versions"
)

var (
	bucketName = []byte("versions")
)

func init() {
	versions.Drivers.Register(NewBoltStore)
}

type BoltStore struct {
	*bbolt.DB
}

func NewBoltStore(db *bbolt.DB) (versions.DAO, error) {

	bs := &BoltStore{
		DB: db,
	}

	e2 := bs.Update(func(tx *bbolt.Tx) error {
		_, e := tx.CreateBucketIfNotExists(bucketName)
		return e
	})
	return bs, e2

}

func (b *BoltStore) Close() error {
	err := b.Close()
	return err
}

// GetLastVersion retrieves the last version registered for this node.
func (b *BoltStore) GetLastVersion(nodeUuid string) (log *tree.ChangeLog, err error) {

	err = b.View(func(tx *bbolt.Tx) error {

		bucket := tx.Bucket(bucketName)
		if bucket == nil {
			return errors.WithStack(errors.BucketNotFound)
		}
		nodeBucket := bucket.Bucket([]byte(nodeUuid))
		if nodeBucket == nil {
			// Ignore not found
			return nil
		}
		c := nodeBucket.Cursor()
		_, v := c.Last()
		theLog := &tree.ChangeLog{}
		e := proto.Unmarshal(v, theLog)
		if e != nil {
			return e
		}
		log = theLog
		return nil
	})

	return log, err
}

// GetVersions returns all versions from the node bucket, in reverse order (last inserted first).
func (b *BoltStore) GetVersions(nodeUuid string) (chan *tree.ChangeLog, error) {

	logChan := make(chan *tree.ChangeLog)

	go func() {
		defer func() {
			close(logChan)
		}()
		e := b.View(func(tx *bbolt.Tx) error {

			bucket := tx.Bucket(bucketName)
			if bucket == nil {
				return errors.WithStack(errors.BucketNotFound)
			}
			nodeBucket := bucket.Bucket([]byte(nodeUuid))
			if nodeBucket == nil {
				return errors.WithStack(errors.BucketNotFound)
			}
			c := nodeBucket.Cursor()

			for k, v := c.Last(); k != nil; k, v = c.Prev() {
				aLog := &tree.ChangeLog{}
				e := proto.Unmarshal(v, aLog)
				if e != nil {
					return e
				}
				log.Logger(context.Background()).Debug("Versions:Bolt", aLog.Zap())
				logChan <- aLog
			}

			return nil
		})
		if e != nil {
			log.Logger(runtime.WithServiceName(context.Background(), common.ServiceGrpcNamespace_+common.ServiceVersions)).Warn("ListVersions", zap.Error(e))
		}

	}()

	return logChan, nil
}

// StoreVersion stores a version in the node bucket.
func (b *BoltStore) StoreVersion(nodeUuid string, log *tree.ChangeLog) error {

	return b.Update(func(tx *bbolt.Tx) error {

		bucket := tx.Bucket(bucketName)
		if bucket == nil {
			return errors.WithStack(errors.BucketNotFound)
		}
		nodeBucket, err := bucket.CreateBucketIfNotExists([]byte(nodeUuid))
		if err != nil {
			return err
		}
		newValue, e := proto.Marshal(log)
		if e != nil {
			return e
		}

		objectKey, _ := nodeBucket.NextSequence()
		k := make([]byte, 8)
		binary.BigEndian.PutUint64(k, objectKey)
		return nodeBucket.Put(k, newValue)

	})
}

// GetVersion retrieves a specific version from the node bucket.
func (b *BoltStore) GetVersion(nodeUuid string, versionId string) (*tree.ChangeLog, error) {

	version := &tree.ChangeLog{}

	b.View(func(tx *bbolt.Tx) error {

		bucket := tx.Bucket(bucketName)
		if bucket == nil {
			return errors.WithStack(errors.BucketNotFound)
		}
		nodeBucket := bucket.Bucket([]byte(nodeUuid))
		if nodeBucket == nil {
			return nil
		}

		c := nodeBucket.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			vers := &tree.ChangeLog{}
			if e := proto.Unmarshal(v, vers); e == nil && vers.Uuid == versionId {
				version = vers
				break
			}
		}
		return nil
	})

	return version, nil
}

// DeleteVersionsForNode deletes whole node bucket at once.
func (b *BoltStore) DeleteVersionsForNode(nodeUuid string, versions ...*tree.ChangeLog) error {

	return b.Update(func(tx *bbolt.Tx) error {

		bucket := tx.Bucket(bucketName)
		if bucket == nil {
			return errors.WithStack(errors.BucketNotFound)
		}
		nodeBucket := bucket.Bucket([]byte(nodeUuid))
		if nodeBucket != nil {
			if len(versions) > 0 { // delete some specific versions
				c := nodeBucket.Cursor()
				var keys [][]byte
				for k, v := c.First(); k != nil; k, v = c.Next() {
					vers := &tree.ChangeLog{}
					if e := proto.Unmarshal(v, vers); e == nil {
						for _, version := range versions {
							if vers.Uuid == version.Uuid {
								keys = append(keys, k)
							}
						}
					}
				}
				for _, key := range keys {
					nodeBucket.Delete(key)
				}

			} else { // delete whole bucket
				return bucket.DeleteBucket([]byte(nodeUuid))
			}
		}
		return nil
	})
}

// DeleteVersionsForNodes delete versions in a batch
func (b *BoltStore) DeleteVersionsForNodes(nodeUuid []string) error {
	er := b.Batch(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketName)
		for _, uuid := range nodeUuid {
			bucket.DeleteBucket([]byte(uuid))
		}
		return nil
	})
	return er
}

// ListAllVersionedNodesUuids lists all nodes uuids
func (b *BoltStore) ListAllVersionedNodesUuids() (chan string, chan bool, chan error) {
	idsChan := make(chan string)
	done := make(chan bool, 1)
	errChan := make(chan error)

	go func() {

		e := b.View(func(tx *bbolt.Tx) error {

			defer func() {
				done <- true
				close(done)
			}()
			bucket := tx.Bucket(bucketName)
			if bucket == nil {
				return errors.WithStack(errors.BucketNotFound)
			}
			c := bucket.Cursor()
			for k, _ := c.First(); k != nil; k, _ = c.Next() {
				key := string(k)
				idsChan <- key
			}

			return nil
		})
		if e != nil {
			errChan <- e
		}

	}()

	return idsChan, done, errChan
}
