package registry

import (
	"github.com/pydio/cells/v5/common/utils/merger"
	"github.com/pydio/cells/v5/common/utils/std"
)

type edge struct {
	id       string
	name     string
	metadata map[string]string
	vertices []string
}

func (e *edge) Name() string {
	return e.name
}

func (e *edge) ID() string {
	return e.id
}

func (e *edge) Metadata() map[string]string {
	return e.metadata
}

func (e *edge) As(i interface{}) bool {
	if ii, ok := i.(*Edge); ok {
		*ii = e
		return true
	}
	return false
}

func (e *edge) Vertices() []string {
	return e.vertices
}

func (e *edge) Equals(differ merger.Differ) bool {
	if ed, ok := differ.(*edge); ok {
		return ed.ID() == e.ID()
	}
	return false
}

func (e *edge) IsDeletable(m map[string]string) bool {
	return true
}

func (e *edge) IsMergeable(differ merger.Differ) bool {
	return e.id == differ.GetUniqueId()
}

func (e *edge) GetUniqueId() string {
	return e.id
}

func (e *edge) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}

func (e *edge) Clone() interface{} {
	clone := &edge{}

	clone.id = e.id
	clone.name = e.name
	clone.vertices = std.CloneSlice(e.vertices)
	clone.metadata = std.CloneMap(e.metadata)

	return clone
}
