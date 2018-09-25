package idm

import (
	"context"
	"strings"

	"github.com/golang/protobuf/proto"
)

func (u *User) WithPublicData(ctx context.Context, policiesContextEditable bool) *User {

	user := proto.Clone(u).(*User)
	if user.Attributes == nil {
		user.Attributes = make(map[string]string)
	}
	user.PoliciesContextEditable = policiesContextEditable

	for k, _ := range user.Attributes {
		if strings.HasPrefix(k, "pydio:") {
			delete(user.Attributes, k)
			continue
		}
	}

	if !user.PoliciesContextEditable {
		for k, _ := range user.Attributes {
			if k == "email" {
				// Special treatment
				user.Attributes["hasEmail"] = "true"
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
		"displayName",
		"avatar",
		"profile",
		"hasEmail",
	}
	for _, a := range publicAttributes {
		if a == att {
			return true
		}
	}

	return
}
