/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
)

/* idm.go file enriches default genrated proto structs with some custom pydio methods to ease development */

/*         ROLE, USER AND GROUPS
 */

// Zap simply returns a zapcore.Field object populated with this role under a standard key
func (role *Role) Zap() zapcore.Field { return zap.Any(common.KEY_ROLE, role) }

// ZapUuid simply calls zap.String() with RoleUuid standard key and this role uuid
func (role *Role) ZapUuid() zapcore.Field { return zap.String(common.KEY_ROLE_UUID, role.GetUuid()) }

// Zap simply returns a zapcore.Field object populated with this user under a standard key
func (user *User) Zap() zapcore.Field { return zap.Any(common.KEY_USER, user) }

// ZapUuid simply calls zap.String() with UserUuid standard key and this user uuid
func (user *User) ZapUuid() zapcore.Field { return zap.String(common.KEY_USER_UUID, user.GetUuid()) }

// ZapUuid simply calls zap.String() with Login standard key and this user login
func (user *User) ZapLogin() zapcore.Field { return zap.String(common.KEY_USERNAME, user.GetLogin()) }

/*         POLICIES, ACLS
 */

// Zap simply returns a zapcore.Field object populated with this policy group under a standard key
func (pg *PolicyGroup) Zap() zapcore.Field { return zap.Any(common.KEY_POLICY_GROUP, pg) }

// ZapUuid simply calls zap.String() with PolicyGroupUuid standard key and this policy group uuid
func (pg *PolicyGroup) ZapUuid() zapcore.Field {
	return zap.String(common.KEY_POLICY_GROUP_UUID, pg.GetUuid())
}

// Zap simply returns a zapcore.Field object populated with this policy under a standard key
func (policy *Policy) Zap() zapcore.Field { return zap.Any(common.KEY_POLICY, policy) }

// ZapId simply calls zap.String() with PolicyId standard key and this policy id
func (policy *Policy) ZapId() zapcore.Field { return zap.String(common.KEY_POLICY_ID, policy.GetId()) }

// Zap simply returns a zapcore.Field object populated with this acl under a standard key
func (acl *ACL) Zap() zapcore.Field { return zap.Any(common.KEY_ACL, acl) }

// ZapId simply calls zap.String() with AclId standard key and this acl id
func (acl *ACL) ZapId() zapcore.Field { return zap.String(common.KEY_ACL_ID, acl.GetID()) }

/*         WORSPACES, CELLS
 */

// Zap simply returns a zapcore.Field object populated with this workspace under a standard key
func (workspace *Workspace) Zap() zapcore.Field { return zap.Any(common.KEY_WORKSPACE, workspace) }

// ZapUuid simply calls zap.String() with WorkspaceUuid standard key and this Workspace uuid
func (workspace *Workspace) ZapUuid() zapcore.Field {
	return zap.String(common.KEY_WORKSPACE_UUID, workspace.GetUUID())
}
