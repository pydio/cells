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

package idm

import (
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common"
)

/* idm.go file enriches default genrated proto structs with some custom pydio methods to ease development */

/*
ROLE, USER AND GROUPS
*/

// MarshalLogObject implements custom marshalling for logs
func (role *Role) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("Uuid", role.Uuid)
	encoder.AddString("Label", role.Label)
	encoder.AddBool("IsTeam", role.IsTeam)
	encoder.AddBool("GroupRole", role.GroupRole)
	encoder.AddBool("UserRole", role.UserRole)
	encoder.AddBool("ForceOverride", role.ForceOverride)
	encoder.AddTime("LastUpdated", time.Unix(int64(role.LastUpdated), 0))
	encoder.AddBool("PoliciesContextEditable", role.PoliciesContextEditable)
	_ = encoder.AddReflected("AutoApplies", role.AutoApplies)
	if len(role.Policies) > 100 {
		encoder.AddInt("PoliciesNumber", len(role.Policies))
	} else if len(role.Policies) > 0 {
		_ = encoder.AddReflected("Policies", role.Policies)
	}
	return nil
}

// Zap simply returns a zapcore.Field object populated with this role under a standard key
func (role *Role) Zap() zapcore.Field { return zap.Object(common.KeyRole, role) }

// ZapUuid simply calls zap.String() with RoleUuid standard key and this role uuid
func (role *Role) ZapUuid() zapcore.Field { return zap.String(common.KeyRoleUuid, role.GetUuid()) }

// MarshalLogObject implements custom marshalling for logs
func (user *User) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("Uuid", user.Uuid)
	encoder.AddString("Login", user.Login)
	encoder.AddString("GroupPath", user.GroupPath)
	encoder.AddString("GroupLabel", user.GroupLabel)
	encoder.AddBool("IsGroup", user.IsGroup)
	if len(user.Attributes) > 100 {
		encoder.AddInt("AttributesNumber", len(user.Attributes))
	} else if len(user.Attributes) > 0 {
		_ = encoder.AddReflected("Attributes", user.Attributes)
	}
	encoder.AddBool("PoliciesContextEditable", user.PoliciesContextEditable)
	if len(user.Roles) > 10 {
		encoder.AddInt("RolesNumber", len(user.Roles))
	} else if len(user.Roles) > 0 {
		_ = encoder.AddReflected("Roles", user.Roles)
	}
	if len(user.Policies) > 100 {
		encoder.AddInt("PoliciesNumber", len(user.Policies))
	} else if len(user.Policies) > 0 {
		_ = encoder.AddReflected("Policies", user.Policies)
	}
	return nil
}

// Zap simply returns a zapcore.Field object populated with this user under a standard key
func (user *User) Zap() zapcore.Field { return zap.Object(common.KeyUser, user) }

// ZapUuid simply calls zap.String() with UserUuid standard key and this user uuid
func (user *User) ZapUuid() zapcore.Field { return zap.String(common.KeyUserUuid, user.GetUuid()) }

// ZapLogin simply calls zap.String() with Login standard key and this user login
func (user *User) ZapLogin() zapcore.Field { return zap.String(common.KeyUsername, user.GetLogin()) }

/*
POLICIES, ACLS
*/

// MarshalLogObject implements custom marshalling for logs
func (pg *PolicyGroup) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("Uuid", pg.GetUuid())
	encoder.AddString("Name", pg.GetName())
	encoder.AddString("Description", pg.GetDescription())
	encoder.AddString("OwnerUuid", pg.GetOwnerUuid())
	encoder.AddString("ResourceGroup", pg.GetResourceGroup().String())
	if len(pg.Policies) > 100 {
		encoder.AddInt("PoliciesNumber", len(pg.Policies))
	} else if len(pg.Policies) > 0 {
		_ = encoder.AddReflected("Policies", pg.Policies)
	}
	encoder.AddTime("LastUpdated", time.Unix(int64(pg.LastUpdated), 0))
	return nil
}

// Zap simply returns a zapcore.Field object populated with this policy group under a standard key
func (pg *PolicyGroup) Zap() zapcore.Field { return zap.Object(common.KeyPolicyGroup, pg) }

// ZapUuid simply calls zap.String() with PolicyGroupUuid standard key and this policy group uuid
func (pg *PolicyGroup) ZapUuid() zapcore.Field {
	return zap.String(common.KeyPolicyGroupUuid, pg.GetUuid())
}

// MarshalLogObject implements custom marshalling for logs
func (policy *Policy) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("Id", policy.GetID())
	encoder.AddString("Description", policy.GetDescription())
	encoder.AddReflected("Resources", policy.GetResources())
	encoder.AddReflected("Actions", policy.GetActions())
	encoder.AddReflected("Subjects", policy.GetSubjects())
	encoder.AddReflected("Conditions", policy.GetConditions())
	return nil
}

// Zap simply returns a zapcore.Field object populated with this policy under a standard key
func (policy *Policy) Zap() zapcore.Field { return zap.Object(common.KeyPolicy, policy) }

// ZapId simply calls zap.String() with PolicyId standard key and this policy id
func (policy *Policy) ZapId() zapcore.Field { return zap.String(common.KeyPolicyId, policy.GetID()) }

// MarshalLogObject implements custom marshalling for logs
func (acl *ACL) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("ID", acl.ID)
	encoder.AddString("NodeID", acl.NodeID)
	encoder.AddString("WorkspaceID", acl.WorkspaceID)
	encoder.AddString("RoleID", acl.RoleID)
	encoder.AddObject("Action", acl.Action)
	return nil
}

func (action *ACLAction) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("Name", action.Name)
	encoder.AddString("Value", action.Value)
	return nil
}

// Zap simply returns a zapcore.Field object populated with this acl under a standard key
func (acl *ACL) Zap() zapcore.Field { return zap.Object(common.KeyAcl, acl) }

// ZapId simply calls zap.String() with AclId standard key and this acl id
func (acl *ACL) ZapId() zapcore.Field { return zap.String(common.KeyAclId, acl.GetID()) }

/*         WORSPACES, CELLS
 */

// MarshalLogObject implements custom marshalling for logs
func (workspace *Workspace) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("UUID", workspace.UUID)
	encoder.AddString("Label", workspace.Label)
	encoder.AddString("Description", workspace.Description)
	encoder.AddString("Slug", workspace.Slug)
	encoder.AddString("Scope", workspace.Scope.String())
	encoder.AddTime("LastUpdated", time.Unix(int64(workspace.LastUpdated), 0))
	encoder.AddString("Attributes", workspace.Attributes)
	encoder.AddBool("PoliciesContextEditable", workspace.PoliciesContextEditable)
	if len(workspace.RootUUIDs) > 100 {
		encoder.AddInt("RootUUIDsNumber", len(workspace.RootUUIDs))
	} else if len(workspace.RootUUIDs) > 0 {
		_ = encoder.AddReflected("RootUUIDs", workspace.RootUUIDs)
	}
	if len(workspace.RootNodes) > 20 {
		encoder.AddInt("RootNodesNumber", len(workspace.RootNodes))
	} else if len(workspace.RootNodes) > 0 {
		_ = encoder.AddReflected("RootNodes", workspace.RootNodes)
	}
	if len(workspace.Policies) > 100 {
		encoder.AddInt("PoliciesNumber", len(workspace.Policies))
	} else if len(workspace.Policies) > 0 {
		_ = encoder.AddReflected("Policies", workspace.Policies)
	}
	return nil
}

// Zap simply returns a zapcore.Field object populated with this workspace under a standard key
func (workspace *Workspace) Zap() zapcore.Field { return zap.Object(common.KeyWorkspace, workspace) }

// ZapUuid simply calls zap.String() with WorkspaceUuid standard key and this Workspace uuid
func (workspace *Workspace) ZapUuid() zapcore.Field {
	return zap.String(common.KeyWorkspaceUuid, workspace.GetUUID())
}
