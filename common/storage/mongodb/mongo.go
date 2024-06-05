/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package mongodb

import (
	"context"
	"fmt"
	"strings"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	mongoTypes = []string{"mongodb"}

	_ storage.Storage = (*mongoStorage)(nil)
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !runtimecontext.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		ms := &mongoStorage{}
		for _, mongoType := range mongoTypes {
			mgr.RegisterStorage(mongoType, ms)
		}
	})

}

// Database type wraps the *mongo.Database to prepend prefix to collection names
type Database struct {
	*mongo.Database
	prefix string
}

// Collection overrides collection name by appending prefix
func (d *Database) Collection(name string, opts ...*options.CollectionOptions) *mongo.Collection {
	if d.prefix != "" {
		name = d.prefix + name
	}
	return d.Database.Collection(name, opts...)
}

// CreateCollection overrides name by appending prefix
func (d *Database) CreateCollection(ctx context.Context, name string, opts ...*options.CreateCollectionOptions) error {
	if d.prefix != "" {
		name = d.prefix + name
	}
	return d.Database.CreateCollection(ctx, name, opts...)
}

type mongoStorage struct {
	template openurl.Template
	clients  map[string]*mongo.Client
}

func (o *mongoStorage) Open(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(urlstr)
	if err != nil {
		return nil, err
	}

	return &mongoStorage{
		template: t,
		clients:  make(map[string]*mongo.Client),
	}, nil
}

func (s *mongoStorage) CloseConns(ctx context.Context, clean ...bool) error {
	for _, db := range s.clients {
		if len(clean) > 0 && clean[0] {
			for _, cl := range cleaners {
				if er := cl(ctx, db); er != nil {
					return er
				}
			}
		}
		if er := db.Disconnect(ctx); er != nil {
			return er
		}
	}
	return nil
}

func (s *mongoStorage) Get(ctx context.Context, out interface{}) (bool, error) {
	switch out.(type) {
	case **Database:
	case **Indexer:
	case *indexer.Indexer:
	default:
		return false, nil
	}

	u, err := s.template.ResolveURL(ctx)
	if err != nil {
		return true, err
	}

	hookNames, _ := storage.DetectHooksAndRemoveFromURL(u)

	path := u.String()
	dbName := strings.Trim(u.Path, "/")

	var db *mongo.Database
	if cli, ok := s.clients[path]; ok {
		db = cli.Database(dbName)
	} else {
		clOption := options.Client().ApplyURI(path)
		for _, h := range hookNames {
			if hook, o := hooksRegister[h]; o {
				clOption = hook(clOption)
			}
		}
		mgClient, err := mongo.Connect(context.TODO(), clOption)
		if err != nil {
			return true, err
		}

		db = mgClient.Database(dbName)

		s.clients[path] = mgClient
	}

	prefix := u.Query().Get("prefix")
	prefixed := &Database{
		prefix:   prefix,
		Database: db,
	}

	switch v := out.(type) {
	case **Database:
		*v = prefixed
	case **Indexer:
		if !u.Query().Has("collection") {
			return true, fmt.Errorf("no collection found in URL for indexer")
		}
		idx := newIndexer(prefixed, u.Query().Get("collection"))
		*v = idx
	case *indexer.Indexer:
		if !u.Query().Has("collection") {
			return true, fmt.Errorf("no collection found in URL for indexer")
		}
		idx := newIndexer(prefixed, u.Query().Get("collection"))
		*v = idx
	default:
		return false, nil
	}

	return true, nil
}
