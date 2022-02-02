/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Collection struct {
	Name    string
	Indexes []map[string]int
}

type Model struct {
	Collections []Collection
}

func (m Model) Init(ctx context.Context, db *mongo.Database) error {
	for _, col := range m.Collections {
		if e := db.CreateCollection(ctx, col.Name); e != nil {
			if _, ok := e.(mongo.CommandError); !ok {
				return e
			}
		} else {
			var models []mongo.IndexModel
			for _, model := range col.Indexes {
				keys := bson.D{}
				for key, sort := range model {
					keys = append(keys, primitive.E{Key: key, Value: sort})
				}
				models = append(models, mongo.IndexModel{Keys: keys})
				if _, e := db.Collection(col.Name).Indexes().CreateMany(ctx, models); e != nil {
					fmt.Println("Error while creating indexes", e)
				}
			}
		}
	}
	return nil
}
