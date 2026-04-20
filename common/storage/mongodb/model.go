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

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v5/common/telemetry/log"
)

type Collection struct {
	Name               string
	DefaultCollation   Collation
	Indexes            []map[string]int
	IDName             string
	TruncateSorterDesc string
}

type Collation struct {
	Locale   string
	Strength int
}

type Model struct {
	Collections []Collection
}

func (m Model) Init(ctx context.Context, db *Database) error {
	for _, col := range m.Collections {
		opts := &options.CreateCollectionOptions{}
		if col.DefaultCollation.Locale != "" {
			opts.Collation = &options.Collation{
				Locale:   col.DefaultCollation.Locale,
				Strength: col.DefaultCollation.Strength,
			}
		}
		name := col.Name
		b, e := db.CollectionExists(ctx, name)
		if e != nil {
			return e
		}
		if b {
			return nil
		}
		log.Logger(ctx).Info("Creating MongoDB collection " + col.Name)
		if e := db.CreateCollection(ctx, name, opts); e != nil {
			return e
		}
		for _, model := range col.Indexes {
			keys := bson.D{}
			var iOpts *options.IndexOptions
			for key, sort := range model {
				if sort == 2 {
					keys = append(keys, primitive.E{Key: key, Value: "2dsphere"})
				} else {
					keys = append(keys, primitive.E{Key: key, Value: sort})
				}
				if col.IDName != "" && key == col.IDName {
					iOpts = &options.IndexOptions{Unique: &b}
				}
			}
			if _, e := db.Collection(name).Indexes().CreateOne(ctx, mongo.IndexModel{Keys: keys, Options: iOpts}); e != nil {
				return e
			}
		}
	}
	return nil
}
