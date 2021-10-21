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

package common

// Define string used as keys.
const (
	KeyMsgId  = "MsgId"
	KeyTs     = "Ts"
	KeyNano   = "Nano"
	KeyLevel  = "Level"
	KeyLogger = "Logger"
	KeyMsg    = "Msg"
)

// Known audit message IDs
const (
	// Login
	AuditLoginSucceed      = "1"
	AuditLoginFailed       = "2"
	AuditLoginPolicyDenial = "3"
	AuditInvalidJwt        = "4"
	AuditLockUser          = "5"

	// Tree events
	AuditNodeCreate     = "11"
	AuditNodeRead       = "12"
	AuditNodeList       = "13"
	AuditNodeUpdate     = "14"
	AuditNodeDelete     = "15"
	AuditWsCreate       = "16"
	AuditWsUpdate       = "17"
	AuditWsDelete       = "18"
	AuditNodeMovedToBin = "19"

	// S3 Objects
	AuditObjectGet = "21"
	AuditObjectPut = "22"

	// Users, Group, Roles
	AuditUserCreate  = "41"
	AuditUserRead    = "42"
	AuditUserUpdate  = "43"
	AuditUserDelete  = "44"
	AuditGroupCreate = "46"
	AuditGroupRead   = "47"
	AuditGroupUpdate = "48"
	AuditGroupDelete = "49"
	AuditRoleCreate  = "51"
	AuditRoleRead    = "52"
	AuditRoleUpdate  = "53"
	AuditRoleDelete  = "54"

	// Policies
	AuditPolicyGroupStore  = "61"
	AuditPolicyGroupDelete = "62"
	AuditPolicyStore       = "63"
	AuditPolicyDelete      = "64"

	// ShareLinks And Cells
	AuditCellCreate = "71"
	AuditCellRead   = "72"
	AuditCellUpdate = "73"
	AuditCellDelete = "74"
	AuditLinkCreate = "75"
	AuditLinkRead   = "76"
	AuditLinkUpdate = "77"
	AuditLinkDelete = "78"
)

// Known audit message IDs
const (
	KeyContext = "Context"

	// Follow a given request between the various services
	KeySpanUuid       = "SpanUuid"
	KeySpanParentUuid = "SpanParentUuid"
	KeySpanRootUuid   = "SpanRootUuid"

	// Group messages for a given high level operation
	KeyOperationUuid  = "OperationUuid"
	KeyOperationLabel = "OperationLabel"

	KeyNode     = "Node"
	KeyNodeUuid = "NodeUuid"
	KeyNodePath = "NodePath"

	KeyWorkspace      = "Workspace"
	KeyWorkspaceUuid  = "WorkspaceUuid"
	KeyWorkspaceScope = "WorkspaceScope"

	KeyChangeLog        = "ChangeLog"
	KeyNodeChangeEvent  = "NodeChangeEvent"
	KeyVersioningPolicy = "VersioningPolicy"

	KeyActivitySubscription  = "ActivitySubscription"
	KeyActivityStreamRequest = "StreamActivitiesRequest"
	KeyActivityPostEvent     = "PostActivityEvent"
	KeyActivityObject        = "ActivityObject"

	KeyRole     = "Role"
	KeyRoleUuid = "RoleUuid"
	KeyRoles    = "Roles"
	KeyProfile  = "Profile"

	KeyUser     = "User"
	KeyUsername = "UserName"
	KeyUserUuid = "UserUuid"

	KeyGroupPath = "GroupPath"

	KeyConnector = "Connector"

	// Should be ACL and ACLID if we use proto names, changed to stay homogeneous with the other fields
	KeyAcl   = "Acl"
	KeyAclId = "AclId"

	// Pydio internal merged representation of all ACLs that a user has access to
	KeyAccessList = "AccessList"

	KeyPolicyGroup     = "PolicyGroup"
	KeyPolicyGroupUuid = "PolicyGroupUuid"
	KeyPolicy          = "Policy"
	KeyPolicyId        = "PolicyId"
	KeyPolicyRequest   = "PolicyRequest"

	// Scheduler
	KeyJob      = "Job"
	KeyJobId    = "JobId"
	KeyAction   = "Action"
	KeyActionId = "ActionId"
	KeyTask     = "Task"
	KeyTaskId   = "TaskId"
	// Running tasks in scheduler
	KeySchedulerJobId      = "SchedulerJobUuid"
	KeySchedulerTaskId     = "SchedulerTaskUuid"
	KeySchedulerActionPath = "SchedulerTaskActionPath"

	// Cells
	KeyCell     = "Cell"
	KeyCellUuid = "CellUuid"
	KeyLink     = "ShareLink"
	KeyLinkUuid = "ShareLinkUuid"

	// Chat
	KeyChatRoom        = "ChatRoom"
	KeyChatListRoomReq = "ChatListRoomRequest"
	KeyChatListMsgReq  = "ChatListMsgRequest"
	KeyChatPostMsgReq  = "ChatPostMsgRequest"
)

// Keys for the front end
const (
	KeyFrontIp      = "FrontIp"
	KeyFrontUserid  = "UserId"
	KeyFrontWksid   = "WorkspaceId"
	KeyFrontSource  = "Source"
	KeyFrontPrefix  = "Prefix"
	KeyFrontMessage = "Message"
	KeyFrontNodes   = "Nodes"
)

var (
	LogEventLabels = map[string]string{
		AuditLoginSucceed: "Login succeed",
		AuditLoginFailed:  "Login failed",
		AuditNodeCreate:   "Create Node",
		AuditNodeRead:     "Read Node",
		AuditNodeList:     "List Node",
		AuditNodeUpdate:   "Upadate Node",
		AuditNodeDelete:   "Delete Node",
		AuditObjectGet:    "Get Object",
		AuditObjectPut:    "Put Object",
	}
)
