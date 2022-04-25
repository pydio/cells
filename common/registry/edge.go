package registry

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/utils/merger"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type edge struct {
	id       string
	name     string
	metadata map[string]string
	vertices []string
}

// CreateEdge creates a registry.Edge item linking two services together by their ID
func CreateEdge(item1, item2 string, edgeLabel string, metadata map[string]string) Edge {
	e := &edge{
		id:       uuid.New(),
		name:     edgeLabel,
		metadata: metadata,
		vertices: []string{item1, item2},
	}
	if e.metadata == nil {
		e.metadata = map[string]string{}
	}
	return e
}

// ListLinks finds all registry.Item that are linked to the source by a registry.Edge
func ListLinks(reg Registry, sourceItem Item) (items []Item) {
	ee, _ := reg.List(WithType(pb.ItemType_EDGE))
	var ids []string
	for _, e := range ee {
		edg, ok := e.(Edge)
		if !ok {
			continue
		}
		vv := edg.Vertices()
		if vv[0] == sourceItem.ID() {
			ids = append(ids, vv[1])
		} else if vv[1] == sourceItem.ID() {
			ids = append(ids, vv[0])
		}
	}
	if len(ids) == 0 {
		return
	}
	allItems, _ := reg.List()
	for _, id := range ids {
		for _, i := range allItems {
			if i.ID() == id {
				items = append(items, i)
				break
			}
		}
	}
	return
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
	return true
}

func (e *edge) GetUniqueId() string {
	return e.id
}

func (e *edge) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}
