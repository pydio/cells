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

package common

const (

	// Meta keys
	KEY_MSG_ID = "MsgId"
	KEY_TS     = "Ts"
	KEY_LEVEL  = "Level"
	KEY_LOGGER = "Logger"
	KEY_MSG    = "Msg"

	/* AUDIT MANAGEMENT */

	// Known audit message IDs
	// NOTE: also update the below label map when adding a new value
	AUDIT_LOGIN_SUCCEED       = "1"
	AUDIT_LOGIN_FAILED        = "2"
	AUDIT_LOGIN_POLICY_DENIAL = "3"
	AUDIT_INVALID_JWT         = "4"
	AUDIT_OBJECT_GET          = "21"
	AUDIT_OBJECT_PUT          = "22"
	// Tree events
	AUDIT_NODE_CREATE = "11"
	AUDIT_NODE_READ   = "12"
	AUDIT_NODE_LIST   = "13"
	AUDIT_NODE_UPDATE = "14"
	AUDIT_NODE_DELETE = "15"
	AUDIT_WS_CREATE   = "16"
	AUDIT_WS_UPDATE   = "17"
	AUDIT_WS_DELETE   = "18"
	// Users, Group, Roles
	AUDIT_USER_CREATE  = "41"
	AUDIT_USER_READ    = "42"
	AUDIT_USER_UPDATE  = "43"
	AUDIT_USER_DELETE  = "44"
	AUDIT_GROUP_CREATE = "46"
	AUDIT_GROUP_READ   = "47"
	AUDIT_GROUP_UPDATE = "48"
	AUDIT_GROUP_DELETE = "49"
	AUDIT_ROLE_CREATE  = "51"
	AUDIT_ROLE_READ    = "52"
	AUDIT_ROLE_UPDATE  = "53"
	AUDIT_ROLE_DELETE  = "54"
	// POLICIES
	AUDIT_POLICY_GROUP_STORE  = "61"
	AUDIT_POLICY_GROUP_DELETE = "62"
	AUDIT_POLICY_STORE        = "63"
	AUDIT_POLICY_DELETE       = "64"
	// ShareLinks And Cells
	AUDIT_CELL_CREATE = "71"
	AUDIT_CELL_READ   = "72"
	AUDIT_CELL_UPDATE = "73"
	AUDIT_CELL_DELETE = "74"
	AUDIT_LINK_CREATE = "75"
	AUDIT_LINK_READ   = "76"
	AUDIT_LINK_UPDATE = "77"
	AUDIT_LINK_DELTE  = "78"

	/* BACK END */

	// CONTEXT
	KEY_CONTEXT          = "Context"
	KEY_SPAN_UUID        = "SpanUuid"
	KEY_SPAN_PARENT_UUID = "SpanParentUuid"
	KEY_SPAN_ROOT_UUID   = "SpanRootUuid"

	// NODE
	KEY_NODE      = "Node"
	KEY_NODE_UUID = "NodeUuid"
	KEY_NODE_PATH = "NodePath"

	KEY_WORKSPACE       = "Workspace"
	KEY_WORKSPACE_UUID  = "WorkspaceUuid"
	KEY_WORKSPACE_SCOPE = "WorkspaceScope"

	KEY_CHANGE_LOG        = "ChangeLog"
	KEY_NODE_CHANGE_EVENT = "NodeChangeEvent"
	KEY_VERSIONING_POLICY = "VersioningPolicy"

	KEY_ACTIVITY_SUBSCRIPTION   = "ActivitySubscription"
	KEY_ACTIVITY_STREAM_REQUEST = "StreamActivitiesRequest"
	KEY_ACTIVITY_POST_EVENT     = "PostActivityEvent"
	KEY_ACTIVITY_OBJECT         = "ActivityObject"

	// USERS & IDM
	KEY_ROLE      = "Role"
	KEY_ROLE_UUID = "RoleUuid"
	KEY_ROLES     = "Roles"
	KEY_PROFILE   = "Profile"

	KEY_USER      = "User"
	KEY_USERNAME  = "UserName"
	KEY_USER_UUID = "UserUuid"

	KEY_GROUP_PATH = "GroupPath"

	KEY_CONNECTOR = "Connector"

	// Should be ACL and ACLID if we use proto names, changed to stay homogeneous with the other fields
	KEY_ACL    = "Acl"
	KEY_ACL_ID = "AclId"
	// Pydio internal merged representation of all ACLs that a user has access to
	KEY_ACCESS_LIST = "AccessList"

	KEY_POLICY_GROUP      = "PolicyGroup"
	KEY_POLICY_GROUP_UUID = "PolicyGroupUuid"
	KEY_POLICY            = "Policy"
	KEY_POLICY_ID         = "PolicyId"
	KEY_POLICY_REQUEST    = "PolicyRequest"

	// JOB
	KEY_JOB    = "Job"
	KEY_JOB_ID = "JobId"

	KEY_ACTION    = "Action"
	KEY_ACTION_ID = "ActionId"

	KEY_TASK    = "Task"
	KEY_TASK_ID = "TaskId"

	// CELLS
	KEY_CELL      = "Cell"
	KEY_CELL_UUID = "CellUuid"
	KEY_LINK      = "ShareLink"
	KEY_LINK_UUID = "ShareLinkUuid"

	// CHAT
	KEY_CHAT_ROOM          = "ChatRoom"
	KEY_CHAT_LIST_ROOM_REQ = "ChatListRoomRequest"
	KEY_CHAT_LIST_MSG_REQ  = "ChatListMsgRequest"
	KEY_CHAT_POST_MSG_REQ  = "ChatPostMsgRequest"

	/* FRONT END */

	// FRONT LOGS
	KEY_FRONT_IP      = "FrontIp"
	KEY_FRONT_USERID  = "UserId"
	KEY_FRONT_WKSID   = "WorkspaceId"
	KEY_FRONT_SOURCE  = "Source"
	KEY_FRONT_PREFIX  = "Prefix"
	KEY_FRONT_MESSAGE = "Message"
	KEY_FRONT_NODES   = "Nodes"
)

var (
	LogEventLabels = map[string]string{
		AUDIT_LOGIN_SUCCEED: "Login succeed",
		AUDIT_LOGIN_FAILED:  "Login failed",
		AUDIT_NODE_CREATE:   "Create Node",
		AUDIT_NODE_READ:     "Read Node",
		AUDIT_NODE_LIST:     "List Node",
		AUDIT_NODE_UPDATE:   "Upadate Node",
		AUDIT_NODE_DELETE:   "Delete Node",
		AUDIT_OBJECT_GET:    "Get Object",
		AUDIT_OBJECT_PUT:    "Put Object",
	}
)
