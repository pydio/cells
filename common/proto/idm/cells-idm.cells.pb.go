package idm

import (
	service "github.com/pydio/cells/v4/common/proto/service"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

/*var role *Role
var roleORM *RoleORM

role.As(&roleORM)

func (src iRole) As(dst iRole) {


}*/

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
