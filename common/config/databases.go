/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package config

import (
	"context"
)

// HasDatabase checks if DB key is set
func HasDatabase(ctx context.Context, key string) bool {
	return Get(ctx, "#/databases/"+key).StringMap()["driver"] != ""
}

// GetStorageDriver looks up for a storage driver/dsn definition
// It may find databases/[(services/{serviceName}/storage)|{serviceName}|default]
func GetStorageDriver(store Store, configKey, serviceName string) (driver string, dsn string, defined bool) {

	// By default, we check #/databases/serviceName for backward compat
	dbKey := serviceName
	if sKey := store.Val("services", serviceName, configKey).String(); sKey != "" {
		// Otherwise, check if service defines a storage key, and then use it for #databases/DB_ID
		dbKey = sKey
	}
	defined = store.Val("#/databases/" + dbKey).StringMap()["driver"] != ""
	// Finally, use #/defaults/database value
	c := store.Val("#/databases/" + dbKey).Default(store.Val("#/defaults/database").Get()).StringMap()

	return c["driver"], c["dsn"], defined
}

// GetDatabase retrieves the database data from the config
func GetDatabase(ctx context.Context, key string) (string, string) {

	c := Get(ctx, "#/databases/"+key).Default(Get(ctx, "#/defaults/database").Get()).StringMap()

	return c["driver"], c["dsn"]
}

// SetDatabase adds a database entry, plus an optional reference in the defaults
func SetDatabase(ctx context.Context, key string, driver string, dsn string, defaultsKey string) error {
	e := Get(ctx, "#/databases/"+key).Set(map[string]string{
		"driver": driver,
		"dsn":    dsn,
	})
	if e != nil {
		return e
	}
	// If defaultsKey is set and value is not already set, add it
	if defaultsKey != "" && Get(ctx, "defaults", defaultsKey).String() == "" {
		return Set(ctx, Get(ctx, "#/databases/"+key).Get(), "defaults", defaultsKey)
	}
	return nil
}
