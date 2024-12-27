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
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"sort"
	"testing"
	"time"

	"go.opentelemetry.io/otel/trace"
	ggrpc "google.golang.org/grpc"

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	clientcontext "github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/server/grpc"
	"github.com/pydio/cells/v5/common/server/stubs/discoverytest"
	"github.com/pydio/cells/v5/common/service"
	otel2 "github.com/pydio/cells/v5/common/telemetry/otel"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"

	_ "github.com/pydio/cells/v5/common/config/viper"
	_ "github.com/pydio/cells/v5/common/registry/config"
	_ "github.com/pydio/cells/v5/common/registry/service"
	_ "github.com/pydio/cells/v5/common/telemetry/tracing/jaeger"
	_ "github.com/pydio/cells/v5/common/telemetry/tracing/otlp"
	_ "github.com/pydio/cells/v5/common/telemetry/tracing/stdout"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testMemRegistry  registry.Registry
	testETCDRegistry registry.Registry
	testSkipMem      bool
	testSkipEtcd     bool
)

var span trace.Span

func init() {
	var err error

	ctx := context.Background()
	if err := tracing.InitExporters(ctx, otel2.Service{}, tracing.Config{Outputs: []string{
		"jaeger-dump://localhost:14268/api/traces",
		"otlp://localhost:4318",
		"stdout://",
	}}); err != nil {
		panic(err)
	}

	ctx, span = tracing.StartLocalSpan(ctx, "registry")

	span.AddEvent("start")

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

	span.AddEvent("end")
	span.End()
}

func TestService(t *testing.T) {
	if testSkipMem {
		t.Skip("skipping test: no mem registry")
	}
	ctx := context.Background()

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "oAuth2Driver.Migrate")
	defer span.End()

	conn := discoverytest.NewRegistryService(testMemRegistry)

	pool, err := openurl.OpenPool(ctx, []string{""}, func(ctx context.Context, url string) (ggrpc.ClientConnInterface, error) {
		return conn, nil
	})
	if err != nil {
		t.Fatal(err)
	}

	m, err := manager.NewManager(ctx, "test", nil)
	registry.NewMetaWrapper(m.Registry(), func(m map[string]string) {
		b, _ := json.Marshal([]map[string]string{{
			"filter": "\"{{ .Name }} ~= .*\"",
		}})
		m["services"] = string(b)

	}).Register(registry.NewRichItem("testconn", "testconn", pb.ItemType_GENERIC, pool))

	// TODO
	//reg, err := registry.OpenRegistry(m.Context(), "grpc://")
	//if err != nil {
	//	log.Panic(err)
	//}

	// doTestAdd(t, reg)
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

func doRegister(ctx context.Context, m registry.Registry, ids *[]string) chan registry.Item {
	ch := make(chan registry.Item)

	cnt := 0
	go func() {
		for {
			select {
			case item := <-ch:
				cnt = cnt + 1
				t := time.Now()
				m.Register(item)
				fmt.Println("Registering took ", time.Now().Sub(t))
				*ids = append(*ids, item.ID())
			case <-ctx.Done():
				return
			}
		}
	}()

	return ch
}

func doTestAdd(t *testing.T, m registry.Registry) {
	Convey("Add services to the registry", t, func() {
		waitForQuiet := make(chan struct{})

		//numNodes := 100
		//numServers := 1000
		//numServices := 1000
		//numUpdates := 100

		numNodes := 1000
		numServers := 10000
		numServices := 10000
		numUpdates := 0

		w, err := m.Watch(registry.WithType(pb.ItemType_NODE), registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			log.Fatal(err)
		}

		var itemsSentToRegisterIds []string
		var createdItemIds []string
		var updatedItemIds []string
		var deletedItemIds []string
		cnt := 0

		reset := func() {
			itemsSentToRegisterIds = nil
			createdItemIds = nil
			updatedItemIds = nil
			deletedItemIds = nil
			cnt = 0
		}

		ch := doRegister(context.Background(), m, &itemsSentToRegisterIds)

		go func() {
			timer := time.NewTimer(2 * time.Second)
			resCh := make(chan registry.Result)
			go func() {
				for {
					res, err := w.Next()
					if err != nil {
						log.Fatal(err)
					}

					resCh <- res
				}
			}()

			go func() {
				done := false
				for {
					select {
					case <-timer.C:
						if done {
							waitForQuiet <- struct{}{}
						}

					case res := <-resCh:

						done = true

						timer.Reset(2 * time.Second)

						switch res.Action() {
						case pb.ActionType_CREATE:
							for _, item := range res.Items() {
								createdItemIds = append(createdItemIds, item.ID())
							}
						case pb.ActionType_UPDATE:
							for _, item := range res.Items() {
								cnt = cnt + 1
								updatedItemIds = append(updatedItemIds, item.ID())
							}
						case pb.ActionType_DELETE:
							for _, item := range res.Items() {
								deletedItemIds = append(deletedItemIds, item.ID())
							}
						}

						fmt.Println("List ", len(createdItemIds), len(updatedItemIds), len(deletedItemIds))
					}
				}
			}()
		}()

		ctx := context.Background()
		ctx = propagator.With(ctx, registry.ContextKey, m)

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

			fmt.Println("Adding ", i)

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

		<-waitForQuiet

		createdItemIds = unique(createdItemIds)
		So(len(createdItemIds), ShouldEqual, numNodes+numServices+numServers)

		reset()

		if numUpdates > 0 {
			for i := 0; i < numUpdates; i++ {
				if numNodes > 0 {
					go func() {

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
					}()
				}

				if numServers > 0 {
					//wg.Add(1)
					go func() {
						//defer wg.Done()

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

					}()
				}

				if numServices > 0 {
					//wg.Add(1)
					go func() {
						//defer wg.Done()

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

					}()
				}
			}

			fmt.Println("Waiting for quiet ?")
			<-waitForQuiet
			fmt.Println("Got it")

			updatedItemIds = unique(updatedItemIds)
			itemsSentToRegisterIds = unique(itemsSentToRegisterIds)
			totalUpdates := len(itemsSentToRegisterIds)

			sort.Strings(updatedItemIds)

			So(len(updatedItemIds), ShouldEqual, totalUpdates)

			reset()
		}

		//<-time.After(3 * time.Second)

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

		<-waitForQuiet

		afterDeleteServices, err := m.List(registry.WithType(pb.ItemType_SERVICE))
		So(err, ShouldBeNil)
		So(len(afterDeleteServices), ShouldEqual, 0)

		deletedItemIds = unique(deletedItemIds)
		total := numNodes + numServices + numServers
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
