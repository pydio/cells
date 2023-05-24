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

package grpc

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	errors2 "github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/log"
	enc "github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/idm/key"
)

type userKeyStore struct {
	enc.UnimplementedUserKeyStoreServer

	service.Service
	dao service.DAOProviderFunc[key.DAO]

	master []byte
	legacy []byte
}

// NewUserKeyStore creates a master password based
func NewUserKeyStore(ctx context.Context, svc service.Service) (enc.UserKeyStoreServer, error) {

	// TODO, retrieve keyring from context
	masterPasswordStr, err := service.KeyringFromContext(ctx).Get(common.ServiceGrpcNamespace_+common.ServiceUserKey, common.KeyringMasterKey)
	if err != nil {
		return nil, errors2.Wrap(err, "could not get master password from keyring")
	}

	masterPassword, err := base64.StdEncoding.DecodeString(masterPasswordStr)
	if err != nil {
		return nil, errors2.Wrap(err, "could not decode master password")
	}

	return &userKeyStore{
		Service: svc,
		dao:     service.DAOFromContext[key.DAO](svc),
		master:  masterPassword,
	}, nil
}

func (ukm *userKeyStore) AddKey(ctx context.Context, req *enc.AddKeyRequest) (*enc.AddKeyResponse, error) {

	err := seal(req.Key, []byte(req.StrPassword))
	if err != nil {
		return nil, err
	}

	return &enc.AddKeyResponse{}, ukm.dao(ctx).SaveKey(req.Key)
}

func (ukm *userKeyStore) GetKey(ctx context.Context, req *enc.GetKeyRequest) (*enc.GetKeyResponse, error) {

	rsp := &enc.GetKeyResponse{}

	// TODO: Extract user / password info from Context
	user := common.PydioSystemUsername

	var err error
	var version int
	rsp.Key, version, err = ukm.dao(ctx).GetKey(user, req.KeyID)
	if err != nil {
		return nil, err
	}

	if rsp.Key == nil {
		return nil, nil
	}

	pwd := ukm.master
	if version < 4 {
		if p, e := ukm.getLegacyFormat(); e == nil {
			pwd = p
		} else {
			return nil, e
		}
	}

	return rsp, open(rsp.Key, pwd)
}

func (ukm *userKeyStore) AdminListKeys(ctx context.Context, req *enc.AdminListKeysRequest) (*enc.AdminListKeysResponse, error) {

	rsp := &enc.AdminListKeysResponse{}
	var err error

	rsp.Keys, err = ukm.dao(ctx).ListKeys(common.PydioSystemUsername)
	return rsp, err
}

func (ukm *userKeyStore) AdminCreateKey(ctx context.Context, req *enc.AdminCreateKeyRequest) (*enc.AdminCreateKeyResponse, error) {

	keyDao := ukm.dao(ctx)

	rsp := &enc.AdminCreateKeyResponse{Success: true}

	if _, _, err := keyDao.GetKey(common.PydioSystemUsername, req.KeyID); err != nil && errors.FromError(err).Code == 404 {
		if er := ukm.createSystemKey(keyDao, req.KeyID, req.Label); er != nil {
			return nil, er
		} else {
			return rsp, nil
		}
	} else if err != nil {
		return nil, err
	} else {
		return nil, errors.BadRequest(common.ServiceEncKey, "Key already exists with this id!")
	}
}

func (ukm *userKeyStore) AdminDeleteKey(ctx context.Context, req *enc.AdminDeleteKeyRequest) (*enc.AdminDeleteKeyResponse, error) {

	return &enc.AdminDeleteKeyResponse{}, ukm.dao(ctx).DeleteKey(common.PydioSystemUsername, req.KeyID)
}

func (ukm *userKeyStore) AdminImportKey(ctx context.Context, req *enc.AdminImportKeyRequest) (*enc.AdminImportKeyResponse, error) {

	var err error

	log.Logger(ctx).Debug("Received request", zap.Any("Data", req))

	var k *enc.Key
	k, _, err = ukm.dao(ctx).GetKey(common.PydioSystemUsername, req.Key.ID)
	if err != nil {
		if errors.FromError(err).Code != 404 {
			return nil, err
		}
	} else if k != nil && !req.Override {
		return nil, errors.BadRequest(common.ServiceEncKey, fmt.Sprintf("Key already exists with [%s] id", req.Key.ID))
	}

	log.Logger(ctx).Debug("Opening sealed key with imported password")
	rsp := &enc.AdminImportKeyResponse{}
	err = open(req.Key, []byte(req.StrPassword))
	if err != nil {
		rsp.Success = false
		return rsp, errors.InternalServerError(common.ServiceEncKey, "unable to decrypt %s for import, cause: %s", req.Key.ID, err.Error())
	}

	log.Logger(ctx).Debug("Sealing with master key")
	err = seal(req.Key, ukm.master)
	if err != nil {
		rsp.Success = false
		return rsp, errors.InternalServerError(common.ServiceEncKey, "unable to encrypt %s.%s for export, cause: %s", common.PydioSystemUsername, req.Key.ID, err.Error())
	}

	if req.Key.CreationDate == 0 {
		if k != nil {
			req.Key.CreationDate = k.CreationDate
		} else {
			req.Key.CreationDate = int32(time.Now().Unix())
		}
	}

	if len(req.Key.Owner) == 0 {
		req.Key.Owner = common.PydioSystemUsername
	}

	log.Logger(ctx).Debug("Received request", zap.Any("Data", req))

	log.Logger(ctx).Debug("Adding import info")
	// We set import info

	if req.Key.Info == nil {
		req.Key.Info = &enc.KeyInfo{}
	}

	if req.Key.Info.Imports == nil {
		req.Key.Info.Imports = []*enc.Import{}
	}

	req.Key.Info.Imports = append(req.Key.Info.Imports, &enc.Import{
		By:   common.PydioSystemUsername,
		Date: int32(time.Now().Unix()),
	})

	log.Logger(ctx).Debug("Saving new key")
	err = ukm.dao(ctx).SaveKey(req.Key)
	if err != nil {
		rsp.Success = false
		return rsp, errors.InternalServerError(common.ServiceEncKey, "failed to save imported key, cause: %s", err.Error())
	}

	log.Logger(ctx).Debug("Returning response")
	rsp.Success = true
	return rsp, nil
}

func (ukm *userKeyStore) AdminExportKey(ctx context.Context, req *enc.AdminExportKeyRequest) (*enc.AdminExportKeyResponse, error) {

	//Get key from dao

	var err error

	rsp := &enc.AdminExportKeyResponse{}
	var version int
	rsp.Key, version, err = ukm.dao(ctx).GetKey(common.PydioSystemUsername, req.KeyID)
	if err != nil {
		return rsp, err
	}
	log.Logger(ctx).Debug(fmt.Sprintf("Exporting key %s", rsp.Key.Content))

	// We set export info
	if rsp.Key.Info.Exports == nil {
		rsp.Key.Info.Exports = []*enc.Export{}
	}
	rsp.Key.Info.Exports = append(rsp.Key.Info.Exports, &enc.Export{
		By:   common.PydioSystemUsername,
		Date: int32(time.Now().Unix()),
	})

	// We update the key
	err = ukm.dao(ctx).SaveKey(rsp.Key, version)
	if err != nil {
		return rsp, errors.InternalServerError(common.ServiceEncKey, "failed to update key info, cause: %s", err.Error())
	}

	pwd := ukm.master
	if version < 4 {
		if p, e := ukm.getLegacyFormat(); e == nil {
			pwd = p
		} else {
			return nil, e
		}
	}
	err = open(rsp.Key, pwd)
	if err != nil {
		return rsp, errors.InternalServerError(common.ServiceEncKey, "unable to decrypt for %s with key %s, cause: %s", common.PydioSystemUsername, req.KeyID, err)
	}

	err = seal(rsp.Key, []byte(req.StrPassword))
	if err != nil {
		return rsp, errors.InternalServerError(common.ServiceEncKey, "unable to encrypt for %s with key %s for export, cause: %s", common.PydioSystemUsername, req.KeyID, err)
	}
	return rsp, nil
}

// Create a default key or create a system key with a given ID
func (ukm *userKeyStore) createSystemKey(dao key.DAO, keyID string, keyLabel string) error {
	systemKey := &enc.Key{
		ID:           keyID,
		Owner:        common.PydioSystemUsername,
		Label:        keyLabel,
		CreationDate: int32(time.Now().Unix()),
	}

	keyContentBytes := make([]byte, 32)
	_, err := rand.Read(keyContentBytes)
	if err != nil {
		return err
	}

	masterKey := crypto.KeyFromPassword(ukm.master, 32)
	encryptedKeyContentBytes, err := crypto.Seal(masterKey, keyContentBytes)
	if err != nil {
		return errors.InternalServerError(common.ServiceEncKey, "failed to encrypt the default key. Cause: %s", err.Error())
	}
	systemKey.Content = base64.StdEncoding.EncodeToString(encryptedKeyContentBytes)
	log.Logger(context.Background()).Debug(fmt.Sprintf("Saving default key %s", systemKey.Content))
	return dao.SaveKey(systemKey)
}

func (ukm *userKeyStore) getLegacyFormat() ([]byte, error) {
	if len(ukm.legacy) == 0 {
		// Ensure that the master password is correctly encoded
		s, err := json.Marshal(map[string]string{
			"master": string(ukm.master),
		})
		if err != nil {
			return nil, fmt.Errorf("error marshalling key %v", err)
		}
		var mm map[string]string
		if err := json.Unmarshal(s, &mm); err != nil {
			return nil, fmt.Errorf("error unmarshalling key %v", err)
		}
		ukm.legacy = []byte(mm["master"])
	}
	return ukm.legacy, nil
}

func seal(k *enc.Key, passwordBytes []byte) error {
	keyContentBytes, err := base64.StdEncoding.DecodeString(k.Content)
	if err != nil {
		return errors.New(common.ServiceUserKey, "unable to decode key", 400)
	}

	passwordKey := crypto.KeyFromPassword(passwordBytes, 32)
	encryptedKeyContentBytes, err := crypto.Seal(passwordKey, keyContentBytes)

	if err != nil {
		return errors.InternalServerError(common.ServiceEncKey, "failed to encrypt the default key, cause: %s", err.Error())
	}
	k.Content = base64.StdEncoding.EncodeToString(encryptedKeyContentBytes)
	return nil
}

func open(k *enc.Key, passwordBytes []byte) error {
	sealedContentBytes, err := base64.StdEncoding.DecodeString(k.Content)
	if err != nil {
		return errors.New(common.ServiceUserKey, "unable to decode key", 400)
	}

	passwordKey := crypto.KeyFromPassword(passwordBytes, 32)

	nonce := sealedContentBytes[:12]
	keySealContentBytes := sealedContentBytes[12:]

	keyPlainContentBytes, err := crypto.Open(passwordKey, nonce, keySealContentBytes)
	if err != nil {
		return err
	}

	k.Content = base64.StdEncoding.EncodeToString(keyPlainContentBytes)
	return nil
}
