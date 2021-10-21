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

package sql

import (
	"sync"

	migrate "github.com/rubenv/sql-migrate"
)

// This lock is maintained globally to avoid conflicts when calling
// the rubenv/migrate package, generally through SqlManager.CreateSchemas.
var migrateLocker *sync.Mutex

func init() {
	migrateLocker = &sync.Mutex{}
}

// LockMigratePackage sets a global lock on rubenv/migrate package
func LockMigratePackage() {
	migrateLocker.Lock()
}

// UnlockMigratePackage frees the global lock on rubenv/migrate package
func UnlockMigratePackage() {
	migrateLocker.Unlock()
	// Reset migrate package to original tableName (gorp_migrations)
	migrate.SetTable(tableName)
}
