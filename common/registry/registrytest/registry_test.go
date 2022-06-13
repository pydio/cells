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

		var services []service.Service
		for i := 0; i < numServices; i++ {
			services = append(services, service.NewService(
				service.Name(fmt.Sprintf("test %d", i)),
				service.Context(ctx),
			))
		}

		<-time.After(5 * time.Second)

		for i := 0; i < numServices; i++ {
			services = append(services, service.NewService(
				service.Name(fmt.Sprintf("test %d", i)),
				service.Context(ctx),
			))
		}

		<-time.After(5 * time.Second)

		afterCreateServices, err := m.List(registry.WithType(pb.ItemType_SERVICE))
		So(err, ShouldBeNil)
		So(len(afterCreateServices), ShouldEqual, numServices*2)

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
