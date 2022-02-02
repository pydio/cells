package configregistry

import (
	"github.com/pydio/cells/v4/common/etl"
	"github.com/pydio/cells/v4/common/etl/models"
	"github.com/pydio/cells/v4/common/registry"
)

func init() {
	etl.RegisterConverter(&converter{})
}

type converter struct{}

func (c *converter) Convert(i interface{}) ([]models.Differ, bool) {
	var res []models.Differ

	items, ok := i.([]registry.Item)
	if !ok {
		return nil, false
	}

	for _, i := range items {
		res = append(res, i.(models.Differ))
	}

	return res, true
}

type Diff struct {
	// List of acl to be updated
	update []registry.Item

	// List of acl to be deleted
	delete []registry.Item

	// List of acl to be created
	create []registry.Item
}

func (a *Diff) Add(vs ...interface{}) {
	for _, v := range vs {
		a.create = append(a.create, v.(registry.Item))
	}
}
func (a *Diff) Update(vs ...interface{}) {
	for _, v := range vs {
		a.update = append(a.update, v.(registry.Item))
	}
}
func (a *Diff) Delete(vs ...interface{}) {
	for _, v := range vs {
		a.delete = append(a.delete, v.(registry.Item))
	}
}

func (a *Diff) ToAdd() []interface{} {
	var res []interface{}

	for _, v := range a.create {
		res = append(res, v)
	}
	return res
}
func (a *Diff) ToUpdate() []interface{} {
	var res []interface{}

	for _, v := range a.update {
		res = append(res, v)
	}
	return res
}
func (a *Diff) ToDelete() []interface{} {
	var res []interface{}

	for _, v := range a.delete {
		res = append(res, v)
	}
	return res
}
