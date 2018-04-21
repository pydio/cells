package goraph

import "sync"

// DisjointSet implements disjoint set.
// (https://en.wikipedia.org/wiki/Disjoint-set_data_structure)
type DisjointSet struct {
	represent string
	members   map[string]struct{}
}

// Forests is a set of DisjointSet.
type Forests struct {
	mu   sync.Mutex // guards the following
	data map[*DisjointSet]struct{}
}

// NewForests creates a new Forests.
func NewForests() *Forests {
	set := &Forests{}
	set.data = make(map[*DisjointSet]struct{})
	return set
}

// MakeDisjointSet creates a DisjointSet.
func MakeDisjointSet(forests *Forests, name string) {
	newDS := &DisjointSet{}
	newDS.represent = name
	members := make(map[string]struct{})
	members[name] = struct{}{}
	newDS.members = members
	forests.mu.Lock()
	defer forests.mu.Unlock()
	forests.data[newDS] = struct{}{}
}

// FindSet returns the DisjointSet with the represent name.
func FindSet(forests *Forests, name string) *DisjointSet {
	forests.mu.Lock()
	defer forests.mu.Unlock()
	for data := range forests.data {
		if data.represent == name {
			return data
		}
		for k := range data.members {
			if k == name {
				return data
			}
		}
	}
	return nil
}

// Union unions two DisjointSet, with ds1's represent.
func Union(forests *Forests, ds1, ds2 *DisjointSet) {
	newDS := &DisjointSet{}
	newDS.represent = ds1.represent
	newDS.members = ds1.members
	for k := range ds2.members {
		newDS.members[k] = struct{}{}
	}
	forests.mu.Lock()
	defer forests.mu.Unlock()
	forests.data[newDS] = struct{}{}
	delete(forests.data, ds1)
	delete(forests.data, ds2)
}
