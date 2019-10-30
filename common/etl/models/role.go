package models

import "github.com/pydio/cells/common/proto/idm"

type Role idm.Role

func (r *Role) Equals(differ Differ) bool {
	// If not Team Role, say Equal=true to avoid overriding existing
	return !r.IsTeam
}

func (r *Role) IsDeletable(m map[string]string) bool {
	return false
}

func (r *Role) IsMergeable(d Differ) bool {
	return r.Uuid == (d).(*Role).Uuid
}

func (r *Role) GetUniqueId() string {
	return r.Uuid
}

func (r *Role) Merge(differ Differ, params map[string]string) (Differ, error) {
	// Return target
	return differ, nil
}
