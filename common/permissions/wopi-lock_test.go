package permissions

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"
)

func TestWOPILockBypassMatchesOnlyExactNodeAndLock(t *testing.T) {
	ctx := WithWOPILockBypass(context.Background(), "node-a", "lock-a")

	bypass, ok := wopiLockBypassFromContext(ctx)
	if !ok || bypass.NodeUUID != "node-a" || bypass.LockID != "lock-a" {
		t.Fatal("expected exact WOPI lock bypass marker")
	}

	otherNode := &idm.ACL{NodeID: "node-b", Action: &idm.ACLAction{Name: AclLock.Name, Value: "lock-a"}}
	otherLock := &idm.ACL{NodeID: "node-a", Action: &idm.ACLAction{Name: AclLock.Name, Value: "lock-b"}}
	matching := &idm.ACL{NodeID: "node-a", Action: &idm.ACLAction{Name: AclLock.Name, Value: "lock-a"}}

	matches := func(acl *idm.ACL) bool {
		return acl.GetNodeID() == bypass.NodeUUID &&
			acl.GetAction().GetName() == AclLock.Name &&
			acl.GetAction().GetValue() == bypass.LockID
	}
	if matches(otherNode) || matches(otherLock) || !matches(matching) {
		t.Fatal("WOPI bypass did not enforce exact node and lock matching")
	}
}
