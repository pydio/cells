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
	"log"
	"math/rand"
	"os"
	"sync"
	"testing"
	"time"

	clientcontext "github.com/pydio/cells/v4/common/client/context"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/grpc"
	"github.com/pydio/cells/v4/common/server/stubs/discoverytest"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"

	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/registry/service"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testMemRegistry  registry.Registry
	testETCDRegistry registry.Registry
	testSkipMem      bool
	testSkipEtcd     bool
)

func init() {
	var err error

	testMemRegistry, err = registry.OpenRegistry(context.Background(), "mem://")
	if err != nil {
		testSkipMem = true
	}

	u := os.Getenv("ETCD_SERVER_ADDR")
	if u == "" {
		testSkipEtcd = true
	} else {
		testETCDRegistry, err = registry.OpenRegistry(context.Background(), "etcd://"+u+"/registrytest")
		if err != nil {
			testSkipEtcd = true
		}
	}
}

func TestMemory(t *testing.T) {
	if testSkipMem {
		t.Skip("skipping test: no mem registry")
	}

	doTestAdd(t, testMemRegistry)
}

func TestService(t *testing.T) {
	if testSkipMem {
		t.Skip("skipping test: no mem registry")
	}

	conn := discoverytest.NewRegistryService(testMemRegistry)

	ctx := clientcontext.WithClientConn(context.Background(), conn)

	reg, err := registry.OpenRegistry(ctx, "grpc://")
	if err != nil {
		log.Panic(err)
	}

	doTestAdd(t, reg)
}

func TestEtcd(t *testing.T) {
	if testSkipEtcd {
		t.Skip("skipping test: no etcd registry")
	}

	doTestAdd(t, testETCDRegistry)
}

func TestServiceEtcd(t *testing.T) {
	if testSkipEtcd {
		t.Skip("skipping test: no etcd registry")
	}

	conn := discoverytest.NewRegistryService(testETCDRegistry)

	ctx := clientcontext.WithClientConn(context.Background(), conn)

	reg, err := registry.OpenRegistry(ctx, "grpc://")
	if err != nil {
		log.Panic(err)
	}

	doTestAdd(t, reg)
}

func doRegister(ctx context.Context, m registry.Registry) chan registry.Item {
	ch := make(chan registry.Item)

	go func() {
		for {
			select {
			case item := <-ch:
				m.Register(item)
			case <-ctx.Done():
				return
			}
		}
	}()

	return ch
}

func doTestAdd(t *testing.T, m registry.Registry) {
	Convey("Add services to the registry", t, func() {
		numNodes := 100
		numServers := 100
		numServices := 1000

		w, err := m.Watch(registry.WithType(pb.ItemType_NODE), registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			log.Fatal(err)
		}

		var createdItemIds []string
		var updatedItemIds []string
		var deletedItemIds []string

		ch := doRegister(context.Background(), m)

		go func() {
			for {
				res, err := w.Next()
				if err != nil {
					log.Fatal(err)
				}

				switch res.Action() {
				case pb.ActionType_CREATE:
					for _, item := range res.Items() {
						createdItemIds = append(createdItemIds, item.ID())
					}
				case pb.ActionType_UPDATE:
					for _, item := range res.Items() {
						updatedItemIds = append(updatedItemIds, item.ID())
					}
				case pb.ActionType_DELETE:
					for _, item := range res.Items() {
						deletedItemIds = append(deletedItemIds, item.ID())
					}
				}

			}
		}()

		ctx := context.Background()
		ctx = servicecontext.WithRegistry(ctx, m)

		var nodeIds []string
		var nodes []registry.Node
		for i := 0; i < numNodes; i++ {
			node := util.CreateNode()
			ch <- node
			nodeIds = append(nodeIds, node.ID())
			nodes = append(nodes, node)
		}

		// Create servers
		var serverIds []string
		var servers []server.Server
		for i := 0; i < numServers; i++ {
			srv := grpc.New(ctx, grpc.WithName("mock"))

			ch <- srv

			serverIds = append(serverIds, srv.ID())
			servers = append(servers, srv)

		}

		var services []service.Service
		var ids []string
		for i := 0; i < numServices; i++ {
			svc := service.NewService(
				service.Name(fmt.Sprintf("test %d", i)),
				service.Context(ctx),
			)

			ch <- svc

			ids = append(ids, svc.ID())
			services = append(services, svc)
		} //

		afterCreateServices, err := m.List(registry.WithType(pb.ItemType_SERVICE))
		So(err, ShouldBeNil)
		So(len(afterCreateServices), ShouldEqual, numServices)

		<-time.After(3 * time.Second)

		wg := &sync.WaitGroup{}

		var nodeUpdates []string
		var srvUpdates []string
		var svcUpdates []string

		// Update
		for j := 0; j < 2; j++ {
			for i := 0; i < 100; i++ {
				if numNodes > 0 {
					wg.Add(1)
					go func() {
						defer wg.Done()

						idx := rand.Int() % numNodes
						node, err := m.Get(nodeIds[idx], registry.WithType(pb.ItemType_NODE))
						if err != nil {
							return
						}

						meta := node.Metadata()
						meta[registry.MetaStatusKey] = "whatever"
						meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())

						if ms, ok := node.(registry.MetaSetter); ok {
							ms.SetMetadata(meta)
							ch <- ms.(registry.Item)
						}

						nodeUpdates = append(nodeUpdates, node.ID())
					}()
				}

				if numServers > 0 {
					wg.Add(1)
					go func() {
						defer wg.Done()

						idx := rand.Int() % numServers
						srv, err := m.Get(serverIds[idx], registry.WithType(pb.ItemType_SERVER))
						if err != nil {
							return
						}

						meta := srv.Metadata()
						meta[registry.MetaStatusKey] = "whatever"
						meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())

						if ms, ok := srv.(registry.MetaSetter); ok {
							ms.SetMetadata(meta)
							ch <- ms.(registry.Item)
						}

						srvUpdates = append(srvUpdates, srv.ID())
					}()
				}

				if numServices > 0 {
					wg.Add(1)
					go func() {
						defer wg.Done()

						idx := rand.Int() % numServices
						svc, err := m.Get(ids[idx], registry.WithType(pb.ItemType_SERVICE))
						if err != nil {
							return
						}

						meta := svc.Metadata()
						meta[registry.MetaStatusKey] = "whatever"
						meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())

						if ms, ok := svc.(registry.MetaSetter); ok {
							ms.SetMetadata(meta)
							ch <- ms.(registry.Item)
						}

						svcUpdates = append(svcUpdates, svc.ID())
					}()
				}
			}

			<-time.After(3 * time.Second)
		}

		wg.Wait()
		<-time.After(3 * time.Second)

		// Delete
		for _, s := range nodes {
			var node registry.Node
			if s.As(&node) {
				if er := m.Deregister(node); er != nil {
					log.Fatal(er)
				}
			}
		}

		for _, s := range servers {
			var srv server.Server
			if s.As(&srv) {
				if err := srv.Stop(); err != nil {
					log.Fatal(err)
				}
				if er := m.Deregister(srv); er != nil {
					log.Fatal(er)
				}
			}
		}

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

		<-time.After(3 * time.Second)

		afterDeleteServices, err := m.List(registry.WithType(pb.ItemType_SERVICE))
		So(err, ShouldBeNil)
		So(len(afterDeleteServices), ShouldEqual, 0)

		<-time.After(3 * time.Second)

		createdItemIds = unique(createdItemIds)
		updatedItemIds = unique(updatedItemIds)
		deletedItemIds = unique(deletedItemIds)
		nodeUpdates = unique(nodeUpdates)
		srvUpdates = unique(srvUpdates)
		svcUpdates = unique(svcUpdates)

		total := numNodes + numServices + numServers
		totalUpdates := len(nodeUpdates) + len(srvUpdates) + len(svcUpdates)
		So(len(createdItemIds), ShouldEqual, total)
		So(len(updatedItemIds), ShouldEqual, totalUpdates)
		So(len(deletedItemIds), ShouldEqual, total)
	})
}

func unique[T comparable](s []T) []T {
	inResult := make(map[T]bool)
	var result []T
	for _, str := range s {
		if _, ok := inResult[str]; !ok {
			inResult[str] = true
			result = append(result, str)
		}
	}
	return result
}
