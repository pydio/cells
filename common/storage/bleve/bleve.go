package bleve

import (
	"context"
	"fmt"
	"os"
	"strconv"

	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/blevesearch/bleve/v2/index/upsidedown/store/boltdb"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	_ storage.Storage = (*bleveStorage)(nil)
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if runtimecontext.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		mgr.RegisterStorage("bleve", &bleveStorage{})
	})
}

type bleveStorage struct {
	template openurl.Template
	dbs      []*blevedb
}

func (s *bleveStorage) OpenURL(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(urlstr)
	if err != nil {
		return nil, err
	}

	return &bleveStorage{
		template: t,
	}, nil
}

type blevedb struct {
	path   string
	fsPath string
	db     any
}

func (s *bleveStorage) CloseConns(ctx context.Context, clean ...bool) error {

	for _, db := range s.dbs {
		switch base := db.db.(type) {
		case bleve.Index:
			if er := base.Close(); er != nil {
				return er
			}
		case *indexer.Indexer:
			if er := (*base).Close(ctx); er != nil {
				return er
			}
		case **Indexer:
			if er := (*base).Close(ctx); er != nil {
				return er
			}
		}
		if len(clean) > 0 && clean[0] {
			fmt.Println("removing", db.fsPath)
			if er := os.RemoveAll(db.fsPath); er != nil {
				return er
			}
		}
	}
	return nil
}

func (s *bleveStorage) bleveIndexerFromCache(ctx context.Context) (*Indexer, error) {

	u, err := s.template.ResolveURL(ctx)
	if err != nil {
		return nil, err
	}
	path := u.String()

	for _, db := range s.dbs {
		if path == db.path {
			return db.db.(*Indexer), nil
		}
	}

	q := u.Query()

	rotationSize := DefaultRotationSize
	if q.Has("rotationSize") {
		if size, err := strconv.ParseInt(q.Get("rotationSize"), 10, 0); err != nil {
			return nil, fmt.Errorf("cannot parse rotationSize %v", err)
		} else {
			rotationSize = size
		}
	}

	batchSize := DefaultBatchSize
	if q.Has("batchSize") {
		if size, err := strconv.ParseInt(q.Get("batchSize"), 10, 0); err != nil {
			return nil, fmt.Errorf("cannot parse batchSize %v", err)
		} else {
			batchSize = size
		}
	}

	mappingName := DefaultMappingName
	if q.Has("mapping") {
		if mn := q.Get("mapping"); mn != "" {
			mappingName = mn
		}
	}

	index, err := newBleveIndexer(&BleveConfig{
		BlevePath:    u.Path,
		RotationSize: rotationSize,
		BatchSize:    batchSize,
		MappingName:  mappingName,
	})
	if err != nil {
		return nil, err
	}

	var cfg config.Store
	runtimecontext.Get(ctx, config.ContextKey, &cfg)
	index.serviceConfigs = cfg

	s.dbs = append(s.dbs, &blevedb{
		db:     index,
		path:   path,
		fsPath: u.Path,
	})

	return index, nil
}

func (s *bleveStorage) Get(ctx context.Context, out interface{}) (bool, error) {
	switch v := out.(type) {
	case **Indexer:
		idx, er := s.bleveIndexerFromCache(ctx)
		if er != nil {
			return true, er
		}
		*v = idx
		return true, nil

	case *indexer.Indexer:
		idx, er := s.bleveIndexerFromCache(ctx)
		if er != nil {
			return true, er
		}
		*v = idx
		return true, nil

	case *bleve.Index:

		u, err := s.template.ResolveURL(ctx)
		if err != nil {
			return true, err
		}
		path := u.String()

		for _, db := range s.dbs {
			if path == db.path {
				*v = db.db.(bleve.Index)
				return true, nil
			}
		}

		_, e := os.Stat(u.Path)
		var index bleve.Index
		if e == nil {
			index, err = bleve.Open(u.Path)
		} else {
			index, err = bleve.NewUsing(u.Path, bleve.NewIndexMapping(), scorch.Name, boltdb.Name, nil)
		}

		if err != nil {
			return true, err
		}

		*v = index

		s.dbs = append(s.dbs, &blevedb{
			db:     index,
			path:   path,
			fsPath: u.Path,
		})

		return true, nil
	}

	return false, nil
}

type bleveItem Indexer

func (i *bleveItem) Name() string {
	return "bleve"
}

func (i *bleveItem) ID() string {
	return uuid.New()
}

func (i *bleveItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *bleveItem) As(i2 interface{}) bool {
	if v, ok := i2.(**Indexer); ok {
		*v = (*Indexer)(i)
		return true
	}
	return false
}

func (i *bleveItem) Driver() string {
	return "bleve"
}

func (i *bleveItem) DSN() string {
	return (*Indexer)(i).MustBleveConfig(context.TODO()).BlevePath
}
