package boltdb

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/pkg/errors"
	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		mgr.RegisterStorage("boltdb", controller.WithCustomOpener(OpenPool))
	})
}

type DB interface {
	Batch(fn func(*bbolt.Tx) error) error
	Begin(writable bool) (*bbolt.Tx, error)
	Compact(ctx context.Context, opts map[string]interface{}) (old uint64, new uint64, err error)
	Close(ctx context.Context) error
	CloseAndDrop(ctx context.Context) error
	GoString() string
	Info() *bbolt.Info
	IsReadOnly() bool
	Path() string
	Stats() bbolt.Stats
	String() string
	Sync() error
	Update(fn func(*bbolt.Tx) error) error
	View(fn func(*bbolt.Tx) error) error
}

type pool struct {
	*openurl.Pool[DB]
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(context.Background(), []string{uu}, func(ctx context.Context, dsn string) (DB, error) {
		u, err := url.Parse(dsn)
		if err != nil {
			return nil, err
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

		fsPath := strings.TrimPrefix(dsn, "boltdb://")
		fsPath, _ = url.QueryUnescape(fsPath)
		conn, err := bbolt.Open(fsPath, defaultMode, options)
		//return &Compacter{
		//	DB: conn,
		//	requireClose: func() error {
		//		if er := db.Close(); er != nil {
		//			return er
		//		} else {
		//			db.closed = true
		//			return nil
		//		}
		//	},
		//	switchConnection: func(newDB *bbolt.DB) error {
		//		cacheEntry.closed = false
		//		cacheEntry.db = newDB
		//		return nil
		//	},
		//}, nil

		return &db{DB: conn}, nil
	})

	if err != nil {
		return nil, err
	}

	return &pool{
		Pool: p,
	}, nil
}

func (p *pool) Get(ctx context.Context, data ...map[string]interface{}) (any, error) {
	return p.Pool.Get(ctx, data...)
}

func (p *pool) Close(ctx context.Context, iterate ...func(key string, res storage.Storage) error) error {
	return p.Pool.Close(ctx)
}

type db struct {
	*bbolt.DB
	requireClose     func() error
	switchConnection func(newDB *bbolt.DB) error
}

// Close implements storage.Closer interface
func (d *db) Close(ctx context.Context) error {
	return d.DB.Close()
}

// CloseAndDrop implements storage.Dropper interface
func (d *db) CloseAndDrop(ctx context.Context) error {
	pa := d.DB.Path()
	fmt.Println("Dropping BoltDB " + pa)
	if er := d.DB.Close(); er != nil {
		return er
	}
	return os.Remove(pa)
}

func (d *db) Compact(ctx context.Context, opts map[string]interface{}) (old uint64, new uint64, err error) {

	p := d.Path()
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
		return d.View(func(txR *bbolt.Tx) error {
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
	if closeFn := d.requireClose; closeFn != nil {
		if e = closeFn(); e != nil {
			return 0, 0, errors.Wrap(e, "closing current")
		}
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
		if switchFn := d.switchConnection; switchFn != nil {
			if e = switchFn(newDB); e != nil {
				return 0, 0, errors.Wrap(e, "closing current")
			}
		}

		return
	}
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
