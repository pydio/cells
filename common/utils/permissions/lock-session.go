package permissions

import (
	"context"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	service "github.com/pydio/cells/common/service/proto"
)

type SessionLocker interface {
	Lock(ctx context.Context) error
	UpdateExpiration(ctx context.Context, expireAfter time.Duration) error
	Unlock(ctx context.Context) error
}

type LockSession struct {
	nodeUUID    string
	sessionUUID string
	expireAfter time.Duration
}

// NewLockSession creates a new LockSession object
func NewLockSession(nodeUUID, sessionUUID string, expireAfter time.Duration) *LockSession {
	return &LockSession{
		nodeUUID:    nodeUUID,
		sessionUUID: sessionUUID,
		expireAfter: expireAfter,
	}
}

// Lock sets an expirable lock ACL on the NodeUUID with SessionUUID as value
func (l *LockSession) Lock(ctx context.Context) error {

	lock := &idm.ACLAction{Name: AclLock.Name, Value: l.sessionUUID}
	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	if _, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{
		ACL: &idm.ACL{
			NodeID: l.nodeUUID,
			Action: lock,
		},
	}); err != nil {
		return err
	}

	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{lock},
		NodeIDs: []string{l.nodeUUID},
	})

	if _, err := aclClient.ExpireACL(ctx, &idm.ExpireACLRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{q},
		},
		Timestamp: time.Now().Add(l.expireAfter).Unix(),
	}); err != nil {
		return err
	}
	return nil

}

// UpdateExpiration set a new expiration date on the current lock
func (l *LockSession) UpdateExpiration(ctx context.Context, expireAfter time.Duration) error {

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{{Name: AclLock.Name, Value: l.sessionUUID}},
		NodeIDs: []string{l.nodeUUID},
	})

	if _, err := aclClient.ExpireACL(ctx, &idm.ExpireACLRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{q},
		},
		Timestamp: time.Now().Add(expireAfter).Unix(),
	}); err != nil {
		return err
	}
	return nil

}

// Unlock manually removes the ACL
func (l *LockSession) Unlock(ctx context.Context) error {

	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{{Name: AclLock.Name, Value: l.sessionUUID}},
	})

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	_, err := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{q},
		},
	})
	return err

}
