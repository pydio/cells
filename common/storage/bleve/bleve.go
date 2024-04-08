package bleve

import (
	"context"
	"net/url"
	"strconv"
	"strings"

	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	_ storage.Storage = (*bleveStorage)(nil)
)

func init() {
	storage.DefaultURLMux().Register("bleve", &bleveStorage{})
}

type bleveStorage struct {
	dbs []*blevedb
}

func (o *bleveStorage) OpenURL(ctx context.Context, u *url.URL) (storage.Storage, error) {
	// First we check if the connection is already used somewhere
	for _, db := range o.dbs {
		if db.db.MustBleveConfig(ctx).BlevePath == u.Path {
			o.Register(db.db, "", "")
			return o, nil
		}
	}

	q := u.Query()

	rotationSize := DefaultRotationSize
	if q.Has("rotationSize") {
		if size, err := strconv.ParseInt(q.Get("rotationSize"), 10, 0); err != nil {
			return nil, err
		} else {
			rotationSize = size
		}
	}

	batchSize := DefaultBatchSize
	if q.Has("batchSize") {
		if size, err := strconv.ParseInt(q.Get("batchSize"), 10, 0); err != nil {
			return nil, err
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

	// register the conn for future usage
	o.Register(index, "", "")

	return o, nil
}

type blevedb struct {
	db      *bleveIndexer
	service string
	tenant  string
}

func (s *bleveStorage) Provides(conn any) bool {
	if _, ok := conn.(*bleveIndexer); ok {
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
	s.dbs = append(s.dbs, &blevedb{
		db:      conn.(*bleveIndexer),
		tenant:  tenant,
		service: service,
	})
}

func (s *bleveStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(**bleveIndexer); ok {
		for _, db := range s.dbs {
			tenant := servercontext.GetTenant(ctx)
			service := servicecontext.GetServiceName(ctx)
			if (db.tenant == tenant && db.service == service) || (db.tenant == "" && db.service == "") {
				//db.db.Open(ctx)
				*v = db.db
				return true
			}
		}
	}

	return false
}

type bleveItem bleveIndexer

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
	if v, ok := i2.(**bleveIndexer); ok {
		*v = (*bleveIndexer)(i)
		return true
	}
	return false
}

func (i *bleveItem) Driver() string {
	return "bleve"
}

func (i *bleveItem) DSN() string {
	return (*bleveIndexer)(i).MustBleveConfig(context.TODO()).BlevePath
}
