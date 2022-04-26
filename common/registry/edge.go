package registry

import (
	"crypto/md5"
	"encoding/hex"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/utils/merger"
	"sort"
	"strings"
)

type edge struct {
	id       string
	name     string
	metadata map[string]string
	vertices []string
}

func RegisterEdge(reg Registry, item1, item2, edgeLabel string, metadata map[string]string) (Edge, error) {
	e := CreateEdge(item1, item2, edgeLabel, metadata)
	return e, reg.Register(e)
}

// CreateEdge creates a registry.Edge item linking two services together by their ID
func CreateEdge(item1, item2 string, edgeLabel string, metadata map[string]string) Edge {
	// Make id unique for an item1+item2 pair
	pair := []string{item1, item2}
	sort.Strings(pair)
	h := md5.New()
	h.Write([]byte(strings.Join(pair, "-")))
	id := hex.EncodeToString(h.Sum(nil))
	e := &edge{
		id:       id,
		name:     edgeLabel,
		metadata: metadata,
		vertices: []string{item1, item2},
	}
	if e.metadata == nil {
		e.metadata = map[string]string{}
	}
	return e
}

// ListAdjacentItems finds all registry.Item that are linked to the source by a registry.Edge
func ListAdjacentItems(reg Registry, sourceItem Item, targetOptions ...Option) (items []Item) {
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
	allItems, _ := reg.List(targetOptions...)
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

// ClearEdges removes dead links after removing an Item from the registry
func ClearEdges(reg Registry, sourceItem Item) ([]Edge, error) {
	var out []Edge
	edges := make(map[string]Edge)
	ee, er := reg.List(WithType(pb.ItemType_EDGE))
	if er != nil {
		return nil, er
	}
	for _, e := range ee {
		edg, ok := e.(Edge)
		if !ok {
			continue
		}
		vv := edg.Vertices()
		if vv[0] == sourceItem.ID() || vv[1] == sourceItem.ID() {
			edges[edg.ID()] = edg
		}
	}
	if len(edges) == 0 {
		return out, nil
	}
	for _, e := range edges {
		if er := reg.Deregister(e); er != nil {
			return out, nil
		} else {
			out = append(out, e)
		}
	}

	return out, nil
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
	return true
}

func (e *edge) GetUniqueId() string {
	return e.id
}

func (e *edge) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}
