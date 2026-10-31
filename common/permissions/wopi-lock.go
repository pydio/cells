/*
 * Copyright (c) 2026. Pydio Cells Personal Fork contributors.
 * This file is part of the Pydio Cells Personal Fork.
 *
 * Licensed under the GNU Affero General Public License, version 3 or later.
 */

package permissions

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
)

const WOPILockExpiration = 30 * time.Minute

type wopiLockBypassContextKey struct{}

type WOPILockBypass struct {
	NodeUUID string
	LockID   string
}

// WithWOPILockBypass marks one already-validated WOPI node lock as owned by
// the current PutFile operation. The regular Cells lock filter consumes this
// marker; callers must never use it before validating the stored lock ID.
func WithWOPILockBypass(ctx context.Context, nodeUUID, lockID string) context.Context {
	return context.WithValue(ctx, wopiLockBypassContextKey{}, WOPILockBypass{
		NodeUUID: nodeUUID,
		LockID:   lockID,
	})
}

func wopiLockBypassFromContext(ctx context.Context) (WOPILockBypass, bool) {
	bypass, ok := ctx.Value(wopiLockBypassContextKey{}).(WOPILockBypass)
	return bypass, ok && bypass.NodeUUID != "" && bypass.LockID != ""
}

func wopiLockQuery(nodeUUID, lockID string) (*service.Query, error) {
	if nodeUUID == "" {
		return nil, fmt.Errorf("WOPI node UUID is required")
	}
	action := &idm.ACLAction{Name: AclLock.Name, Value: lockID}
	query, err := anypb.New(&idm.ACLSingleQuery{
		NodeIDs: []string{nodeUUID},
		Actions: []*idm.ACLAction{action},
	})
	if err != nil {
		return nil, err
	}
	return &service.Query{
		SubQueries: []*anypb.Any{query},
		Operation:  service.OperationType_AND,
	}, nil
}

// GetWOPILock returns the active WOPI lock ID for a node, if any.
func GetWOPILock(ctx context.Context, nodeUUID string) (string, bool, error) {
	query, err := wopiLockQuery(nodeUUID, "")
	if err != nil {
		return "", false, err
	}
	stream, err := idmc.ACLServiceClient(ctx).SearchACL(ctx, &idm.SearchACLRequest{Query: query})
	if err != nil {
		return "", false, err
	}

	var lockID string
	err = commons.ForEach(stream, nil, func(response *idm.SearchACLResponse) error {
		value := response.GetACL().GetAction().GetValue()
		if lockID != "" && lockID != value {
			return fmt.Errorf("multiple active WOPI locks found for node %s", nodeUUID)
		}
		lockID = value
		return nil
	})
	if err != nil {
		return "", false, err
	}
	return lockID, lockID != "", nil
}

// AcquireWOPILock creates an expiring ACL lock. The ACL's unique key makes
// acquisition atomic across Cells processes and supported database backends.
func AcquireWOPILock(ctx context.Context, nodeUUID, lockID string, ttl time.Duration) error {
	if lockID == "" {
		return fmt.Errorf("WOPI lock ID is required")
	}
	if ttl <= 0 || ttl > WOPILockExpiration {
		return fmt.Errorf("WOPI lock expiration must be between 0 and %s", WOPILockExpiration)
	}

	aclClient := idmc.ACLServiceClient(ctx)
	_, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{
		ACL: &idm.ACL{
			NodeID: nodeUUID,
			Action: &idm.ACLAction{Name: AclLock.Name, Value: lockID},
		},
	})
	if err != nil {
		return err
	}

	query, err := wopiLockQuery(nodeUUID, lockID)
	if err == nil {
		var response *idm.ExpireACLResponse
		response, err = aclClient.ExpireACL(ctx, &idm.ExpireACLRequest{
			Query:     query,
			Timestamp: time.Now().Add(ttl).Unix(),
		})
		if err == nil && response.GetRows() == 0 {
			err = fmt.Errorf("new WOPI lock could not be assigned an expiry")
		}
	}
	if err != nil {
		// Never leave a lock behind without its required expiry.
		if query != nil {
			_, _ = aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: query})
		}
		return err
	}
	return nil
}

// RefreshWOPILock extends the expiry only when both the node and lock ID match.
func RefreshWOPILock(ctx context.Context, nodeUUID, lockID string, ttl time.Duration) error {
	if ttl <= 0 || ttl > WOPILockExpiration {
		return fmt.Errorf("WOPI lock expiration must be between 0 and %s", WOPILockExpiration)
	}
	query, err := wopiLockQuery(nodeUUID, lockID)
	if err != nil {
		return err
	}
	response, err := idmc.ACLServiceClient(ctx).ExpireACL(ctx, &idm.ExpireACLRequest{
		Query:     query,
		Timestamp: time.Now().Add(ttl).Unix(),
	})
	if err != nil {
		return err
	}
	if response.GetRows() == 0 {
		return fmt.Errorf("WOPI lock does not match the active lock for node %s", nodeUUID)
	}
	return nil
}

// ReleaseWOPILock deletes only the matching node and lock ID.
func ReleaseWOPILock(ctx context.Context, nodeUUID, lockID string) (int64, error) {
	if lockID == "" {
		return 0, fmt.Errorf("WOPI lock ID is required")
	}
	query, err := wopiLockQuery(nodeUUID, lockID)
	if err != nil {
		return 0, err
	}
	response, err := idmc.ACLServiceClient(ctx).DeleteACL(ctx, &idm.DeleteACLRequest{Query: query})
	if err != nil {
		return 0, err
	}
	return response.GetRowsDeleted(), nil
}
