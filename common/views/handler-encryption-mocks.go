package views

import (
	"context"
	"crypto/rand"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common/crypto"
	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/idm/key"
)

type mockNodeKeyManagerClient struct {
	keyMap     map[string]*encryption.NodeKey
	nodeParams map[string]*encryption.Params
}

func NewMockNodeKeyManagerClient() encryption.NodeKeyManagerClient {
	return &mockNodeKeyManagerClient{
		keyMap:     map[string]*encryption.NodeKey{},
		nodeParams: map[string]*encryption.Params{},
	}
}

func (nkm *mockNodeKeyManagerClient) DeleteNode(ctx context.Context, in *encryption.DeleteNodeRequest, opts ...client.CallOption) (*encryption.DeleteNodeResponse, error) {
	return nil, nil
}

func (nkm *mockNodeKeyManagerClient) SetNodeParams(ctx context.Context, in *encryption.SetNodeParamsRequest, opts ...client.CallOption) (*encryption.SetNodeParamsResponse, error) {
	nkm.nodeParams[in.NodeId] = in.Params
	return &encryption.SetNodeParamsResponse{}, nil
}

func (nkm *mockNodeKeyManagerClient) GetNodeKey(ctx context.Context, in *encryption.GetNodeKeyRequest, opts ...client.CallOption) (*encryption.GetNodeKeyResponse, error) {
	params := nkm.nodeParams[in.NodeId]
	nodeKey := nkm.keyMap[in.NodeId]

	if params == nil || nodeKey == nil {
		return nil, errors.NotFound("mock.node.key.manager", "key not found")
	}

	return &encryption.GetNodeKeyResponse{
		EncryptedKey: nodeKey.Data,
		OwnerId:      nodeKey.OwnerId,
		BlockSize:    params.BlockSize,
		Nonce:        params.Nonce,
	}, nil
}

func (nkm *mockNodeKeyManagerClient) SetNodeKey(ctx context.Context, in *encryption.SetNodeKeyRequest, opts ...client.CallOption) (*encryption.SetNodeKeyResponse, error) {
	nkm.keyMap[in.Key.NodeId] = in.GetKey()
	return &encryption.SetNodeKeyResponse{}, nil
}

func (nkm *mockNodeKeyManagerClient) DeleteNodeKey(ctx context.Context, in *encryption.DeleteNodeKeyRequest, opts ...client.CallOption) (*encryption.DeleteNodeKeyResponse, error) {
	delete(nkm.keyMap, in.NodeId)
	return nil, nil
}

func (nkm *mockNodeKeyManagerClient) DeleteNodeSharedKey(ctx context.Context, in *encryption.DeleteNodeSharedKeyRequest, opts ...client.CallOption) (*encryption.DeleteNodeSharedKeyResponse, error) {
	delete(nkm.keyMap, in.NodeId)
	return nil, nil
}

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
