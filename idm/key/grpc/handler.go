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
	"fmt"
	"time"

	"go.uber.org/zap"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/crypto"
	"github.com/pydio/cells/common/log"
	enc "github.com/pydio/cells/common/proto/encryption"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/idm/key"
)

type userKeyStore struct{}

// NewUserKeyStore creates a master password based
func NewUserKeyStore() (enc.UserKeyStoreHandler, error) {
	return &userKeyStore{}, nil
}

func (ukm *userKeyStore) getDAO(ctx context.Context) (key.DAO, error) {
	dao := servicecontext.GetDAO(ctx)
	if dao == nil {
		return nil, errors.InternalServerError(common.SERVICE_USER_KEY, "No DAO found Wrong initialization")
	}

	keyDao, ok := dao.(key.DAO)
	if !ok {
		return nil, errors.New(common.SERVICE_USER_KEY, "unsupported dao", 500)
	}
	return keyDao, nil
}

func (ukm *userKeyStore) AddKey(ctx context.Context, req *enc.AddKeyRequest, rsp *enc.AddKeyResponse) error {
	dao, err := ukm.getDAO(ctx)
	if err != nil {
		return err
	}

	err = seal(req.Key, []byte(req.StrPassword))
	if err != nil {
		return err
	}

	return dao.SaveKey(req.Key)
}

func (ukm *userKeyStore) GetKey(ctx context.Context, req *enc.GetKeyRequest, rsp *enc.GetKeyResponse) error {

	dao, err := ukm.getDAO(ctx)
	if err != nil {
		return err
	}

	// TODO: Extract user / password info from Context
	user := common.PYDIO_SYSTEM_USERNAME
	pwd := config.Vault().Get("masterPassword").Bytes()

	rsp.Key, err = dao.GetKey(user, req.KeyID)
	if err != nil {
		return err
	}

	if rsp.Key == nil {
		return nil
	}
	return open(rsp.Key, pwd)
}

func (ukm *userKeyStore) AdminListKeys(ctx context.Context, req *enc.AdminListKeysRequest, rsp *enc.AdminListKeysResponse) error {

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok || claims.Profile != common.PYDIO_PROFILE_ADMIN {
		return errors.Forbidden(common.SERVICE_ENC_KEY, "only admins are allowed")
	}

	keyDao, err := ukm.getDAO(ctx)
	if err != nil {
		return err
	}

	rsp.Keys, err = keyDao.ListKeys(common.PYDIO_SYSTEM_USERNAME)
	return err
}

func (ukm *userKeyStore) AdminCreateKey(ctx context.Context, req *enc.AdminCreateKeyRequest, rsp *enc.AdminCreateKeyResponse) error {

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok || claims.Profile != common.PYDIO_PROFILE_ADMIN {
		return errors.Forbidden(common.SERVICE_ENC_KEY, "only admins are allowed")
	}

	keyDao, err := ukm.getDAO(ctx)
	if err != nil {
		return err
	}

	if _, err := keyDao.GetKey(common.PYDIO_SYSTEM_USERNAME, req.KeyID); err != nil {
		if errors.Parse(err.Error()).Code == 404 {
			return createSystemKey(keyDao, req.KeyID, req.Label)
		} else {
			return err
		}
	} else {
		return errors.BadRequest(common.SERVICE_ENC_KEY, "Key already exists with this id!")
	}
}

func (ukm *userKeyStore) AdminDeleteKey(ctx context.Context, req *enc.AdminDeleteKeyRequest, rsp *enc.AdminDeleteKeyResponse) error {

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok || claims.Profile != common.PYDIO_PROFILE_ADMIN {
		return errors.Forbidden(common.SERVICE_ENC_KEY, "only admins are allowed")
	}

	dao, err := ukm.getDAO(ctx)
	if err != nil {
		return err
	}
	return dao.DeleteKey(common.PYDIO_SYSTEM_USERNAME, req.KeyID)
}

func (ukm *userKeyStore) AdminImportKey(ctx context.Context, req *enc.AdminImportKeyRequest, rsp *enc.AdminImportKeyResponse) error {
	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok || claims.Profile != common.PYDIO_PROFILE_ADMIN {
		return errors.Forbidden(common.SERVICE_ENC_KEY, "only admins are allowed")
	}

	dao, err := ukm.getDAO(ctx)
	if err != nil {
		return err
	}

	log.Logger(ctx).Info("Received request", zap.Any("Data", req))

	var k *enc.Key
	k, err = dao.GetKey(common.PYDIO_SYSTEM_USERNAME, req.Key.ID)
	if err != nil {
		if errors.Parse(err.Error()).Code != 404 {
			return err
		}
	} else if k != nil && !req.Override {
		return errors.BadRequest(common.SERVICE_ENC_KEY, fmt.Sprintf("Key already exists with [%s] id", req.Key.ID))
	}

	log.Logger(ctx).Info("Opening sealed key with imported password")
	err = open(req.Key, []byte(req.StrPassword))
	if err != nil {
		rsp.Success = false
		return errors.InternalServerError(common.SERVICE_ENC_KEY, fmt.Sprintf("unable to decrypt %s for import", req.Key.ID), err)
	}

	log.Logger(ctx).Info("Sealing with master key")
	err = sealWithMasterKey(req.Key)
	if err != nil {
		rsp.Success = false
		return errors.InternalServerError(common.SERVICE_ENC_KEY, fmt.Sprintf("unable to encrypt %s.%s nfor export", common.PYDIO_SYSTEM_USERNAME, req.Key.ID), err)
	}

	if req.Key.CreationDate == 0 {
		if k != nil {
			req.Key.CreationDate = k.CreationDate
		} else {
			req.Key.CreationDate = int32(time.Now().Unix())
		}
	}

	if len(req.Key.Owner) == 0 {
		req.Key.Owner = common.PYDIO_SYSTEM_USERNAME
	}

	log.Logger(ctx).Info("Received request", zap.Any("Data", req))

	log.Logger(ctx).Info("Adding import info")
	// We set import info

	if req.Key.Info == nil {
		req.Key.Info = &enc.KeyInfo{}
	}

	if req.Key.Info.Imports == nil {
		req.Key.Info.Imports = []*enc.Import{}
	}

	req.Key.Info.Imports = append(req.Key.Info.Imports, &enc.Import{
		By:   common.PYDIO_SYSTEM_USERNAME,
		Date: int32(time.Now().Unix()),
	})

	log.Logger(ctx).Info("Saving new key")
	err = dao.SaveKey(req.Key)
	if err != nil {
		rsp.Success = false
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "failed to save imported key, cause: %s", err.Error())
	}

	log.Logger(ctx).Info("Returning response")
	rsp.Success = true
	return nil
}

func (ukm *userKeyStore) AdminExportKey(ctx context.Context, req *enc.AdminExportKeyRequest, rsp *enc.AdminExportKeyResponse) error {
	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok || claims.Profile != common.PYDIO_PROFILE_ADMIN {
		return errors.Forbidden(common.SERVICE_ENC_KEY, "only admins are allowed")
	}

	//Get key from dao
	dao, err := ukm.getDAO(ctx)
	if err != nil {
		return err
	}

	rsp.Key, err = dao.GetKey(common.PYDIO_SYSTEM_USERNAME, req.KeyID)
	if err != nil {
		return err
	}
	log.Logger(ctx).Info(fmt.Sprintf("Exporting key %s", rsp.Key.Content))

	// We set export info
	if rsp.Key.Info.Exports == nil {
		rsp.Key.Info.Exports = []*enc.Export{}
	}
	rsp.Key.Info.Exports = append(rsp.Key.Info.Exports, &enc.Export{
		By:   common.PYDIO_SYSTEM_USERNAME,
		Date: int32(time.Now().Unix()),
	})

	// We update the key
	err = dao.SaveKey(rsp.Key)
	if err != nil {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "failed to update key info, cause: %s", err.Error())
	}

	err = openWithMasterKey(rsp.Key)
	if err != nil {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "unable to decrypt for %s with key %s, cause: %s", common.PYDIO_SYSTEM_USERNAME, req.KeyID, err)
	}

	err = seal(rsp.Key, []byte(req.StrPassword))
	if err != nil {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "unable to encrypt for %s with key %s for export, cause: %s", common.PYDIO_SYSTEM_USERNAME, req.KeyID, err)
	}
	return nil
}

// Create a default key or create a system key with a given ID
func createSystemKey(dao key.DAO, keyID string, keyLabel string) error {
	systemKey := &enc.Key{
		ID:           keyID,
		Owner:        common.PYDIO_SYSTEM_USERNAME,
		Label:        keyLabel,
		CreationDate: int32(time.Now().Unix()),
	}

	keyContentBytes := make([]byte, 32)
	_, err := rand.Read(keyContentBytes)
	if err != nil {
		return err
	}

	masterPasswordBytes, err := getMasterPassword()
	if err != nil {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "failed to get password. Make sure you have the system keyring installed. Cause: %s", err.Error())
	}

	masterKey := crypto.KeyFromPassword(masterPasswordBytes, 32)
	encryptedKeyContentBytes, err := crypto.Seal(masterKey, keyContentBytes)
	if err != nil {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "failed to encrypt the default key. Cause: %s", err.Error())
	}
	systemKey.Content = base64.StdEncoding.EncodeToString(encryptedKeyContentBytes)
	log.Logger(context.Background()).Debug(fmt.Sprintf("Saving default key %s", systemKey.Content))
	return dao.SaveKey(systemKey)
}

func sealWithMasterKey(k *enc.Key) error {
	masterPasswordBytes, err := getMasterPassword()
	if len(masterPasswordBytes) == 0 {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "failed to get %s password, cause: %s", common.PYDIO_SYSTEM_USERNAME, err.Error())
	}
	return seal(k, masterPasswordBytes)
}

func openWithMasterKey(k *enc.Key) error {
	masterPasswordBytes, err := getMasterPassword()
	if err != nil {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "failed to get %s password, cause: %s", common.PYDIO_SYSTEM_USERNAME, err.Error())
	}
	return open(k, masterPasswordBytes)
}

func seal(k *enc.Key, passwordBytes []byte) error {
	keyContentBytes, err := base64.StdEncoding.DecodeString(k.Content)
	if err != nil {
		return errors.New(common.SERVICE_USER_KEY, "unable to decode key", 400)
	}

	passwordKey := crypto.KeyFromPassword(passwordBytes, 32)
	encryptedKeyContentBytes, err := crypto.Seal(passwordKey, keyContentBytes)

	if err != nil {
		return errors.InternalServerError(common.SERVICE_ENC_KEY, "failed to encrypt the default key, cause: %s", err.Error())
	}
	k.Content = base64.StdEncoding.EncodeToString(encryptedKeyContentBytes)
	return nil
}

func open(k *enc.Key, passwordBytes []byte) error {
	sealedContentBytes, err := base64.StdEncoding.DecodeString(k.Content)
	if err != nil {
		return errors.New(common.SERVICE_USER_KEY, "unable to decode key", 400)
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

func getMasterPassword() ([]byte, error) {
	var masterPasswordBytes []byte
	masterPassword := config.Vault().Get("masterPassword").String("")
	if masterPassword == "" {
		return masterPasswordBytes, errors.InternalServerError("master.key.load", "cannot get master password")
	}
	masterPasswordBytes = []byte(masterPassword)
	return masterPasswordBytes, nil
}
