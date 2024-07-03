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
	"net/url"
	"strings"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}
		mgr.RegisterStorage("mongodb", controller.WithCustomOpener(OpenPool))
	})

}

type pool struct {
	*openurl.Pool[*Indexer]
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(context.Background(), []string{uu}, func(ctx context.Context, dsn string) (*Indexer, error) {

		u, err := url.Parse(dsn)
		if err != nil {
			return nil, err
		}

		hookNames, _ := storage.DetectHooksAndRemoveFromURL(u)

		path := u.String()
		dbName := strings.Trim(u.Path, "/")

		var db *mongo.Database
		clOption := options.Client().ApplyURI(path)
		for _, h := range hookNames {
			if hook, o := hooksRegister[h]; o {
				clOption = hook(clOption)
			}
		}
		mgClient, err := mongo.Connect(context.TODO(), clOption)
		if err != nil {
			return nil, err
		}

		db = mgClient.Database(dbName)

		prefix := u.Query().Get("prefix")
		prefixed := &Database{
			prefix:   prefix,
			Database: db,
		}

		return newIndexer(prefixed, u.Query().Get("collection")), nil

	})

	if err != nil {
		return nil, err
	}

	return &pool{
		Pool: p,
	}, nil
}

func (p *pool) Get(ctx context.Context, data ...map[string]string) (any, error) {
	return p.Pool.Get(ctx)
}

func (p *pool) Close(ctx context.Context, iterate ...func(key string, res storage.Storage) error) error {
	return p.Pool.Close(ctx)
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

// CloseAndDrop implements storage.Dropper interface
func (d *Database) CloseAndDrop(ctx context.Context) error {
	var err []error
	for _, cc := range cleaners {
		if e := cc(ctx, d.Client()); e != nil {
			err = append(err, e)
		}
	}
	if e := d.Client().Disconnect(ctx); e != nil {
		err = append(err, e)
	}
	return errors.Join(err...)
}
