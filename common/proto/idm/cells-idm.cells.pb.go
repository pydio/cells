package idm

import (
	service "github.com/pydio/cells/v4/common/proto/service"
	tree "github.com/pydio/cells/v4/common/proto/tree"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

// Role represents a generic set of permissions that can be applied to any users or groups.
type RoleORM struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Unique identifier of this role
	Uuid string `gorm:"column:uuid;"`
	// Label of this role
	Label string `gorm:"column:label;"`
	// Whether this role represents a user team or not
	IsTeam bool `gorm:"column:team_role;"`
	// Whether this role is attached to a Group object
	GroupRole bool `gorm:"column:group_role;"`
	// Whether this role is attached to a User object
	UserRole bool `gorm:"column:user_role;"`
	// Last modification date of the role
	LastUpdated int32 `gorm:"column:last_updated;"`
	// List of profiles (standard, shared, admin) on which the role will be automatically applied
	AutoApplies []string `gorm:"column:auto_applies;serializer:json;"`
	// List of policies for securing this role access
	Policies []*service.ResourcePolicy `gorm:"-:all"`
	// Whether the policies resolve into an editable state
	PoliciesContextEditable bool `gorm:"-:all"`
	// Is used in a stack of roles, this one will always be applied last.
	ForceOverride bool `gorm:"column:override;"`
}

// A Workspace is composed of a set of nodes UUIDs and is used to provide accesses to the tree via ACLs.
type WorkspaceORM struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Unique identifier of the workspace
	UUID string `gorm:"column:uuid;"`
	// Label of the workspace (max length 500)
	Label string `gorm:"column:label;"`
	// Description of the workspace (max length 1000)
	Description string `gorm:"column:description;"`
	// Slug is an url-compatible form of the workspace label, or can be freely modified (max length 500)
	Slug string `gorm:"column:slug;"`
	// Scope can be ADMIN, ROOM (=CELL) or LINK
	Scope WorkspaceScope `gorm:"column:scope;"`
	// Last modification time
	LastUpdated int32 `gorm:"column:last_updated;"`
	// Policies for securing access
	Policies []*service.ResourcePolicy `gorm:"-:all"`
	// JSON-encoded list of attributes
	Attributes string `gorm:"-:all"`
	// Quick list of the RootNodes uuids
	RootUUIDs []string `gorm:"-:all"`
	// List of the Root Nodes in the tree that compose this workspace
	RootNodes map[string]*tree.Node `gorm:"-:all" protobuf_key:"" protobuf_val:""`
	// Context-resolved to quickly check if workspace is editable or not
	PoliciesContextEditable bool `gorm:"-:all"`
}
