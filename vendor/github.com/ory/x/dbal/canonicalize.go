package dbal

import "github.com/ory/x/cmdx"

const (
	// DriverMySQL is the mysql driver name.
	DriverMySQL = "mysql"

	// DriverPostgreSQL is the mysql driver name.
	DriverPostgreSQL = "postgres"

	// UnknownDriver is the driver name if the driver is unknown.
	UnknownDriver = "unknown"
)

// Canonicalize returns constants DriverMySQL, DriverPostgreSQL, UnknownDriver, depending on `database`.
func Canonicalize(database string) string {
	switch database {
	case "mysql":
		return DriverMySQL
	case "pgx", "pq", "postgres":
		return DriverPostgreSQL
	default:
		return UnknownDriver
	}
}

// MustCanonicalize returns constants DriverMySQL, DriverPostgreSQL or fatals.
func MustCanonicalize(database string) string {
	d := Canonicalize(database)
	if d == UnknownDriver {
		cmdx.Fatalf("Unknown database driver: %s", database)
	}
	return d
}
