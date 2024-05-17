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

	"go.mongodb.org/mongo-driver/event"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	hooksRegister = map[string]func(options *options.ClientOptions) *options.ClientOptions{}

	createdCollections = map[string]bool{}
	cleaners           []func(ctx context.Context, cl *mongo.Client) error
)

func init() {
	hooksRegister["cleanCollections"] = func(options *options.ClientOptions) *options.ClientOptions {
		cleaners = append(cleaners, func(ctx context.Context, cl *mongo.Client) error {
			for coll := range createdCollections {
				parts := strings.Split(coll, ":::")
				fmt.Println("Dropping collection " + parts[1] + " from DB " + parts[0])
				if er := cl.Database(parts[0]).Collection(parts[1]).Drop(ctx); er != nil {
					return er
				}
			}
			return nil
		})
		return options.SetMonitor(&event.CommandMonitor{
			Started: func(ctx context.Context, startedEvent *event.CommandStartedEvent) {
				if startedEvent.CommandName == "create" {
					cmd := startedEvent.Command
					var collName string
					_ = cmd.Lookup("create").Unmarshal(&collName)
					createdCollections[startedEvent.DatabaseName+":::"+collName] = true
				}
			},
		})
	}
}
