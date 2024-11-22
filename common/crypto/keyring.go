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

package crypto

import (
	"encoding/base64"
	"errors"
	"fmt"

	keyring "github.com/zalando/go-keyring"

	"github.com/pydio/cells/v5/common/utils/propagator"
)

type keyringKey struct{}

var (
	KeyringContextKey = keyringKey{}
)

func init() {
	propagator.RegisterKeyInjector[Keyring](KeyringContextKey)
}

type Keyring interface {
	Get(string, string) (string, error)
	Set(string, string, string) error
	Delete(string, string) error
}

type KeyringOptions struct {
	Auto       bool
	AutoLogger func(string)
}

type KeyringOption func(*KeyringOptions)

func WithAutoCreate(b bool, logger func(string)) KeyringOption {
	return func(o *KeyringOptions) {
		o.Auto = b
		o.AutoLogger = logger
	}
}

type autoCreateKeyring struct {
	Keyring
	logger func(string)
}

func NewAutoKeyring(base Keyring, logger func(string)) Keyring {
	return &autoCreateKeyring{Keyring: base, logger: logger}
}

func (k *autoCreateKeyring) Get(service string, user string) (string, error) {
	password, err := k.Keyring.Get(service, user)
	if err != nil && err != ErrNotFound {
		return "", errors.New("failed to read from keyring")
	}

	empty := len(password) == 0
	if !empty {
		return password, nil
	}

	b, err := RandomBytes(50)
	if err != nil {
		return "", err
	}

	if k.logger != nil {
		k.logger("Auto-creating new value for " + service + "/" + user)
	}

	password = base64.StdEncoding.EncodeToString(b)

	err = k.Keyring.Set(service, user, password)
	if err != nil {
		return "", errors.New("failed to read from keyring. Make sure you have the system keyring installed")
	}

	return password, nil
}

// GetKeyringPassword retrieves a password from the keyring.
// If no key matches "service" and "user" and if createIfNotExist
// flag is set, a new key is generated and returned.
func GetKeyringPassword(service string, user string, createIfNotExist bool) ([]byte, error) {
	password, err := keyring.Get(service, user)
	if err != nil && err != keyring.ErrNotFound {
		return nil, errors.New("failed to read from keyring")
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
		return nil, errors.New("failed to read from keyring. Make sure you have the system keyring installed")
	}
	return k, nil
}

// SetKeyringPassword base64-encodes password and stores it.
func SetKeyringPassword(service string, user string, password []byte) error {
	strPass := base64.StdEncoding.EncodeToString(password)
	err := keyring.Set(service, user, strPass)
	if err != nil {
		return errors.New("failed to write into keyring, make sure you have the system keyring installed")
	}
	return nil
}

// DeleteKeyringPassword removes all key that matches "service" and "user".
func DeleteKeyringPassword(service string, user string) error {
	err := keyring.Delete(service, user)
	if err != nil {
		return fmt.Errorf("could not delete keyring for user %s and service %s", user, service)
	}
	return nil
}
