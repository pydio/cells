package models

import (
	"github.com/pydio/cells/common/config/source"
	"github.com/pydio/cells/common/proto/idm"
)

type ConfigDiff struct {
	update *source.ChangeSet
}

type ShareDiff struct {
	create []*SyncShare
}

type GroupDiff struct {
	// List of user to be updated
	Update map[string]*idm.User

	// List of user to be deleted
	Delete map[string]*idm.User

	// List of user to be created
	Create map[string]*idm.User
}

type UserDiff struct {
	// List of user to be updated
	Update map[string]*idm.User

	// List of user to be deleted
	Delete map[string]*idm.User

	// List of user to be created
	Create map[string]*idm.User
}

func NewUserDiff() *UserDiff {
	return &UserDiff{
		make(map[string]*idm.User),
		make(map[string]*idm.User),
		make(map[string]*idm.User),
	}
}

type ACLDiff struct {
	// List of acl to be updated
	update []*idm.ACL

	// List of acl to be deleted
	delete []*idm.ACL

	// List of acl to be created
	create []*idm.ACL
}

type RoleDiff struct {
	// List of user to be updated
	Updates map[string]*idm.Role

	// List of user to be deleted
	Deletes map[string]*idm.Role

	// List of user to be created
	Creates map[string]*idm.Role
}

func NewRolesDiff() *RoleDiff {
	return &RoleDiff{
		make(map[string]*idm.Role),
		make(map[string]*idm.Role),
		make(map[string]*idm.Role),
	}
}

type Diff interface {
	Add(...interface{})
	Update(...interface{})
	Delete(...interface{})
	ToAdd() []interface{}
	ToUpdate() []interface{}
	ToDelete() []interface{}
}

type Differ interface {
	Equals(Differ) bool
	IsDeletable(m map[string]string) bool
	IsMergeable(Differ) bool
	GetUniqueId() string
	Merge(Differ, map[string]string) (Differ, error)
}

func (a *ACLDiff) Add(vs ...interface{}) {
	for _, v := range vs {
		a.create = append(a.create, (*idm.ACL)(v.(*ACL)))
	}
}
func (a *ACLDiff) Update(vs ...interface{}) {
	for _, v := range vs {
		a.update = append(a.update, (*idm.ACL)(v.(*ACL)))
	}
}
func (a *ACLDiff) Delete(vs ...interface{}) {
	for _, v := range vs {
		a.delete = append(a.delete, (*idm.ACL)(v.(*ACL)))
	}
}

func (a *ACLDiff) ToAdd() []interface{} {
	var res []interface{}

	for _, v := range a.create {
		res = append(res, v)
	}
	return res
}
func (a *ACLDiff) ToUpdate() []interface{} {
	var res []interface{}

	for _, v := range a.update {
		res = append(res, v)
	}
	return res
}
func (a *ACLDiff) ToDelete() []interface{} {
	var res []interface{}

	for _, v := range a.delete {
		res = append(res, v)
	}
	return res
}

func (a *ConfigDiff) Add(vs ...interface{}) {
}
func (a *ConfigDiff) Update(vs ...interface{}) {
	for _, v := range vs {
		a.update = (*source.ChangeSet)(v.(*Config))
	}
}
func (a *ConfigDiff) Delete(vs ...interface{}) {
}

func (a *ConfigDiff) ToAdd() []interface{} {
	return nil
}
func (a *ConfigDiff) ToUpdate() []interface{} {
	var res []interface{}

	res = append(res, a.update)
	return res
}
func (a *ConfigDiff) ToDelete() []interface{} {
	return nil
}
func (a *ConfigDiff) GetUpdateData() []byte {
	return a.update.Data
}

func (a *ShareDiff) Add(vs ...interface{}) {
	for _, v := range vs {
		a.create = append(a.create, v.(*SyncShare))
	}
}
func (a *ShareDiff) Update(vs ...interface{}) {
}
func (a *ShareDiff) Delete(vs ...interface{}) {
}

func (a *ShareDiff) ToAdd() []interface{} {
	var res []interface{}

	for _, v := range a.create {
		res = append(res, v)
	}
	return res
}
func (a *ShareDiff) ToUpdate() []interface{} {
	return nil
}
func (a *ShareDiff) ToDelete() []interface{} {
	return nil
}

func (a *RoleDiff) Add(vs ...interface{}) {
	for _, v := range vs {
		if r, ok := v.(*idm.Role); ok {
			a.Creates[r.Uuid] = r
		} else if mr, ok := v.(*Role); ok {
			r := (*idm.Role)(mr)
			a.Creates[r.Uuid] = r
		}
	}
}

func (a *RoleDiff) Update(vs ...interface{}) {
	for _, v := range vs {
		if r, ok := v.(*idm.Role); ok {
			a.Updates[r.Uuid] = r
		} else if mr, ok := v.(*Role); ok {
			r := (*idm.Role)(mr)
			a.Updates[r.Uuid] = r
		}
	}
}
func (a *RoleDiff) Delete(vs ...interface{}) {
	for _, v := range vs {
		if r, ok := v.(*idm.Role); ok {
			a.Deletes[r.Uuid] = r
		} else if mr, ok := v.(*Role); ok {
			r := (*idm.Role)(mr)
			a.Deletes[r.Uuid] = r
		}
	}
}

func (a *RoleDiff) ToAdd() []interface{} {
	var res []interface{}
	for _, v := range a.Creates {
		res = append(res, v)
	}
	return res
}
func (a *RoleDiff) ToUpdate() []interface{} {
	var res []interface{}

	for _, v := range a.Updates {
		res = append(res, v)
	}
	return res
}
func (a *RoleDiff) ToDelete() []interface{} {
	var res []interface{}

	for _, v := range a.Deletes {
		res = append(res, v)
	}
	return res
}
