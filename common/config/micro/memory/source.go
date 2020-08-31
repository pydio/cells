package memory

import (
	"crypto/md5"
	"fmt"
	"time"

	"github.com/pydio/go-os/config"
)

func NewSource(data []byte) *memorySource {
	return &memorySource{
		data: data,
	}
}

type memorySource struct {
	data []byte
}

// Loads ChangeSet from the source
func (m *memorySource) Read() (*config.ChangeSet, error) {
	h := md5.New()
	h.Write(m.data)
	checksum := fmt.Sprintf("%x", h.Sum(nil))

	return &config.ChangeSet{
		Data:      m.data,
		Checksum:  checksum,
		Timestamp: time.Now(),
		Source:    m.String(),
	}, nil

}

// Watch for source changes
// Returns the entire changeset
func (m *memorySource) Watch() (config.SourceWatcher, error) {
	return nil, nil
}

// Name of source
func (m *memorySource) String() string {
	return "memory"
}
