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

package encryption

import (
	"context"
	"encoding/base64"
	"sync"

	"github.com/pydio/cells/v4/common/client/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/encryption"

	"github.com/pydio/cells/v4/common/crypto"
)

// UserKeyTool describes a tool that can encrypt/decrypt data based on user context
type UserKeyTool interface {
	GetEncrypted(ctx context.Context, keyID string, data []byte) ([]byte, error)
	GetDecrypted(ctx context.Context, keyID string, data []byte) ([]byte, error)
}

// MasterKeyTool creates the admin key tool
func MasterKeyTool(ctx context.Context) (UserKeyTool, error) {
	kt := new(userKeyTool)
	kt.keys = make(map[string][]byte)
	return kt, nil
}

// GetUserKeyTool creates a keytool based on specified @user and @pass
func GetUserKeyTool(user string, pass []byte) UserKeyTool {
	return &userKeyTool{}
}

type userKeyTool struct {
	sync.Mutex
	keys map[string][]byte
}

func (kt *userKeyTool) keyByID(ctx context.Context, id string) ([]byte, error) {
	if k, found := kt.keys[id]; found {
		return k, nil
	}

	client := encryption.NewUserKeyStoreClient(grpc.GetClientConnFromCtx(ctx, common.ServiceUserKey))
	rsp, err := client.GetKey(ctx, &encryption.GetKeyRequest{KeyID: id})
	if err != nil {
		return nil, err
	}

	bytes, err := base64.StdEncoding.DecodeString(rsp.Key.Content)
	if err != nil {
		return nil, err
	}

	kt.keys[id] = bytes

	return bytes, nil
}

func (kt *userKeyTool) GetEncrypted(ctx context.Context, keyID string, data []byte) ([]byte, error) {
	kt.Lock()
	defer kt.Unlock()

	keyBytes, err := kt.keyByID(ctx, keyID)

	if err != nil {
		return nil, err
	}

	return crypto.Seal(keyBytes, data)
}

func (kt *userKeyTool) GetDecrypted(ctx context.Context, keyID string, encrypted []byte) ([]byte, error) {
	kt.Lock()
	defer kt.Unlock()

	keyBytes, err := kt.keyByID(ctx, keyID)
	if err != nil {
		return nil, err
	}

	return crypto.Open(keyBytes, encrypted[:12], encrypted[12:])
}
