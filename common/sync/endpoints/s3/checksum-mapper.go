package s3

import "sync"

// ChecksumMapper maintains a mapping of eTags => checksum
type ChecksumMapper interface {
	// Get finds a checksum for a given eTag, returns false if not found
	Get(eTag string) (string, bool)
	// Set stores an eTag checksum couple if it does not already exists
	Set(eTag, checksum string)
	// Purge removes unknown values based on the full list of know values
	Purge(knownETags []string) int
}

// MemChecksumMapper is an in-memory implementation for ChecksumMapper interface
type MemChecksumMapper struct {
	data map[string]string
	mux  *sync.Mutex
}

// NewMemChecksumMapper instantiates a new ChecksumMapper
func NewMemChecksumMapper() *MemChecksumMapper {
	return &MemChecksumMapper{
		data: make(map[string]string),
		mux:  &sync.Mutex{},
	}
}

// Get finds a checksum by eTag
func (m *MemChecksumMapper) Get(eTag string) (string, bool) {
	m.mux.Lock()
	defer m.mux.Unlock()
	cs, ok := m.data[eTag]
	return cs, ok
}

// Set stores a checksum for a given eTag
func (m *MemChecksumMapper) Set(eTag, checksum string) {
	m.mux.Lock()
	defer m.mux.Unlock()
	m.data[eTag] = checksum
}

// Purge compares existing eTags to stored eTags and removes unnecessary ones
func (m *MemChecksumMapper) Purge(knownETags []string) int {
	m.mux.Lock()
	defer m.mux.Unlock()
	count := 0
	for e, _ := range m.data {
		found := false
		for _, k := range knownETags {
			if k == e {
				found = true
				break
			}
		}
		if !found {
			delete(m.data, e)
			count++
		}
	}
	return count
}
