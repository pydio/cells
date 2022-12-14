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

package registrytest

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/server/grpc"
	"log"
	"math/rand"
	"os"
	"testing"
	"time"

	pb "github.com/pydio/cells/v4/common/proto/registry"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"

	_ "github.com/pydio/cells/v4/common/registry/config"
)

func TestMemory(t *testing.T) {
	reg, err := registry.OpenRegistry(context.Background(), "mem://")
	if err != nil {
		log.Panic(err)
	}

	doTestAdd(t, reg)
}

func TestEtcd(t *testing.T) {
	u := os.Getenv("ETCD_SERVER_ADDR")
	if u == "" {
		t.Skip("skipping test: ETCD_SERVER_ADDR not defined")
	}

	reg, err := registry.OpenRegistry(context.Background(), "etcd://"+u+"/registrytest")
	if err != nil {
		log.Panic(err)
	}

	doTestAdd(t, reg)
}

//func TestFile(t *testing.T) {
//	f, err := os.CreateTemp(os.TempDir(), "registrytest")
//	if err != nil {
//		log.Panic(err)
//	}
//
//	defer func() {
//		f.Close()
//		os.Remove(f.Name())
//	}()
//
//	reg, err := registry.OpenRegistry(context.Background(), "file://"+f.Name())
//	if err != nil {
//		log.Panic(err)
//	}
//
//	doTestAdd(t, reg)
//}

func doTestAdd(t *testing.T, m registry.Registry) {
	Convey("Add services to the registry", t, func() {
		numNodes := 10
		numServers := 10
		numServices := 100

		go func() {
			w, err := m.Watch(registry.WithAction(pb.ActionType_FULL_LIST), registry.WithType(pb.ItemType_SERVICE))
			if err != nil {
				log.Fatal(err)
			}

			count := 0
			for {
				res, err := w.Next()
				if err != nil {
					log.Fatal(err)
				}

				// fmt.Println("Received something ? ", res)
				count = count + len(res.Items())

				fmt.Println("Number of Items received ? ", count)
			}
		}()

		ctx := context.Background()
		ctx = servicecontext.WithRegistry(ctx, m)

		var nodeIds []string
		for i := 0; i < numNodes; i++ {
			node := util.CreateNode()
			m.Register(node)
			nodeIds = append(nodeIds, node.ID())
		}

		// Create servers
		var serverIds []string
		for i := 0; i < numServers; i++ {
			srv := grpc.New(ctx, grpc.WithName("mock"))
			m.Register(srv)

			serverIds = append(serverIds, srv.ID())
		}

		var services []service.Service
		var ids []string
		for i := 0; i < numServices; i++ {
			svc := service.NewService(
				service.Name(fmt.Sprintf("test %d", i)),
				service.Context(ctx),
			)
			ids = append(ids, svc.ID())
			services = append(services, svc)
		}

		<-time.After(5 * time.Second)

		for i := 0; i < numServices; i++ {
			svc := service.NewService(
				service.Name(fmt.Sprintf("test %d", i)),
				service.Context(ctx),
			)
			ids = append(ids, svc.ID())
			services = append(services, svc)
		}

		<-time.After(5 * time.Second)

		afterCreateServices, err := m.List(registry.WithType(pb.ItemType_SERVICE))
		So(err, ShouldBeNil)
		So(len(afterCreateServices), ShouldEqual, numServices*2)

		// Update
		for i := 0; i < 10000; i++ {
			go func() {
				idx := rand.Int() % numNodes
				node, err := m.Get(nodeIds[idx], registry.WithType(pb.ItemType_NODE))
				if err != nil {
					return
				}

				node.Metadata()[registry.MetaStatusKey] = "whatever"
				m.Register(node)
			}()

			go func() {
				idx := rand.Int() % numServers
				srv, err := m.Get(serverIds[idx], registry.WithType(pb.ItemType_SERVER))
				if err != nil {
					return
				}

				srv.Metadata()[registry.MetaStatusKey] = "whatever"
				m.Register(srv)
			}()

			go func() {
				idx := rand.Int() % numServices
				srv, err := m.Get(ids[idx], registry.WithType(pb.ItemType_SERVICE))
				if err != nil {
					return
				}

				srv.Metadata()[registry.MetaStatusKey] = "whatever"
				m.Register(srv)
			}()
		}

		// Delete
		for _, s := range services {
			var svc service.Service
			if s.As(&svc) {
				if err := svc.Stop(); err != nil {
					log.Fatal(err)
				}
				if er := m.Deregister(svc); er != nil {
					log.Fatal(er)
				}
			}
		}

		afterDeleteServices, err := m.List(registry.WithType(pb.ItemType_SERVICE))
		So(err, ShouldBeNil)
		So(len(afterDeleteServices), ShouldEqual, 0)

		<-time.After(1 * time.Second)

	})
}
