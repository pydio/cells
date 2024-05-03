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

package lib

import (
	"context"
	"fmt"
	"sync"

	"github.com/ory/hydra/v2/x"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service"
)

var (
	listRegistry registry.Registry
	loadRegistry sync.Once
)

func ListServicesWithStorage() (ss []service.Service, e error) {
	loadRegistry.Do(func() {
		ctx := context.Background()
		reg, err := registry.OpenRegistry(ctx, "mem:///?cache=shared&byname=true")
		if err != nil {
			e = err
		}
		ctx = runtimecontext.With(ctx, registry.ContextKey, reg)
		runtime.Init(ctx, "discovery")
		runtime.Init(ctx, "main")
		listRegistry = reg
	})
	if e != nil {
		return nil, e
	}
	items, er := listRegistry.List(registry.WithType(pb.ItemType_SERVICE))
	if er != nil {
		return nil, er
	}
	for _, i := range items {
		var srv service.Service
		if i.As(&srv) {
			if len(srv.Options().StorageOptions.SupportedDrivers) > 0 {
				ss = append(ss, srv)
			}
		} else {
			fmt.Println("cannot convert", i)
		}
	}
	return ss, nil
}

func actionConfigsSet(c *install.InstallConfig) error {

	// OAuth web
	oauthWeb := common.ServiceWebNamespace_ + common.ServiceOAuth
	if config.Get("services", oauthWeb, "secret").String() != "" {
		// Secret already set
		return nil
	}

	secret, err := x.GenerateSecret(32)
	if err != nil {
		return err
	}

	if er := config.Set([]string{"#insecure_binds...#/auth/callback"}, "services", oauthWeb, "insecureRedirects"); er != nil {
		return er
	}
	if er := config.Set(string(secret), "services", oauthWeb, "secret"); er != nil {
		return er
	}

	return config.Save("cli", "Generating secret of "+oauthWeb+" service")

}
