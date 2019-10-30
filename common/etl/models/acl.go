package models

import (
	"github.com/pydio/cells/common/proto/idm"
)

type ACL idm.ACL

func (a *ACL) Equals(o Differ) bool {
	other := o.(*ACL)

	res := a.NodeID == other.NodeID
	res = res && a.RoleID == other.RoleID
	res = res && a.WorkspaceID == other.WorkspaceID
	res = res && a.Action.Name == other.Action.Name && a.Action.Value == other.Action.Value

	return res
}

func (a *ACL) IsDeletable(m map[string]string) bool {
	return false
}

// test if two user can be mergeable whose the same login name and auth source
func (a *ACL) IsMergeable(o Differ) bool {
	other := o.(*ACL)

	res := a.NodeID == other.NodeID
	res = res && a.RoleID == other.RoleID
	res = res && a.WorkspaceID == other.WorkspaceID
	res = res && a.Action.Name == other.Action.Name
	return res
}

func (a *ACL) GetUniqueId() string {
	return "node" + a.NodeID + "role" + a.RoleID + "workspace" + a.WorkspaceID + "action" + a.Action.Name + a.Action.Value
}

func (a *ACL) Merge(o Differ, options map[string]string) (Differ, error) {
	return a, nil
}
