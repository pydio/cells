package bleve

import (
	"context"
	"strconv"
	"strings"

	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	_ storage.Storage = (*bleveStorage)(nil)
)

func init() {
	storage.DefaultURLMux().Register("bleve", &bleveStorage{})
}

type bleveStorage struct {
	template openurl.Template
	dbs      []*blevedb
}

func (o *bleveStorage) OpenURL(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(urlstr)
	if err != nil {
		return nil, err
	}

	return &bleveStorage{
		template: t,
	}, nil
}

type blevedb struct {
	path string
	db   *Indexer
}

func (s *bleveStorage) Provides(conn any) bool {
	if _, ok := conn.(*Indexer); ok {
		return true
	}

	return false
}

func (s *bleveStorage) GetConn(str string) (storage.Conn, error) {
	index, err := newBleveIndexer(&BleveConfig{
		BlevePath:    strings.TrimPrefix(str, "bleve://"),
		RotationSize: DefaultRotationSize,
		BatchSize:    DefaultBatchSize,
	})

	if err != nil {
		return nil, err
	}

	return (*bleveItem)(index), nil
}

func (s *bleveStorage) Register(conn any, tenant string, service string) {

}

func (s *bleveStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(**Indexer); ok {

		u, err := s.template.ResolveURL(ctx)
		if err != nil {
			return false
		}
		path := u.String()

		for _, db := range s.dbs {
			if path == db.path {
				*v = db.db
				return true
			}
		}

		// Not found, opening

		q := u.Query()

		rotationSize := DefaultRotationSize
		if q.Has("rotationSize") {
			if size, err := strconv.ParseInt(q.Get("rotationSize"), 10, 0); err != nil {
				return false
			} else {
				rotationSize = size
			}
		}

		batchSize := DefaultBatchSize
		if q.Has("batchSize") {
			if size, err := strconv.ParseInt(q.Get("batchSize"), 10, 0); err != nil {
				return false
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
			return false
		}

		*v = index

		s.dbs = append(s.dbs, &blevedb{
			db:   index,
			path: path,
		})

		return true
	}

	return false
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
