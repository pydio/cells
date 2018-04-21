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

package crypto

import (
	"context"
	"encoding/base64"
	"errors"

	"github.com/pydio/cells/common/log"
	"github.com/zalando/go-keyring"
	"go.uber.org/zap"
)

// GetKeyringPassword retrieves password from keyring
// If no key matches "service" and "user" a key is generated if "createIfNotExist" is true
func GetKeyringPassword(service string, user string, createIfNotExist bool) ([]byte, error) {
	password, err := keyring.Get(service, user)
	if err != nil {
		log.Logger(context.Background()).Error("Failed to the master key", zap.Error(err))
	}

	empty := len(password) == 0
	if !empty {
		return base64.StdEncoding.DecodeString(password)
	}

	if !createIfNotExist {
		return nil, nil
	}

	k, err := RandomBytes(50)
	if err != nil {
		return nil, err
	}

	password = base64.StdEncoding.EncodeToString(k)
	err = keyring.Set(service, user, password)
	if err != nil {
		log.Logger(context.Background()).Error("failed to save master key", zap.Error(err))
		return nil, errors.New("failed to read from keyring. Make sure you have the system keyring installed")
	}
	return k, nil
}

// SetKeyringPassword base64-encodes password and store it
func SetKeyringPassword(service string, user string, password []byte) error {
	strPass := base64.StdEncoding.EncodeToString(password)
	err := keyring.Set(service, user, strPass)
	if err != nil {
		log.Logger(context.Background()).Error("failed to save master key", zap.Error(err))
		return errors.New("failed to write into keyring. Make sure you have the system keyring installed.")
	}
	return nil
}

// DeleteKeyringPassword removes all key that matches "service" and "user"
func DeleteKeyringPassword(service string, user string) error {
	err := keyring.Delete(service, user)
	if err != nil {
		log.Logger(context.Background()).Error("failed to save master key", zap.Error(err))
		return errors.New("keyring error")
	}
	return nil
}
