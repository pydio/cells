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
	"context"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
)

// ReadableStore interface defines the objects to be able to list from a store
type ReadableStore interface {
	ListUsers(context.Context, map[string]interface{}, chan float32) (map[string]*idm.User, error)
	ListGroups(context.Context, map[string]interface{}) ([]*idm.User, error)
	ListRoles(context.Context, ReadableStore, map[string]interface{}) ([]*idm.Role, error)
	ListACLs(context.Context, map[string]interface{}) ([]*idm.ACL, error)

	ListShares(context.Context, map[string]interface{}) ([]*SyncShare, error)
	CrossLoadShare(context.Context, *SyncShare, ReadableStore, map[string]interface{}) error

	GetUserInfo(c context.Context, userName string, params map[string]interface{}) (u *idm.User, aclCtxt context.Context, e error)
	GetGroupInfo(c context.Context, groupPath string, params map[string]interface{}) (u *idm.User, e error)
	ReadNode(c context.Context, wsUuid string, wsPath string) (*tree.Node, error)
}

// WritableStore defines the function required to write to a store
type WritableStore interface {
	ReadableStore

	CreateUser(context.Context, *idm.User) (*idm.User, error)
	UpdateUser(context.Context, *idm.User) (*idm.User, error)
	DeleteUser(context.Context, *idm.User) error
	PutGroup(context.Context, *idm.User) error
	DeleteGroup(context.Context, *idm.User) error
	PutRole(context.Context, *idm.Role) (*idm.Role, error)
	DeleteRole(context.Context, *idm.Role) error
	PutACL(context.Context, *idm.ACL) error
	DeleteACL(context.Context, *idm.ACL) error
	PutShare(context.Context, *SyncShare) error
}
