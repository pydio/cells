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

package views

import (
	"context"
	"crypto/rand"
	"fmt"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common/crypto"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/idm/key"
	json "github.com/pydio/cells/x/jsonx"
)

const (
	aesGCMTagSize = 16
)

type mockSetNodeInfoStream struct {
	inStream  chan interface{}
	outStream chan interface{}

	keys   map[string]*encryption.NodeKey
	blocks map[string][]*encryption.Block

	cursor int

	exchangeError error
	//closed bool
}

func newMockSendInfoStream(keys map[string]*encryption.NodeKey, blocks map[string][]*encryption.Block) *mockSetNodeInfoStream {
	return &mockSetNodeInfoStream{
		outStream: make(chan interface{}, 1),
		inStream:  make(chan interface{}, 1),
		keys:      keys,
		blocks:    blocks,
		cursor:    0,
	}
}

func (sc *mockSetNodeInfoStream) getClient() encryption.NodeKeyManager_SetNodeInfoClient {
	return &mockSendBlockStreamClient{
		outStream: sc.inStream,
		inStream:  sc.outStream,
	}
}

func (sc *mockSetNodeInfoStream) exchange() {
	for sc.exchangeError == nil {
		var req encryption.SetNodeInfoRequest
		sc.exchangeError = sc.RecvMsg(&req)
		if sc.exchangeError != nil {
			return
		}

		switch req.Action {
		case "key":
			//create copy because object is updated in handler
			nodeKeyBytes, _ := json.Marshal(req.SetNodeKey.NodeKey)
			var nodeKeyCopy encryption.NodeKey
			_ = json.Unmarshal(nodeKeyBytes, &nodeKeyCopy)

			sc.keys[req.SetNodeKey.NodeKey.NodeId] = &nodeKeyCopy
		case "block":

			nodeBlocks := sc.blocks[req.SetBlock.NodeUuid]
			if nodeBlocks == nil {
				nodeBlocks = []*encryption.Block{}
			}
			nodeBlocks = append(nodeBlocks, req.SetBlock.Block)
			sc.blocks[req.SetBlock.NodeUuid] = nodeBlocks
		case "close":
		}

		rsp := &encryption.SetNodeInfoResponse{}
		sc.exchangeError = sc.SendMsg(rsp)
	}
}

func (sc *mockSetNodeInfoStream) SendMsg(msg interface{}) error {
	sc.outStream <- msg
	return nil
}

func (sc *mockSetNodeInfoStream) RecvMsg(msgi interface{}) error {
	o, ok := <-sc.inStream
	if !ok {
		return nil
	}
	inMsg := o.(*encryption.SetNodeInfoRequest)
	msg := msgi.(*encryption.SetNodeInfoRequest)
	msg.SetNodeKey = inMsg.SetNodeKey
	msg.SetBlock = inMsg.SetBlock
	msg.Action = inMsg.Action
	return nil
}

func (sc *mockSetNodeInfoStream) Close() error {
	/*close(sc.inStream)
	close(sc.outStream)*/
	return nil
}

func (sc *mockSetNodeInfoStream) Send(request *encryption.SetNodeInfoRequest) error {
	return sc.SendMsg(request)
}

// MockSendBlockClient
type mockSendBlockStreamClient struct {
	inStream  chan interface{}
	outStream chan interface{}
}

func (sc *mockSendBlockStreamClient) SendMsg(msg interface{}) error {
	sc.outStream <- msg
	return nil
}

func (sc *mockSendBlockStreamClient) RecvMsg(msgi interface{}) error {
	<-sc.inStream
	return nil
}

func (sc *mockSendBlockStreamClient) Close() error {
	//close(sc.outStream)
	return nil
}

func (sc *mockSendBlockStreamClient) Send(request *encryption.SetNodeInfoRequest) error {
	return sc.SendMsg(request)
}

// NodeKeyManagerClient
type mockNodeKeyManagerClient struct {
	keys   map[string]*encryption.NodeKey
	blocks map[string][]*encryption.Block
}

func NewMockNodeKeyManagerClient() encryption.NodeKeyManagerClient {
	return &mockNodeKeyManagerClient{
		keys:   map[string]*encryption.NodeKey{},
		blocks: map[string][]*encryption.Block{},
	}
}

func (m *mockNodeKeyManagerClient) GetNodeInfo(ctx context.Context, in *encryption.GetNodeInfoRequest, opts ...client.CallOption) (*encryption.GetNodeInfoResponse, error) {

	nodeKey, entryFound := m.keys[in.NodeId]
	if !entryFound {
		return nil, errors.NotFound("mock.NodeKeyManager", "Key not found")
	}

	//create copy because object is updated in handler
	nodeKeyBytes, _ := json.Marshal(nodeKey)
	var nodeKeyCopy encryption.NodeKey
	_ = json.Unmarshal(nodeKeyBytes, &nodeKeyCopy)

	rsp := &encryption.GetNodeInfoResponse{
		NodeInfo: &encryption.NodeInfo{
			Node: &encryption.Node{
				NodeId: in.NodeId,
				Legacy: false,
			},
			NodeKey: &nodeKeyCopy,
		},
	}

	if in.WithRange {
		foundEncryptedOffset := false
		foundEncryptedLimit := in.PlainLength > 0

		encryptedOffset := int64(0)
		encryptedLimit := int64(0)
		currentPlainOffset := int64(0)
		currentPlainLength := int64(0)

		blocks, foundBlocks := m.blocks[in.NodeId]
		if foundBlocks {
			for _, b := range blocks {

				plainBlockSize := b.BlockSize - aesGCMTagSize
				encryptedBlockSize := b.BlockSize + b.HeaderSize

				encryptedLimit += int64(encryptedBlockSize)

				if !foundEncryptedOffset {
					left := in.PlainOffset - currentPlainOffset
					if left == 0 {
						foundEncryptedOffset = true
						rsp.HeadSKippedPlainBytesCount = 0

					} else if left <= int64(plainBlockSize) {
						foundEncryptedOffset = true
						rsp.HeadSKippedPlainBytesCount = in.PlainOffset - currentPlainOffset
						currentPlainLength = int64(plainBlockSize) - rsp.HeadSKippedPlainBytesCount

						if currentPlainLength >= in.PlainLength {
							foundEncryptedLimit = true
							break
						}
						continue
					} else {
						currentPlainOffset += int64(plainBlockSize)
						encryptedOffset += int64(encryptedBlockSize)
					}
				}

				if foundEncryptedOffset && !foundEncryptedLimit {
					if currentPlainLength+int64(plainBlockSize) >= in.PlainLength {
						foundEncryptedLimit = true
					}
				}
			}
		}

		rsp.EncryptedOffset = encryptedOffset
		rsp.EncryptedCount = encryptedLimit - encryptedOffset
	}
	return rsp, nil
}

func (m *mockNodeKeyManagerClient) GetNodePlainSize(ctx context.Context, in *encryption.GetNodePlainSizeRequest, opts ...client.CallOption) (*encryption.GetNodePlainSizeResponse, error) {
	out := &encryption.GetNodePlainSizeResponse{}

	blocks, foundBlocks := m.blocks[in.NodeId]
	if foundBlocks {
		for _, b := range blocks {
			plainBlockSize := b.BlockSize - aesGCMTagSize
			out.Size += int64(plainBlockSize)
		}
	}
	return out, nil
}

func (m *mockNodeKeyManagerClient) SetNodeInfo(ctx context.Context, opts ...client.CallOption) (encryption.NodeKeyManager_SetNodeInfoClient, error) {
	stream := newMockSendInfoStream(m.keys, m.blocks)
	go stream.exchange()
	return stream.getClient(), nil
}

func (m *mockNodeKeyManagerClient) CopyNodeInfo(ctx context.Context, in *encryption.CopyNodeInfoRequest, opts ...client.CallOption) (*encryption.CopyNodeInfoResponse, error) {
	return nil, nil
}

func (m *mockNodeKeyManagerClient) DeleteNode(ctx context.Context, in *encryption.DeleteNodeRequest, opts ...client.CallOption) (*encryption.DeleteNodeResponse, error) {
	var entriesToDelete []string

	for entry := range m.keys {
		if strings.HasSuffix(entry, fmt.Sprintf(":%s", in.NodeId)) {
			entriesToDelete = append(entriesToDelete, entry)
		}
	}
	for _, entry := range entriesToDelete {
		delete(m.keys, entry)
		delete(m.blocks, entry)
	}
	return &encryption.DeleteNodeResponse{}, nil
}

func (m *mockNodeKeyManagerClient) DeleteNodeKey(ctx context.Context, in *encryption.DeleteNodeKeyRequest, opts ...client.CallOption) (*encryption.DeleteNodeKeyResponse, error) {
	entry := fmt.Sprintf("%s:%s", in.UserId, in.NodeId)
	delete(m.keys, entry)
	delete(m.blocks, entry)
	return &encryption.DeleteNodeKeyResponse{}, nil
}

func (m *mockNodeKeyManagerClient) DeleteNodeSharedKey(ctx context.Context, in *encryption.DeleteNodeSharedKeyRequest, opts ...client.CallOption) (*encryption.DeleteNodeSharedKeyResponse, error) {
	entry := fmt.Sprintf("shared:%s:%s", in.UserId, in.NodeId)
	delete(m.keys, entry)
	delete(m.blocks, entry)
	return &encryption.DeleteNodeSharedKeyResponse{}, nil
}

// mockUserKeyTool
type mockUserKeyTool struct {
	key []byte
}

func NewMockUserKeyTool() key.UserKeyTool {
	keyByte := make([]byte, 16)
	_, _ = rand.Read(keyByte)
	return &mockUserKeyTool{
		key: keyByte,
	}
}

func (ukt *mockUserKeyTool) GetEncrypted(ctx context.Context, keyID string, data []byte) ([]byte, error) {
	return crypto.Seal(ukt.key, data)
}

func (ukt *mockUserKeyTool) GetDecrypted(ctx context.Context, keyID string, data []byte) ([]byte, error) {
	return crypto.Open(ukt.key, data[:12], data[12:])
}
