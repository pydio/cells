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

package configtest

import (
	"context"
	"log"
	"os"
	"testing"

	"github.com/pydio/cells/v4/common/config"

	// Plugins to test
	_ "github.com/pydio/cells/v4/common/config/etcd"
	_ "github.com/pydio/cells/v4/common/config/file"
	_ "github.com/pydio/cells/v4/common/config/memory"
)

func TestGetSetMemory(t *testing.T) {
	store, err := config.OpenStore(context.Background(), "mem://")
	if err != nil {
		log.Panic(err)
	}

	vault, err := config.OpenStore(context.Background(), "mem://")
	if err != nil {
		log.Panic(err)
	}

	testGetSet(t, store)
	testVault(t, config.NewVault(store, vault))
}

func TestGetSetEtcd(t *testing.T) {
	u := os.Getenv("ETCD_SERVER_ADDR")
	if u == "" {
		t.Skip("skipping test: ETCD_SERVER_ADDR not defined")
	}

	store, err := config.OpenStore(context.Background(), "etcd://"+u+"/configtest")
	if err != nil {
		log.Panic(err)
	}

	vault, err := config.OpenStore(context.Background(), "etcd://"+u+"/configtestvault")
	if err != nil {
		log.Panic(err)
	}

	testGetSet(t, store)
	testVault(t, config.NewVault(store, vault))
}

func TestGetSetFile(t *testing.T) {
	f, err := os.CreateTemp(os.TempDir(), "configtest")
	if err != nil {
		log.Panic(err)
	}

	defer func() {
		f.Close()
		os.Remove(f.Name())
	}()

	v, err := os.CreateTemp(os.TempDir(), "configtestvault")
	if err != nil {
		log.Panic(err)
	}

	defer func() {
		v.Close()
		os.Remove(v.Name())
	}()

	store, err := config.OpenStore(context.Background(), "file://"+f.Name())
	if err != nil {
		log.Panic(err)
	}

	vault, err := config.OpenStore(context.Background(), "file://"+v.Name())
	if err != nil {
		log.Panic(err)
	}

	testGetSet(t, store)
	testVault(t, config.NewVault(store, vault))

	store.Save("configtest", "configtest")
	vault.Save("configtest", "configtest")
}
