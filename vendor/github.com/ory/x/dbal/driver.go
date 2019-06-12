package dbal

import (
	"sync"

	"github.com/pkg/errors"
)

var (
	drivers = make([]Driver, 0)
	dmtx    sync.Mutex

	// ErrNoResponsibleDriverFound is returned when no driver was found for the provided DSN.
	ErrNoResponsibleDriverFound = errors.New("no driver is capable of handling the given DSN")
)

// Driver represents a driver
type Driver interface {
	// CanHandle returns true if the driver is capable of handling the given DSN or false otherwise.
	CanHandle(dsn string) bool

	// Ping returns nil if the driver has connectivity and is healthy or an error otherwise.
	Ping() error
}

// RegisterDriver registers a driver
func RegisterDriver(d Driver) {
	dmtx.Lock()
	drivers = append(drivers, d)
	dmtx.Unlock()
}

// GetDriverFor returns a driver for the given DSN or ErrNoResponsibleDriverFound if no driver was found.
func GetDriverFor(dsn string) (Driver, error) {
	for _, d := range drivers {
		if d.CanHandle(dsn) {
			return d, nil
		}
	}
	return nil, ErrNoResponsibleDriverFound
}
