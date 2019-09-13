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
