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

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/smartystreets/goconvey/convey"
	"google.golang.org/protobuf/runtime/protoimpl"

	"github.com/pydio/cells/v4/common"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/server/stubs/discoverytest"

	// Plugins to test
	_ "github.com/pydio/cells/v4/common/config/etcd"
	_ "github.com/pydio/cells/v4/common/config/file"
	_ "github.com/pydio/cells/v4/common/config/memory"
	_ "github.com/pydio/cells/v4/common/config/service"
)

func init() {
	grpc.RegisterMock(common.ServiceConfig, discoverytest.NewConfigService())
}

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
	testVault(t, store, vault)
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
	testVault(t, store, vault)
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
	testVault(t, store, vault)

	store.Save("configtest", "configtest")
	vault.Save("configtest", "configtest")
}

func TestGetSetGRPC(t *testing.T) {
	mem, err := config.OpenStore(context.Background(), "mem://")
	if err != nil {
		t.Fail()
	}

	vault, err := config.OpenStore(context.Background(), "mem://")

	config.Register(mem)
	config.RegisterVault(vault)

	conn := grpc.GetClientConnFromCtx(context.Background(), common.ServiceConfig)
	ctx := clientcontext.WithClientConn(context.Background(), conn)

	store, err := config.OpenStore(ctx, "grpc://"+common.ServiceConfig)
	if err != nil {
		t.Fail()
	}

	testGetSet(t, store)
	testVault(t, store, vault)
}

func TestWatchMapCompare(t *testing.T) {
	oldV := &object.DataSource{Name: "name"}
	v := &object.DataSource{Name: "name2"}
	convey.Convey("Test cmp.Equal on proto Message", t, func() {
		b := cmp.Equal(oldV, v, cmpopts.IgnoreTypes(protoimpl.MessageState{}, protoimpl.UnknownFields{}, protoimpl.SizeCache(0)))
		convey.So(b, convey.ShouldBeFalse)
	})
}
