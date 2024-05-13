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

package mongo

import (
	"context"
	"strings"

	"github.com/pborman/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	mongoTypes = []string{"mongodb"}

	_ storage.Storage = (*mongoStorage)(nil)
)

func init() {
	ms := &mongoStorage{}
	for _, mongoType := range mongoTypes {
		storage.DefaultURLMux().Register(mongoType, ms)
	}
}

type mongoStorage struct {
	template openurl.Template
	clients  map[string]*mongo.Client
}

func (o *mongoStorage) OpenURL(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(urlstr)
	if err != nil {
		return nil, err
	}

	return &mongoStorage{
		template: t,
		clients:  make(map[string]*mongo.Client),
	}, nil
}

func (s *mongoStorage) Provides(conn any) bool {
	if _, ok := conn.(*mongo.Client); ok {
		return true
	}

	return false
}

func (s *mongoStorage) CloseConns(ctx context.Context, clean ...bool) error {
	for _, db := range s.clients {
		for _, cl := range cleaners {
			if er := cl(ctx, db); er != nil {
				return er
			}
		}
		if er := db.Disconnect(ctx); er != nil {
			return er
		}
	}
	return nil
}

func (s *mongoStorage) GetConn(str string) (storage.Conn, error) {
	for _, mongoType := range mongoTypes {
		if strings.HasPrefix(str, mongoType) {
			client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(str))
			if err != nil {
				return nil, err
			}

			return (*mongoItem)(client), nil
		}
	}

	return nil, nil
}

func (s *mongoStorage) Get(ctx context.Context, out interface{}) (bool, error) {
	switch out.(type) {
	case **mongo.Database:
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

	switch v := out.(type) {
	case **mongo.Database:
		*v = db
	case **Indexer:
		idx := NewIndexer(db)
		idx.SetCollection(u.Query().Get("collection"))

		*v = idx
	case *indexer.Indexer:
		idx := NewIndexer(db)
		idx.SetCollection(u.Query().Get("collection"))

		*v = idx
	default:
		return false, nil
	}

	return true, nil
}

type mongoItem mongo.Client

func (i *mongoItem) Name() string {
	return "mongo"
}

func (i *mongoItem) ID() string {
	return uuid.New()
}

func (i *mongoItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *mongoItem) As(i2 interface{}) bool {
	return false
}

func (i *mongoItem) Driver() string {
	return "mongo"
}

func (i *mongoItem) DSN() string {
	return "TODO"
}
