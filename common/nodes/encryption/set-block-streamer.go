/*
 * Copyright (c) 2025 Abstrium SAS <team (at) pydio.com>
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

package encryption

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	encryption2 "github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

func newBlockStreamer(ctx context.Context, nodeUuuid string, partId ...uint32) (*setBlockStream, error) {
	cli := encryption2.NewNodeKeyManagerClient(grpc.ResolveConn(ctx, common.ServiceEncKeyGRPC))
	ct, ca := context.WithCancel(ctx)
	streamClient, err := cli.SetNodeInfo(ct)
	if err != nil {
		ca()
		return nil, err
	}
	bs := &setBlockStream{
		client:   streamClient,
		nodeUuid: nodeUuuid,
		ctx:      ct,
		ca:       ca,
	}
	if len(partId) > 0 {
		bs.partId = partId[0]
		bs.keySent = true
	}
	return bs, nil
}

// setBlockStream
type setBlockStream struct {
	client   encryption2.NodeKeyManager_SetNodeInfoClient
	keySent  bool
	nodeUuid string
	position uint32
	partId   uint32
	ctx      context.Context
	ca       context.CancelFunc
	err      error
}

func (streamer *setBlockStream) SendKey(key *encryption2.NodeKey) error {
	if streamer.err != nil {
		return streamer.err
	}

	key.NodeId = streamer.nodeUuid

	streamer.err = streamer.client.Send(&encryption2.SetNodeInfoRequest{
		Action: encryption2.SetNodeInfoActionType_KEY,
		SetNodeKey: &encryption2.SetNodeKeyRequest{
			NodeKey: key,
		},
	})
	return streamer.err
}

func (streamer *setBlockStream) SendBlock(block *encryption2.Block) error {
	if streamer.err != nil {
		return streamer.err
	}

	streamer.position++
	block.Position = streamer.position
	block.PartId = streamer.partId
	block.Nonce = nil

	setNodeInfoRequest := &encryption2.SetNodeInfoRequest{
		Action: encryption2.SetNodeInfoActionType_BLOCK,
		SetBlock: &encryption2.SetNodeBlockRequest{
			NodeUuid: streamer.nodeUuid,
			Block:    block,
		},
	}

	streamer.err = streamer.client.Send(setNodeInfoRequest)
	return streamer.err
}

func (streamer *setBlockStream) ClearBlocks(NodeId string) error {
	if streamer.err != nil {
		return streamer.err
	}

	setNodeInfoRequest := &encryption2.SetNodeInfoRequest{
		Action: encryption2.SetNodeInfoActionType_CLEAR,
		SetBlock: &encryption2.SetNodeBlockRequest{
			NodeUuid: streamer.nodeUuid,
		},
	}

	streamer.err = streamer.client.Send(setNodeInfoRequest)
	return streamer.err
}

func (streamer *setBlockStream) Close() error {
	// Streamer loop performs clean up on stream close
	//	err := streamer.client.CloseSend()
	resp, err := streamer.client.CloseAndRecv()
	if err != nil {
		return err
	}
	log.Logger(streamer.ctx).Debug("setBlockStream.Close received response", zap.Any("response", resp))
	streamer.ca()
	return nil
}
