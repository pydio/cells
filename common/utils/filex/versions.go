package filex

import (
	"fmt"
	"path/filepath"
	"time"

	"go.uber.org/zap"

	"encoding/binary"

	"github.com/bep/debounce"
	bolt "go.etcd.io/bbolt"

	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	versionsBucket = []byte("versions")
)

// Version is a structure for encapsulating a new version of configs with additional metadata
type Version struct {
	Id   uint64
	Date time.Time
	User string
	Log  string
	Data interface{}
}

// VersionsStore is the interface for storing and listing configs versions
type VersionsStore interface {
	Put(version *Version) error
	List(offset uint64, limit uint64) ([]*Version, error)
	Retrieve(id uint64) (*Version, error)
}

// BoltStore is a BoltDB implementation of the Store interface
type BoltStore struct {
	FileName  string
	debouncer func(f func())
	versions  chan *Version
}

// NewStore opens a new store
func NewStore(configDir string, debounceTime ...time.Duration) VersionsStore {
	filename := filepath.Join(configDir, "configs-versions.db")
	bs := &BoltStore{
		FileName: filename,
		versions: make(chan *Version, 100),
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

func (b *BoltStore) Put(version *Version) error {
	b.versions <- version
	if b.debouncer != nil {
		b.debouncer(b.flush)
	} else {
		b.flush()
	}
	return nil
}

// List lists all version starting at a given id
func (b *BoltStore) List(offset uint64, limit uint64) (result []*Version, err error) {

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
				var version Version
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
				var version Version
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
func (b *BoltStore) Retrieve(id uint64) (*Version, error) {
	db, err := b.GetConnection(true)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	var version Version
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
