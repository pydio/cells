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

// Package index provides a GRPC client for storing information into any tree.NodeProviderClient/tree.NodeReceiverClient
// service. Typically, the index service associated to each datasource.
package index

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/memory"
	"github.com/pydio/cells/common/sync/model"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/utils/permissions"
)

type Client struct {
	readerClient    tree.NodeProviderClient
	writerClient    tree.NodeReceiverClient
	sessionClient   tree.SessionIndexerClient
	internalSession *tree.IndexationSession
	dsName          string
}

func (i *Client) GetEndpointInfo() model.EndpointInfo {

	return model.EndpointInfo{
		URI: "index://" + i.dsName,
		RequiresFoldersRescan: false,
		RequiresNormalization: false,
	}

}

func (i *Client) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {

	if root == "/" {
		root = ""
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	responseClient, e := i.readerClient.ListNodes(ctx, &tree.ListNodesRequest{
		Node: &tree.Node{
			Path: root,
		},
		Recursive: recursive,
	})
	if e != nil {
		return e
	}
	defer responseClient.Close()
	for {
		response, rErr := responseClient.Recv()
		if rErr == io.EOF || rErr == io.ErrUnexpectedEOF || (rErr == nil && response == nil) {
			break
		}
		if rErr != nil {
			return rErr
		}
		response.Node.Path = strings.TrimLeft(response.Node.Path, "/")
		if !response.Node.IsLeaf() {
			response.Node.Etag = "-1"
		}
		walknFc(response.Node.Path, response.Node, nil)
	}
	return nil
}

func (i *Client) Watch(_ string) (*model.WatchObject, error) {
	return nil, errors.New("watch not implemented")
}

func (i *Client) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node *tree.Node, err error) {

	log.Logger(ctx).Debug("LoadNode ByPath" + path)
	var x bool
	if len(extendedStats) > 0 && extendedStats[0] {
		x = true
	}
	resp, e := i.readerClient.ReadNode(ctx, &tree.ReadNodeRequest{
		Node:              &tree.Node{Path: path},
		WithExtendedStats: x,
	})
	if e != nil {
		return nil, e
	}
	return resp.Node, nil

}

// LoadNodeByUuid makes this endpoint an UuidProvider
func (i *Client) LoadNodeByUuid(ctx context.Context, uuid string) (node *tree.Node, err error) {

	log.Logger(ctx).Debug("LoadNode ByUuid " + uuid)
	if i.indexationSession() != "" {
		ctx = context2.WithMetadata(ctx, map[string]string{"x-indexation-session": i.indexationSession()})
	}
	if resp, e := i.readerClient.ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{
			Uuid: uuid,
		},
	}); e != nil {
		return nil, e
	} else {
		resp.Node.Path = strings.TrimLeft(resp.Node.Path, "/")
		return resp.Node, nil
	}

}

func (i *Client) CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error) {

	session := i.indexationSession()

	_, err = i.writerClient.CreateNode(ctx, &tree.CreateNodeRequest{
		Node:              node,
		UpdateIfExists:    updateIfExists,
		IndexationSession: session,
	})

	if session == "" {
		log.Logger(ctx).Info("CreateNode", node.Zap(), zap.Error(err))
	}

	return err
}

func (i *Client) DeleteNode(ctx context.Context, path string) (err error) {

	session := i.indexationSession()

	if session == "" {
		log.Logger(ctx).Info("DeleteNode", zap.String(common.KeyNodePath, path))
	}

	_, err = i.writerClient.DeleteNode(ctx, &tree.DeleteNodeRequest{
		Node: &tree.Node{
			Path: path,
		},
		IndexationSession: session,
	})
	return err
}

func (i *Client) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {

	log.Logger(ctx).Info("MoveNode", zap.String(common.KeyNodePath, oldPath), zap.String("newPath", newPath))

	_, err = i.writerClient.UpdateNode(ctx, &tree.UpdateNodeRequest{
		From: &tree.Node{
			Path: oldPath,
		},
		To: &tree.Node{
			Path: newPath,
		},
		IndexationSession: i.indexationSession(),
	})

	return err
}

func (i *Client) StartSession(ctx context.Context, rootNode *tree.Node, silent bool) (*tree.IndexationSession, error) {
	sess := &tree.IndexationSession{
		Uuid:        uuid.New(),
		Description: "Indexation",
		RootNode:    rootNode,
		Silent:      silent,
	}
	resp, err := i.sessionClient.OpenSession(ctx, &tree.OpenSessionRequest{Session: sess})
	if err != nil {
		return nil, err
	} else {
		i.internalSession = resp.Session
		return resp.Session, nil
	}
}

func (i *Client) FlushSession(ctx context.Context, sessionUuid string) error {
	_, err := i.sessionClient.FlushSession(ctx, &tree.FlushSessionRequest{Session: &tree.IndexationSession{Uuid: sessionUuid}})
	return err
}

func (i *Client) FinishSession(ctx context.Context, sessionUuid string) error {
	_, err := i.sessionClient.CloseSession(ctx, &tree.CloseSessionRequest{Session: &tree.IndexationSession{Uuid: sessionUuid}})
	i.internalSession = nil
	return err
}

func (i *Client) LockBranch(ctx context.Context, node *tree.Node, sessionUUID string, expireAfter time.Duration) error {
	if node.Uuid == "" {
		return fmt.Errorf("missing uuid for creating lock session ACL")
	}
	locker := permissions.NewLockSession(node.Uuid, sessionUUID, expireAfter)
	return locker.Lock(ctx)
}

func (i *Client) UnlockBranch(ctx context.Context, sessionUUID string) error {
	locker := permissions.NewLockSession("", sessionUUID, 0)
	return locker.Unlock(ctx)
}

// GetCachedBranches implements CachedBranchProvider by loading branches in a MemDB
func (i *Client) GetCachedBranches(ctx context.Context, roots ...string) model.PathSyncSource {
	memDB := memory.NewMemDB()
	// Make sure to dedup roots
	rts := make(map[string]string)
	for _, root := range roots {
		rts[root] = root
	}
	for _, root := range rts {
		i.Walk(func(path string, node *tree.Node, err error) {
			if err == nil {
				memDB.CreateNode(ctx, node, false)
			}
		}, root, true)
	}
	return memDB

}

func (i *Client) indexationSession() string {
	sessionUuid := ""
	if i.internalSession != nil {
		sessionUuid = i.internalSession.Uuid
	}
	return sessionUuid
}

func NewClient(dsName string, reader tree.NodeProviderClient, writer tree.NodeReceiverClient, sessionClient tree.SessionIndexerClient) *Client {
	return &Client{
		readerClient:  reader,
		writerClient:  writer,
		sessionClient: sessionClient,
		dsName:        dsName,
		//streamer:      NewStreamer(common.ServiceGrpcNamespace_ + common.ServiceDataIndex_ + dsName),
	}
}
