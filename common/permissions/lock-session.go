/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package permissions

import (
	"context"
	"strings"
	"time"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

type SessionLocker interface {
	Lock(ctx context.Context) error
	UpdateExpiration(ctx context.Context, expireAfter time.Duration) error
	Unlock(ctx context.Context) error
	AddChildTarget(parentUUID, targetChildName string)
}

type LockSession struct {
	nodeUUID    string
	sessionUUID string
	expireAfter time.Duration

	targetParentUuid string
	targetChildName  string
}

// NewLockSession creates a new LockSession object
func NewLockSession(nodeUUID, sessionUUID string, expireAfter time.Duration) *LockSession {
	return &LockSession{
		nodeUUID:    nodeUUID,
		sessionUUID: sessionUUID,
		expireAfter: expireAfter,
	}
}

func (l *LockSession) AddChildTarget(parentUUID, targetChildName string) {
	l.targetParentUuid = parentUUID
	l.targetChildName = targetChildName
}

// Lock sets an expirable lock ACL on the NodeUUID with SessionUUID as value
func (l *LockSession) Lock(ctx context.Context) error {

	aclClient := idmc.ACLServiceClient(ctx)

	if l.nodeUUID != "" {
		lock := &idm.ACLAction{Name: AclLock.Name, Value: l.sessionUUID}
		if err := l.create(ctx, aclClient, l.nodeUUID, lock); err != nil {
			return err
		}
		if err := l.updateExpiration(ctx, aclClient, l.nodeUUID, lock, l.expireAfter); err != nil {
			return err
		}
	}

	if l.targetParentUuid != "" && l.targetChildName != "" {
		childLock := &idm.ACLAction{Name: AclChildLock.Name + ":" + l.targetChildName, Value: l.sessionUUID}
		if err := l.create(ctx, aclClient, l.targetParentUuid, childLock); err != nil {
			return err
		}
		if err := l.updateExpiration(ctx, aclClient, l.targetParentUuid, childLock, l.expireAfter); err != nil {
			return err
		}
	}

	return nil

}

// UpdateExpiration set a new expiration date on the current lock
func (l *LockSession) UpdateExpiration(ctx context.Context, expireAfter time.Duration) error {

	aclClient := idmc.ACLServiceClient(ctx)
	if l.nodeUUID != "" {
		searchLock := &idm.ACLAction{Name: AclLock.Name, Value: l.sessionUUID}
		if err := l.updateExpiration(ctx, aclClient, l.nodeUUID, searchLock, expireAfter); err != nil {
			return err
		}
	}

	if l.targetParentUuid != "" && l.targetChildName != "" {
		childLock := &idm.ACLAction{Name: AclChildLock.Name + ":" + l.targetChildName, Value: l.sessionUUID}
		return l.updateExpiration(ctx, aclClient, l.targetParentUuid, childLock, expireAfter)
	}

	return nil

}

// Unlock manually removes the ACL
func (l *LockSession) Unlock(ctx context.Context) error {

	aclClient := idmc.ACLServiceClient(ctx)
	err1 := l.remove(ctx, aclClient, &idm.ACLAction{Name: AclLock.Name, Value: l.sessionUUID})
	err2 := l.remove(ctx, aclClient, &idm.ACLAction{Name: AclChildLock.Name + ":*", Value: l.sessionUUID})
	if err1 != nil {
		return err1
	} else if err2 != nil {
		return err1
	} else {
		return nil
	}
}

func (l *LockSession) create(ctx context.Context, cli idm.ACLServiceClient, nodeUUID string, action *idm.ACLAction) error {

	_, err := cli.CreateACL(ctx, &idm.CreateACLRequest{
		ACL: &idm.ACL{
			NodeID: nodeUUID,
			Action: action,
		},
	})
	return err

}

func (l *LockSession) remove(ctx context.Context, cli idm.ACLServiceClient, action *idm.ACLAction) error {

	q, _ := anypb.New(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{action},
	})

	_, err := cli.DeleteACL(ctx, &idm.DeleteACLRequest{
		Query: &service.Query{
			SubQueries: []*anypb.Any{q},
		},
	})
	return err

}

func (l *LockSession) updateExpiration(ctx context.Context, cli idm.ACLServiceClient, nodeUUID string, action *idm.ACLAction, expireAfter time.Duration) error {

	q, _ := anypb.New(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{action},
		NodeIDs: []string{nodeUUID},
	})

	_, err := cli.ExpireACL(ctx, &idm.ExpireACLRequest{
		Query: &service.Query{
			SubQueries: []*anypb.Any{q},
		},
		Timestamp: time.Now().Add(expireAfter).Unix(),
	})
	return err
}

// HasChildrenLocks checks if there are any child_lock for a parent folder
func HasChildrenLocks(ctx context.Context, node *tree.Node) bool {
	aclClient := idmc.ACLServiceClient(ctx)
	q, _ := anypb.New(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{{Name: AclChildLock.Name + ":*"}},
		NodeIDs: []string{node.GetUuid()},
	})
	_, has, _ := commons.MustStreamOne(aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}}))
	return has
}

// GetChildrenLocks retrieves the existing child_lock for a parent folder
func GetChildrenLocks(ctx context.Context, node *tree.Node) (ll []string, err error) {
	aclClient := idmc.ACLServiceClient(ctx)
	q, _ := anypb.New(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{{Name: AclChildLock.Name + ":*"}},
		NodeIDs: []string{node.GetUuid()},
	})

	st, er := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	err = commons.ForEach(st, er, func(resp *idm.SearchACLResponse) error {
		aName := resp.GetACL().GetAction().GetName()
		aName = strings.TrimPrefix(aName, AclChildLock.Name+":")
		log.Logger(ctx).Debug("-- SuffixPath : adding value from ChildLock " + aName)
		ll = append(ll, strings.ToLower(aName))
		return nil
	})
	return

}
