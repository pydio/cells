package util

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/utils/merger"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"maps"
)

func CreateEndpoint(name string, handler any, meta map[string]string) registry.Endpoint {
	return ToEndpoint(&pb.Item{Id: uuid.New(), Name: name, Metadata: meta}, handler)
}

func ToEndpoint(i *pb.Item, h any) registry.Endpoint {
	return &endpoint{I: i, H: h}
}

type endpoint struct {
	I *pb.Item
	H any
}

func (d *endpoint) Handler() any {
	return d.H
}

func (d *endpoint) Type() pb.ItemType {
	return pb.ItemType_ENDPOINT
}

func (d *endpoint) Equals(differ merger.Differ) bool {
	if di, ok := differ.(*generic); ok {
		return di.Name() == d.Name() && di.ID() == d.ID()
	}
	return false
}

func (d *endpoint) IsDeletable(m map[string]string) bool {
	return true
}

func (d *endpoint) IsMergeable(differ merger.Differ) bool {
	return d.ID() == differ.GetUniqueId()
}

func (d *endpoint) GetUniqueId() string {
	return d.ID()
}

func (d *endpoint) Merge(differ merger.Differ, m map[string]string) (merger.Differ, error) {
	return differ, nil
}

func (d *endpoint) Name() string {
	return d.I.Name
}

func (d *endpoint) ID() string {
	return d.I.Id
}

func (d *endpoint) Metadata() map[string]string {
	return maps.Clone(d.I.Metadata)
}

func (d *endpoint) As(i interface{}) bool {
	if ii, ok := i.(*registry.Generic); ok {
		*ii = d
		return true
	}
	return false
}

func (d *endpoint) Clone() interface{} {
	clone := &endpoint{}

	clone.I = std.DeepClone(d.I)
	clone.H = std.DeepClone(d.H)

	return clone
}
