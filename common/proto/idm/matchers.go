package idm

import (
	"path"
	"strings"

	service "github.com/pydio/cells/common/service/proto"
)

// Matcher interface provides a way to filter idm objects with standard XXXSingleQueries.
type Matcher interface {
	// Matches tries to apply a *SingleQuery on an existing object
	Matches(idmObject interface{}) bool
}

func (m *RoleSingleQuery) Matches(idmObject interface{}) bool {
	if role, ok := idmObject.(*Role); !ok {
		return false
	} else {
		return m.matches(role)
	}
}

func (m *RoleSingleQuery) matches(role *Role) bool {

	var bb []bool
	if len(m.Uuid) > 0 {
		bb = append(bb, sliceContains(m.Uuid, role.Uuid))
	}
	if m.Label != "" {
		bb = append(bb, compareStrings(role.Label, m.Label))
	}
	if m.HasAutoApply {
		bb = append(bb, len(role.AutoApplies) > 0)
	}
	if m.IsTeam {
		bb = append(bb, role.IsTeam)
	}
	if m.IsGroupRole {
		bb = append(bb, role.GroupRole)
	}
	if m.IsUserRole {
		bb = append(bb, role.UserRole)
	}

	return flattenBool(bb, m.Not)
}

func (m *WorkspaceSingleQuery) Matches(idmObject interface{}) bool {
	if ws, ok := idmObject.(*Workspace); !ok {
		return false
	} else {
		return m.matches(ws)
	}
}

func (m *WorkspaceSingleQuery) matches(ws *Workspace) bool {
	var bb []bool
	if len(m.Uuid) > 0 {
		bb = append(bb, m.Uuid == ws.UUID)
	}
	if len(m.Label) > 0 {
		bb = append(bb, compareStrings(ws.Label, m.Label))
	}
	if len(m.Slug) > 0 {
		bb = append(bb, compareStrings(ws.Slug, m.Slug))
	}
	if len(m.Description) > 0 {
		bb = append(bb, compareStrings(ws.Description, m.Description))
	}
	if m.Scope != WorkspaceScope_ANY {
		bb = append(bb, m.Scope == ws.Scope)
	}
	return flattenBool(bb, m.Not)
}

func (m *ACLSingleQuery) Matches(idmObject interface{}) bool {
	if acl, ok := idmObject.(*ACL); !ok {
		return false
	} else {
		return m.matches(acl)
	}
}

func (m *ACLSingleQuery) matches(acl *ACL) bool {
	var bb []bool
	if len(m.WorkspaceIDs) > 0 {
		bb = append(bb, sliceContains(m.WorkspaceIDs, acl.WorkspaceID))
	}
	if len(m.RoleIDs) > 0 {
		bb = append(bb, sliceContains(m.RoleIDs, acl.RoleID))
	}
	if len(m.NodeIDs) > 0 {
		bb = append(bb, sliceContains(m.NodeIDs, acl.NodeID))
	}
	if len(m.Actions) > 0 {
		var ab []bool
		for _, ac := range m.Actions {
			if ac.Value == "" {
				// Check only name
				ab = append(ab, ac.Name == acl.Action.Name)
			} else {
				ab = append(ab, ac.Name == acl.Action.Name && compareStrings(acl.Action.Value, ac.Value))
			}
		}
		bb = append(bb, service.ReduceQueryBooleans(ab, service.OperationType_OR))
	}
	return flattenBool(bb, m.Not)
}

func (m *UserSingleQuery) Matches(idmObject interface{}) bool {
	if u, ok := idmObject.(*User); !ok {
		return false
	} else {
		return m.matches(u)
	}
}

func (m *UserSingleQuery) matches(user *User) bool {
	var bb []bool
	if m.Uuid != "" {
		bb = append(bb, user.Uuid == m.Uuid)
	}
	if m.Login != "" {
		bb = append(bb, user.Login == m.Login)
	}
	if m.NodeType != NodeType_UNKNOWN {
		bb = append(bb, (user.IsGroup && m.NodeType == NodeType_GROUP) || (!user.IsGroup && m.NodeType == NodeType_USER))
	}
	if m.GroupPath != "" {
		bb = append(bb, compareStrings(user.GroupPath, m.GroupPath))
	}
	if m.FullPath != "" {
		bb = append(bb, compareStrings(path.Join(user.GroupPath+user.GroupLabel), m.FullPath))
	}
	if m.HasRole != "" {
		var has bool
		for _, r := range user.Roles {
			if r.Uuid == m.HasRole {
				has = true
			}
		}
		bb = append(bb, has)
	}
	if m.AttributeName != "" {
		if user.Attributes == nil {
			bb = append(bb, false)
		} else if uA, ok := user.Attributes[m.AttributeName]; ok {
			if m.AttributeAnyValue {
				bb = append(bb, true)
			} else {
				bb = append(bb, uA == m.AttributeValue)
			}
		} else {
			bb = append(bb, false)
		}
	}
	return flattenBool(bb, m.Not)
}

func flattenBool(bb []bool, isNot bool) bool {
	result := service.ReduceQueryBooleans(bb, service.OperationType_AND)
	if isNot {
		return !result
	} else {
		return result
	}
}

func sliceContains(ss []string, s string) bool {
	for _, v := range ss {
		if v == s {
			return true
		}
	}
	return false
}

func compareStrings(ref, search string) bool {
	// Basic search: can have wildcard on left, right, or none (exact search)
	var left, right bool
	if strings.HasPrefix(search, "*") {
		left = true
	}
	if strings.HasSuffix(search, "*") {
		right = true
	}
	search = strings.Trim(search, "*")
	if left || right {
		// If not exact search, lowerCase
		ref = strings.ToLower(ref)
		search = strings.ToLower(search)
	}
	if left && right && !strings.Contains(ref, search) { // *part*
		return false
	} else if right && !left && !strings.HasPrefix(ref, search) { // start*
		return false
	} else if left && !right && !strings.HasSuffix(ref, search) { // *end
		return false
	} else if !left && !right && ref != search { // exact term
		return false
	}
	return true
}
