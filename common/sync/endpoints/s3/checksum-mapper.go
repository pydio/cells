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
	for e := range m.data {
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
