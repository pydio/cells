/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package storage

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/caddyserver/certmagic"

	"github.com/pydio/caddyvault"

	"github.com/pydio/cells/v5/common/errors"
)

func init() {
	defaultURLMux.Register("vault", &vaultProvider{})
	defaultURLMux.Register("vaults", &vaultProvider{})
}

type vaultProvider struct{}

// OpenURL creates a caddyvault.VaultStorage implementation of certmagic.Storage. It expects at least a path in the URL
// to be used as the Vault store path.
func (v *vaultProvider) OpenURL(ctx context.Context, u *url.URL) (certmagic.Storage, error) {
	vs := &caddyvault.VaultStorage{}
	if os.Getenv("VAULT_TOKEN") == "" {
		t := u.Query().Get("rootToken")
		if t == "" {
			return nil, errors.New("cannot load vault authentication token, make sure to set VAULT_TOKEN env")
		}
		fmt.Println("Using rootToken from query string, this should not be used in production, use VAULT_TOKEN env var instead")
		vs.Token = t
	}
	storePath := strings.Trim(u.Path, "/")
	if storePath == "" {
		return nil, errors.New("missing path on vault URL")
	}
	vs.Prefix = storePath
	if u.Scheme == "vault" {
		vs.API = "http://" + u.Host
	} else {
		vs.API = "https://" + u.Host
	}
	return vs, nil
}
