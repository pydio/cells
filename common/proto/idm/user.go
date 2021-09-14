package idm

import (
	"context"
	"strings"

	"github.com/golang/protobuf/proto"
)

const (
	UserAttrPrivatePrefix = "pydio:"
	UserAttrPassHashed    = UserAttrPrivatePrefix + "password_hashed"
	UserAttrLabelLike     = UserAttrPrivatePrefix + "labelLike"
	UserAttrOrigin        = UserAttrPrivatePrefix + "origin"

	UserAttrDisplayName = "displayName"
	UserAttrProfile     = "profile"
	UserAttrAvatar      = "avatar"
	UserAttrEmail       = "email"
	UserAttrHasEmail    = "hasEmail"
	UserAttrAuthSource  = "AuthSource"
	UserAttrHidden      = "hidden"
)

func (u *User) WithPublicData(ctx context.Context, policiesContextEditable bool) *User {

	user := proto.Clone(u).(*User)
	if user.Attributes == nil {
		user.Attributes = make(map[string]string)
	}
	user.PoliciesContextEditable = policiesContextEditable

	for k, _ := range user.Attributes {
		if strings.HasPrefix(k, UserAttrPrivatePrefix) {
			delete(user.Attributes, k)
			continue
		}
	}

	if !user.PoliciesContextEditable {
		for k, _ := range user.Attributes {
			if k == UserAttrEmail {
				// Special treatment
				user.Attributes[UserAttrHasEmail] = "true"
				delete(user.Attributes, k)
			}
			if !isPublicAttribute(k) {
				delete(user.Attributes, k)
			}
		}
	}

	return user
}

func isPublicAttribute(att string) (public bool) {

	publicAttributes := []string{
		UserAttrDisplayName,
		UserAttrAvatar,
		UserAttrProfile,
		UserAttrHasEmail,
	}
	for _, a := range publicAttributes {
		if a == att {
			return true
		}
	}

	return
}

func (u *User) IsHidden() bool {
	if u == nil || u.Attributes == nil {
		return false
	}
	if h, o := u.Attributes[UserAttrHidden]; o && h == "true" {
		return true
	}
	return false
}
