package models

import (
	"context"

	"github.com/pydio/cells/common/config/source"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
)

// ReadableStore interface defines the objects to be able to list from a store
type ReadableStore interface {
	ListConfig(context.Context, map[string]interface{}) (*source.ChangeSet, error)
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
	PutConfig(context.Context, *source.ChangeSet) error
	PutShare(context.Context, *SyncShare) error
}
