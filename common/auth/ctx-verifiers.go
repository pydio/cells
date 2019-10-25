package auth

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/utils/permissions"
)

func init() {
	AddContextVerifier(LockVerifier{})
	AddContextVerifier(OIDCPoliciesVerifier{})
}

type LockVerifier struct{}

func (l LockVerifier) Verify(ctx context.Context, user *idm.User) error {
	if permissions.IsUserLocked(user) {
		return fmt.Errorf("user is locked")
	}
	return nil
}

type OIDCPoliciesVerifier struct{}

func (O OIDCPoliciesVerifier) Verify(ctx context.Context, user *idm.User) error {
	return checkOIDCPolicies(ctx, user)
}
