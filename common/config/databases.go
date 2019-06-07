/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"log"
	"sync"
)

var (
	databaseOnce  = &sync.Once{}
	defaultDriver string
	defaultDSN    string
	databases     Map
)

func loadDatabases() {
	Get("databases").Scan(&databases)

	if defaultDbKey := Get("defaults", "database").String(""); defaultDbKey != "" {
		if _, ok := databases[defaultDbKey]; ok {
			sMap := databases.StringMap(defaultDbKey)
			if d, o := sMap["driver"]; o {
				defaultDriver = d
			}
			if d, o := sMap["dsn"]; o {
				defaultDSN = d
			}
		}
	}

	// If no database is found, there's a config issue!
	// But do not stop here, it should be checked at the cmd level (services-start.go),
	// as we don't have a way to throw back the error (log.Fatal silently breaks)
	if defaultDriver == "" {
		log.Println("[FATAL] Could not find default database! Please make sure that databases are correctly configured and started.")
	}
}

// GetDefaultDatabase returns the information for the default database
func GetDefaultDatabase() (string, string) {
	databaseOnce.Do(func() {
		loadDatabases()
	})
	return defaultDriver, defaultDSN
}

// GetDatabase retrieves the database data from the config
func GetDatabase(name string) (string, string) {
	databaseOnce.Do(func() {
		loadDatabases()
	})

	return databases.Database(name)
}
