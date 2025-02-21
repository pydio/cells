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
	"fmt"
	"slices"

	"go.etcd.io/bbolt"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/storage/boltdb"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/data/versions"
)

var (
	bucketName = []byte("versions")
)

func init() {
	versions.Drivers.Register(NewBoltStore)
}

type BoltStore struct {
	boltdb.DB
}

func NewBoltStore(db boltdb.DB) versions.DAO {
	return &BoltStore{
		DB: db,
	}
}

func (b *BoltStore) Migrate(ctx context.Context) error {
	return b.Update(func(tx *bbolt.Tx) error {
		_, e := tx.CreateBucketIfNotExists(bucketName)
		return e
	})
}

func (b *BoltStore) Close() error {
	err := b.Close()
	return err
}

// GetLastVersion retrieves the last version registered for this node.
func (b *BoltStore) GetLastVersion(ctx context.Context, nodeUuid string) (log *tree.ContentRevision, err error) {

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
		var er error
		log, er = b.unmarshalRevision(v)
		return er
	})

	return log, err
}

// GetVersions returns all versions from the node bucket, in reverse order (last inserted first).
func (b *BoltStore) GetVersions(ctx context.Context, nodeUuid string, offset int64, limit int64, sortField string, sortDesc bool, filters map[string]any) (chan *tree.ContentRevision, error) {

	logChan := make(chan *tree.ContentRevision)
	var filterByType string
	var filterByOwnerUuid string
	for k, v := range filters {
		switch k {
		case "draftStatus":
			filterByType = v.(string)
		case "ownerUuid":
			filterByOwnerUuid = v.(string)
		}
	}

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
				return nil
			}
			c := nodeBucket.Cursor()

			for k, v := c.Last(); k != nil; k, v = c.Prev() {
				cr, e := b.unmarshalRevision(v)
				if e != nil {
					return e
				}
				if (filterByType == "draft" && !cr.Draft) || filterByType == "published" && cr.Draft {
					continue
				}
				if filterByOwnerUuid != "" && cr.OwnerUuid != filterByOwnerUuid {
					continue
				}
				logChan <- cr
			}

			return nil
		})
		if e != nil {
			log.Logger(runtime.WithServiceName(ctx, common.ServiceGrpcNamespace_+common.ServiceVersions)).Warn("ListVersions", zap.Error(e))
		}

	}()

	return logChan, nil
}

// StoreVersion stores a version in the node bucket.
func (b *BoltStore) StoreVersion(ctx context.Context, nodeUuid string, revision *tree.ContentRevision) error {

	return b.Update(func(tx *bbolt.Tx) error {

		bucket := tx.Bucket(bucketName)
		if bucket == nil {
			return errors.WithStack(errors.BucketNotFound)
		}
		nodeBucket, err := bucket.CreateBucketIfNotExists([]byte(nodeUuid))
		if err != nil {
			return err
		}
		newValue, e := proto.Marshal(revision)
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
func (b *BoltStore) GetVersion(ctx context.Context, nodeUuid string, versionId string) (*tree.ContentRevision, error) {

	var version *tree.ContentRevision

	err := b.View(func(tx *bbolt.Tx) error {

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
			if cr, er := b.unmarshalRevision(v); er != nil {
				return er
			} else if cr.VersionId == versionId {
				version = cr
				break
			}
		}
		return nil
	})
	if version == nil {
		err = errors.WithMessage(errors.VersionNotFound, "cannot find version "+versionId)
	}
	return version, err
}

// DeleteVersionsForNode deletes whole node bucket at once.
func (b *BoltStore) DeleteVersionsForNode(ctx context.Context, nodeUuid string, versions ...string) error {

	return b.Update(func(tx *bbolt.Tx) error {

		bucket := tx.Bucket(bucketName)
		if bucket == nil {
			return errors.WithStack(errors.BucketNotFound)
		}
		nodeBucket := bucket.Bucket([]byte(nodeUuid))
		var ee []error
		if nodeBucket != nil {
			if len(versions) > 0 { // delete some specific versions
				c := nodeBucket.Cursor()
				var keys [][]byte
				for k, v := c.First(); k != nil; k, v = c.Next() {
					if cr, er := b.unmarshalRevision(v); er == nil {
						if slices.Contains(versions, cr.VersionId) {
							keys = append(keys, k)
						}
					}
				}
				for _, key := range keys {
					ee = append(ee, nodeBucket.Delete(key))
				}
			} else { // delete whole bucket
				return bucket.DeleteBucket([]byte(nodeUuid))
			}
		}
		return multierr.Combine(ee...)
	})
}

// DeleteVersionsForNodes delete versions in a batch
func (b *BoltStore) DeleteVersionsForNodes(ctx context.Context, nodeUuid []string) error {
	er := b.Batch(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketName)
		var ee []error
		for _, uuid := range nodeUuid {
			ee = append(ee, bucket.DeleteBucket([]byte(uuid)))
		}
		return multierr.Combine(ee...)
	})
	return er
}

// ListAllVersionedNodesUuids lists all nodes uuids
func (b *BoltStore) ListAllVersionedNodesUuids(ctx context.Context) (chan string, chan bool, chan error) {
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

func (b *BoltStore) unmarshalRevision(bb []byte) (r *tree.ContentRevision, e error) {
	r = &tree.ContentRevision{}
	if er := proto.Unmarshal(bb, r); er == nil && (r.Event != nil || r.Location != nil) {
		return r, nil
	}
	// LegacyFormat
	cLog := &tree.ChangeLog{}
	if er := proto.Unmarshal(bb, cLog); er == nil {
		return &tree.ContentRevision{
			VersionId:   cLog.Uuid,
			Description: cLog.Description,
			MTime:       cLog.MTime,
			Size:        cLog.Size,
			ETag:        string(cLog.Data),
			OwnerName:   cLog.OwnerUuid, // This is normal
			Event:       cLog.Event,
			Location:    cLog.Location,
		}, nil
	}
	return nil, fmt.Errorf("invalid format (tree.ContentRevision or tree.ChangeLog expected)")
}
