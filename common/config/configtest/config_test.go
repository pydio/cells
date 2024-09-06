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
	"fmt"
	"log"
	"os"
	"sync"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	diff "github.com/r3labs/diff/v3"
	"github.com/smartystreets/goconvey/convey"
	"google.golang.org/protobuf/runtime/protoimpl"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	clientcontext "github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/stubs/discoverytest"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/std"

	// _ "github.com/pydio/cells/v4/common/config/etcd"
	// _ "github.com/pydio/cells/v4/common/config/file"
	_ "github.com/pydio/cells/v4/common/config/memory"
	_ "github.com/pydio/cells/v4/common/config/service"
)

func init() {
	grpc.RegisterMock(common.ServiceConfig, discoverytest.NewConfigService())
}

func TestSimpleDiff(t *testing.T) {
	a := configx.New()
	a.Val("test").Set(Teststruct{Name: "test"})

	b := configx.New()
	b.Val("test").Set(Teststruct{Name: "test2"})

	fmt.Println(diff.Diff(a.Interface(), b.Interface()))
}

type testprotostruct struct {
	i *pb.Node `diff:"I"`
}

func TestProtoDiff(t *testing.T) {
	node := &testprotostruct{i: &pb.Node{Hostname: "test"}}
	a := configx.New()
	a.Val("test").Set(node)

	clone := &testprotostruct{i: &pb.Node{Hostname: "test2"}}
	b := configx.New()
	b.Val("test").Set(clone)

	fmt.Println(diff.Diff(a.Interface(), b.Interface()))
}

type MetaSetter interface {
	SetMetadata(map[string]string)
}

func TestNodeDiff(t *testing.T) {
	node := util.CreateNode()
	if ms, ok := node.(MetaSetter); ok {
		ms.SetMetadata(map[string]string{"status": "transient"})
	}

	a := configx.New()
	a.Val("test").Set(node)

	clone := std.DeepClone(node)
	if ms, ok := clone.(MetaSetter); ok {
		ms.SetMetadata(map[string]string{"status": "ready"})
	}

	b := configx.New()
	b.Val("test").Set(clone)

	fmt.Println(diff.Diff(a.Interface(), b.Interface()))
}

func TestSyncMapDiff(t *testing.T) {
	a := configx.New()
	a.Val("map").Set(&sync.Map{})
	a.Val("map", "test").Set("test")

	clone := std.DeepClone(a.Interface())
	b := configx.New()
	b.Set(clone)

	a.Val("map", "test").Set("testing")
	a.Val("map", "test1").Set("test1")

	fmt.Println(diff.Diff(a.Interface(), b.Interface(), diff.CustomValueDiffers(config.CustomValueDiffers...)))
}

func TestGetSetMemory(t *testing.T) {
	store, err := config.OpenStore(context.Background(), "mem://")
	if err != nil {
		log.Panic(err)
	}

	//vault, err := config.OpenStore(context.Background(), "mem://")
	//if err != nil {
	//	log.Panic(err)
	//}

	testWatch(t, store)
	//testGetSet(t, store)
	//testVault(t, store, vault)
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
	// testWatch(t, store)

	store.Save("configtest", "configtest")
	vault.Save("configtest", "configtest")
}

func TestGetSetGRPC(t *testing.T) {
	//u := os.Getenv("GRPC_ADDR")
	//if u == "" {
	//	t.Skip("skipping test: ETCD_SERVER_ADDR not defined")
	//}

	_, err := config.OpenStore(context.Background(), "mem://")
	if err != nil {
		t.Fail()
	}

	vault, err := config.OpenStore(context.Background(), "mem://")

	//config.Register(mem)
	//config.RegisterVault(vault)

	conn := grpc.ResolveConn(context.Background(), common.ServiceConfigGRPC)
	ctx := clientcontext.WithClientConn(context.Background(), conn)

	store, err := config.OpenStore(ctx, "grpc://"+common.ServiceConfigGRPC)
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
