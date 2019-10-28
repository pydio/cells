package models

import (
	"reflect"
	"strings"

	"github.com/imdario/mergo"
	"github.com/pydio/cells/common/proto/idm"
)

type User struct {
	*idm.User
}

func (u *User) Equal(other *idm.User) bool {
	result := u.Login == other.Login
	result = result && (u.Uuid == other.Uuid)
	result = result && (u.GroupLabel == other.GroupLabel)
	result = result && (u.IsGroup == other.IsGroup)
	result = result && (strings.TrimRight(u.GroupPath, "/") == strings.TrimRight(other.GroupPath, "/"))
	result = result && roleEqual(u.Roles, other.Roles)

	return result
}

// test if two user can be mergeable whose the same login name and auth source
func (u *User) IsMergeable(other *idm.User) bool {
	result := (u.Login == other.Login) && !u.IsGroup && !other.IsGroup
	result = result && (u.Attributes[idm.UserAttrOrigin] == other.Attributes[idm.UserAttrOrigin])
	return result && (u.Attributes[idm.UserAttrAuthSource] == other.Attributes[idm.UserAttrAuthSource])
}

func (u *User) IsEmpty() bool {
	return (u.Login == "") && (u.Uuid == "")
}

func (u *User) getRolesWithPrefix(prefix string) []*idm.Role {
	var ret []*idm.Role
	for _, role := range u.Roles {
		if strings.HasPrefix(role.Uuid, prefix) {
			ret = append(ret, role)
		}
	}
	return ret
}

func (u *User) getRolesWithoutPrefix(prefix string) []*idm.Role {
	var ret []*idm.Role
	for _, role := range u.Roles {
		if !strings.HasPrefix(role.Uuid, prefix) {
			ret = append(ret, role)
		}
	}
	return ret
}

func (u *User) GetUniqueId() string {
	return u.Attributes["AuthSource"] + "/" + u.Login
}

func (u *User) Merge(idmUser *idm.User, options *MergeOptions) (*idm.User, error, bool) {
	// If target user is Empty, that means it does not exist
	// Then do the merge.
	IdmUser := User{idmUser}
	if IdmUser.IsEmpty() {
		return u.User, nil, true
	}

	if u.Equal(idmUser) {
		return idmUser, nil, false
	}

	// If users are mergeable
	if u.IsMergeable(idmUser) {
		newUser := clone(idmUser)

		mergo.Merge(newUser, u.User, mergo.WithOverride, mergo.WithTransformers(&rolesTransfomer{options.ToMap()}))

		// This means something has changed
		if !reflect.DeepEqual(u.User, newUser) {
			// Making sure the source is set
			newUser.Attributes[idm.UserAttrOrigin] = options.Origin
			newUser.Attributes[idm.UserAttrAuthSource] = options.AuthSource

			return newUser, nil, true
		}
	}
	return nil, nil, false
}

func clone(idmUser *idm.User) *idm.User {
	ret := new(idm.User)
	ret.Password = idmUser.Password
	ret.GroupPath = idmUser.GroupPath
	ret.GroupLabel = idmUser.GroupLabel
	ret.Login = idmUser.Login
	ret.Uuid = idmUser.Uuid
	ret.Policies = idmUser.Policies
	for _, role := range idmUser.Roles {
		ret.Roles = append(ret.Roles, role)
	}
	ret.Attributes = make(map[string]string)
	for key, value := range idmUser.Attributes {
		ret.Attributes[key] = value
	}
	return ret
}

// Roles Transformers allows roles to be overriden during a merge
type rolesTransfomer struct {
	options map[string]string
}

func (t rolesTransfomer) Transformer(typ reflect.Type) func(dst, src reflect.Value) error {
	if typ == reflect.TypeOf([]*idm.Role{}) {
		return func(dst, src reflect.Value) error {
			rolesMap := make(map[string][]*Role)

			for _, dstRole := range dst.Interface().([]*idm.Role) {
				dstRoleModel := (*Role)(dstRole)
				uuid := dstRoleModel.GetUniqueId()

				if !strings.HasPrefix(uuid, t.options["RolePrefix"]) {
					rolesMap[dstRoleModel.GetUniqueId()] = []*Role{dstRoleModel}
				}
			}

			for _, srcRole := range src.Interface().([]*idm.Role) {
				srcRoleModel := (*Role)(srcRole)

				if tmp, ok := rolesMap[srcRoleModel.GetUniqueId()]; ok {
					rolesMap[srcRoleModel.GetUniqueId()] = append(tmp, srcRoleModel)
				} else {
					rolesMap[srcRoleModel.GetUniqueId()] = []*Role{srcRoleModel}
				}
			}

			var roles []*idm.Role
			for _, rolesToMerge := range rolesMap {
				if len(rolesToMerge) > 1 {
					rolesToMerge[0].Merge(rolesToMerge[1], t.options)
				}
				roles = append(roles, (*idm.Role)(rolesToMerge[0]))
			}

			if dst.CanSet() {
				dst.Set(reflect.ValueOf(roles))
			}
			return nil
		}
	}
	return nil
}

func roleEqual(roles1 []*idm.Role, roles2 []*idm.Role) bool {
	if roles1 == nil && roles2 == nil {
		return true
	}
	if roles1 == nil || roles2 == nil {
		return false
	}

	if len(roles1) != len(roles2) {
		return false
	}

	for i := range roles1 {
		if roles1[i].Uuid != roles2[i].Uuid {
			return false
		}
	}
	return true
}
