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

package models

import (
	"github.com/pydio/cells/v4/common/proto/idm"
)

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
