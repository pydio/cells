/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package sync

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"go.uber.org/zap"

	"github.com/pborman/uuid"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	commonsync "github.com/pydio/cells/data/source/sync/lib/common"
)

type IndexEndpoint struct {
	readerClient    tree.NodeProviderClient
	writerClient    tree.NodeReceiverClient
	sessionClient   tree.SessionIndexerClient
	internalSession *tree.IndexationSession
	streamer        *IndexStreamer
}

func (i *IndexEndpoint) GetEndpointInfo() commonsync.EndpointInfo {

	return commonsync.EndpointInfo{
		RequiresFoldersRescan: false,
		RequiresNormalization: false,
	}

}

func (i *IndexEndpoint) ComputeChecksum(node *tree.Node) error {
	return fmt.Errorf("not.implemented")
}

func (i *IndexEndpoint) Walk(walknFc commonsync.WalkNodesFunc, pathes ...string) (err error) {

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	responseClient, e := i.readerClient.ListNodes(ctx, &tree.ListNodesRequest{
		Node: &tree.Node{
			Path: "",
		},
		Recursive: true,
	})
	if e != nil {
		return e
	}
	defer responseClient.Close()
	for {
		response, rErr := responseClient.Recv()
		if rErr != nil {
			walknFc("", nil, rErr)
		}
		if response == nil {
			break
		}
		response.Node.Path = strings.TrimLeft(response.Node.Path, "/")
		walknFc(response.Node.Path, response.Node, nil)
	}
	return nil
}

func (i *IndexEndpoint) Watch(recursivePath string) (*commonsync.WatchObject, error) {
	return nil, errors.New("Watch Not Implemented")
}

func (i *IndexEndpoint) LoadNode(ctx context.Context, path string, leaf ...bool) (node *tree.Node, err error) {

	log.Logger(ctx).Debug("LoadNode ByPath" + path)
	resp, e := i.readerClient.ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{
			Path: path,
		},
	})
	if e != nil {
		return nil, e
	}
	return resp.Node, nil

}

// LoadNodeByUuid makes this endpoint an UuidProvider
func (i *IndexEndpoint) LoadNodeByUuid(ctx context.Context, uuid string) (node *tree.Node, err error) {

	log.Logger(ctx).Debug("LoadNode ByUuid " + uuid)
	if resp, e := i.readerClient.ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{
			Uuid: uuid,
		},
	}); e != nil {
		return nil, e
	} else {
		return resp.Node, nil
	}

}

func (i *IndexEndpoint) CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error) {

	session := i.indexationSession()

	_, err = i.writerClient.CreateNode(ctx, &tree.CreateNodeRequest{
		Node:              node,
		UpdateIfExists:    updateIfExists,
		IndexationSession: session,
	})

	if session == "" {
		log.Logger(ctx).Info("CreateNode", zap.Any("node", node), zap.Error(err))
	}

	return err
}

func (i *IndexEndpoint) UpdateNode(ctx context.Context, node *tree.Node) error {
	return i.CreateNode(ctx, node, true)
}

func (i *IndexEndpoint) DeleteNode(ctx context.Context, path string) (err error) {

	session := i.indexationSession()

	if session == "" {
		log.Logger(ctx).Info("DeleteNode", zap.String("path", path))
	}

	_, err = i.writerClient.DeleteNode(ctx, &tree.DeleteNodeRequest{
		Node: &tree.Node{
			Path: path,
		},
		IndexationSession: session,
	})
	return err
}

func (i *IndexEndpoint) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {

	log.Logger(ctx).Info("MoveNode", zap.String("oldPath", oldPath), zap.String("newPath", newPath))

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

func (i *IndexEndpoint) StartSession(ctx context.Context, rootNode *tree.Node) (*tree.IndexationSession, error) {
	sess := &tree.IndexationSession{
		Uuid:        uuid.New(),
		Description: "Indexation",
		RootNode:    rootNode,
	}
	resp, err := i.sessionClient.OpenSession(ctx, &tree.OpenSessionRequest{Session: sess})
	if err != nil {
		return nil, err
	} else {
		i.internalSession = resp.Session
		return resp.Session, nil
	}
}

func (i *IndexEndpoint) FlushSession(ctx context.Context, sessionUuid string) error {
	_, err := i.sessionClient.FlushSession(ctx, &tree.FlushSessionRequest{Session: &tree.IndexationSession{Uuid: sessionUuid}})
	return err
}

func (i *IndexEndpoint) FinishSession(ctx context.Context, sessionUuid string) error {
	_, err := i.sessionClient.CloseSession(ctx, &tree.CloseSessionRequest{Session: &tree.IndexationSession{Uuid: sessionUuid}})
	i.internalSession = nil
	return err
}

func (i *IndexEndpoint) indexationSession() string {
	sessionUuid := ""
	if i.internalSession != nil {
		sessionUuid = i.internalSession.Uuid
	}
	return sessionUuid
}

func NewIndexEndpoint(dsName string, reader tree.NodeProviderClient, writer tree.NodeReceiverClient, sessionClient tree.SessionIndexerClient) *IndexEndpoint {
	return &IndexEndpoint{
		readerClient:  reader,
		writerClient:  writer,
		sessionClient: sessionClient,
		//streamer:      NewIndexStreamer(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_INDEX_ + dsName),
	}
}
