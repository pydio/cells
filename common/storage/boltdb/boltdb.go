package boltdb

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/pkg/errors"
	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	_ storage.Storage = (*boltdbStorage)(nil)
)

func init() {
	storage.DefaultURLMux().Register("boltdb", &boltdbStorage{})
}

type boltdb struct {
	path   string
	db     *bbolt.DB
	closed bool
}

type boltdbStorage struct {
	template openurl.Template
	dbs      []*boltdb
}

func (s *boltdbStorage) OpenURL(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(urlstr)
	if err != nil {
		return nil, err
	}

	return &boltdbStorage{
		template: t,
	}, nil
}

func (s *boltdbStorage) boltFromCache(ctx context.Context) (*boltdb, error) {

	u, err := s.template.ResolveURL(ctx)
	if err != nil {
		return nil, err
	}
	path := u.String()

	for _, db := range s.dbs {
		if db.path == path {
			if db.closed {
				return nil, fmt.Errorf("boltdb already closed")
			}
			return db, nil
		}
	}

	// If not found, create one
	options := bbolt.DefaultOptions
	options.Timeout = 20 * time.Second
	var defaultMode os.FileMode
	// TODO Recheck : was 0600 in v4
	defaultMode = 0644

	q := u.Query()
	if q.Has("timeout") {
		if timeout, err := time.ParseDuration(q.Get("timeout")); err != nil {
			options.Timeout = timeout
		}
	}

	conn, err := bbolt.Open(strings.TrimPrefix(path, "boltdb://"), defaultMode, options)
	if err != nil {
		return nil, err
	}

	cacheEntry := &boltdb{
		db:   conn,
		path: path,
	}

	s.dbs = append(s.dbs, cacheEntry)

	return cacheEntry, nil
}

func (s *boltdbStorage) Get(ctx context.Context, out interface{}) (bool, error) {

	if v, ok := out.(**bbolt.DB); ok {

		if cacheEntry, err := s.boltFromCache(ctx); err == nil {
			*v = cacheEntry.db
			return true, nil
		} else {
			return true, err
		}

	} else if c, is := out.(**Compacter); is {

		if cacheEntry, err := s.boltFromCache(ctx); err == nil {
			*c = &Compacter{
				DB: cacheEntry.db,
				requireClose: func() error {
					if er := cacheEntry.db.Close(); er != nil {
						return er
					} else {
						cacheEntry.closed = true
						return nil
					}
				},
				switchConnection: func(newDB *bbolt.DB) error {
					cacheEntry.closed = false
					cacheEntry.db = newDB
					return nil
				},
			}
			return true, nil
		} else {
			return true, err
		}

	}

	return false, nil
}

func (s *boltdbStorage) CloseConns(ctx context.Context, clean ...bool) (er error) {
	for _, db := range s.dbs {
		fsPath := db.db.Path()
		fmt.Println("closing " + db.path)
		if er := db.db.Close(); er != nil {
			return er
		}
		if len(clean) > 0 && clean[0] {
			fmt.Println("removing " + fsPath)
			if e := os.RemoveAll(db.db.Path()); e != nil {
				return e
			}
		}
	}
	return nil
}

type Compacter struct {
	*bbolt.DB
	requireClose     func() error
	switchConnection func(newDB *bbolt.DB) error
}

func (c *Compacter) Compact(ctx context.Context, opts map[string]interface{}) (old uint64, new uint64, err error) {

	p := c.Path()
	if st, e := os.Stat(p); e == nil {
		old = uint64(st.Size())
	}
	dir, base := filepath.Split(p)
	ext := filepath.Ext(base)
	base = strings.TrimSuffix(base, ext)
	keepBackup := true
	if opts != nil {
		if cb, ok := opts["ClearBackup"]; ok {
			if c, o := cb.(bool); o && c {
				keepBackup = false
			}
		}
	}

	copyPath := filepath.Join(dir, base+"-compact-copy"+ext)
	log.TasksLogger(ctx).Info("Defragment DB in " + copyPath)
	copyDB, e := bbolt.Open(copyPath, 0600, &bbolt.Options{Timeout: 5 * time.Second})
	if e != nil {
		return 0, 0, errors.Wrap(e, "opening copy")
	}
	if e := copyDB.Update(func(txW *bbolt.Tx) error {
		return c.View(func(txR *bbolt.Tx) error {
			return txR.ForEach(func(name []byte, b *bbolt.Bucket) error {
				log.TasksLogger(ctx).Info("Copying Bucket" + string(name))
				bW, e := txW.CreateBucketIfNotExists(name)
				if e != nil {
					return e
				}
				return copyValuesOrBucket(bW, b)
			})
		})
	}); e != nil {
		_ = copyDB.Close()
		_ = os.Remove(copyPath)
		return 0, 0, e
	}
	er := copyDB.Close()
	if er != nil {
		_ = os.Remove(copyPath)
		return 0, 0, errors.Wrap(er, "closing copy")
	}

	// require current DB to close
	if e = c.requireClose(); e != nil {
		return 0, 0, errors.Wrap(e, "closing current")
	}

	if keepBackup {
		// Copy current to .bak
		bakPath := filepath.Join(dir, fmt.Sprintf("%s-%d%s", base, time.Now().Unix(), ext))
		log.TasksLogger(ctx).Info("Moving current to backup at " + bakPath)
		if er := os.Rename(p, bakPath); er != nil {
			return 0, 0, errors.Wrap(er, "moving to backup")
		}
	} else {
		// Remove current
		log.TasksLogger(ctx).Info("Removing current DB")
		if er = os.Remove(p); er != nil {
			return 0, 0, errors.Wrap(er, "removing current")
		}
	}

	// Now move copy to official path
	log.TasksLogger(ctx).Info("Replace current with defragmented one")
	if er := os.Rename(copyPath, p); er != nil {
		return 0, 0, errors.Wrap(er, "replacing")
	}

	// Now reopen this DB and pass it as new connection
	if newDB, er2 := bbolt.Open(p, 0600, &bbolt.Options{Timeout: 5 * time.Second}); er2 != nil {
		return 0, 0, errors.Wrap(er2, "re-opening connection on updated DB")
	} else {
		log.TasksLogger(ctx).Info("Reopening connection on new DB")
		if er = c.switchConnection(newDB); er == nil {
			if st, e := os.Stat(p); e == nil {
				new = uint64(st.Size())
			}
		}
		return
	}

}

type boltItem bbolt.DB

func (i *boltItem) Name() string {
	return "boltdb"
}

func (i *boltItem) ID() string {
	return uuid.New()
}

func (i *boltItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *boltItem) As(i2 interface{}) bool {

	return false
}

func (i *boltItem) Driver() string {
	return "boltdb"
}

func (i *boltItem) DSN() string {
	return (*bbolt.DB)(i).Path()
}

func copyValuesOrBucket(bW, bR *bbolt.Bucket) error {
	return bR.ForEach(func(k, v []byte) error {
		if v == nil {
			newBR := bR.Bucket(k)
			entries := 0
			// Make a first pass to count entries and ignore if empty
			_ = newBR.ForEach(func(_, _ []byte) error {
				entries++
				return nil
			})
			if entries == 0 {
				// Do not create this bucket for nothing!
				return nil
			}
			newBW, e := bW.CreateBucketIfNotExists(k)
			if e != nil {
				return e
			}
			_ = newBW.SetSequence(newBR.Sequence())
			return copyValuesOrBucket(newBW, newBR)
		} else {
			return bW.Put(k, v)
		}
	})
}
