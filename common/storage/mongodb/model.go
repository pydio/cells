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
		if e := db.CreateCollection(ctx, name, opts); e != nil {
			if _, ok := e.(mongo.CommandError); !ok {
				return e
			} else {
				// Collection already exists
			}
		} else {
			for _, model := range col.Indexes {
				keys := bson.D{}
				for key, sort := range model {
					if sort == 2 {
						keys = append(keys, primitive.E{Key: key, Value: "2dsphere"})
					} else {
						keys = append(keys, primitive.E{Key: key, Value: sort})
					}
				}
				if _, e := db.Collection(name).Indexes().CreateOne(ctx, mongo.IndexModel{Keys: keys}); e != nil {
					return e
				} else {
					// fmt.Println("Successfully created index " + iName)
				}
			}
		}
	}
	return nil
}
