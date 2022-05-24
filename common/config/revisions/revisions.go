package revisions

import "time"

// Version is a structure for encapsulating a new version of configs with additional metadata
type Version struct {
	Id   uint64      `json:"Id,omitempty"`
	Data interface{} `json:"Data,omitempty"`
	Date time.Time
	User string
	Log  string
}

// Store is the interface for storing and listing configs versions
type Store interface {
	Put(version *Version) error
	List(offset uint64, limit uint64) ([]*Version, error)
	Retrieve(id uint64) (*Version, error)
}
