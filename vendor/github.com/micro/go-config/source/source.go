// Package source is the interface for sources
package source

import (
	"context"
	"time"
)

// Source is the source from which config is loaded
type Source interface {
	Read() (*ChangeSet, error)
	Watch() (Watcher, error)
	String() string
}

// ChangeSet represents a set of changes from a source
type ChangeSet struct {
	Data      []byte
	Checksum  string
	Timestamp time.Time
	Source    string
}

// Watcher watches a source for changes
type Watcher interface {
	Next() (*ChangeSet, error)
	Stop() error
}

type Options struct {
	// for alternative data
	Context context.Context
}

type Option func(o *Options)
