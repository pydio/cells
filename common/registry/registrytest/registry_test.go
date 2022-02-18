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
			w, err := m.Watch(registry.WithAction(pb.ActionType_FULL_LIST))
			if err != nil {
				log.Fatal(err)
			}

			for {
				res, err := w.Next()
				if err != nil {
					log.Fatal(err)
				}

				fmt.Println("Number of Items received ? ", len(res.Items()))
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

		<-time.After(200 * time.Millisecond)

		afterCreateServices, err := m.List()
		So(err, ShouldBeNil)
		So(len(afterCreateServices), ShouldEqual, numServices)

		for _, s := range services {
			var svc service.Service
			if s.As(&svc) {
				if err := svc.Stop(); err != nil {
					log.Fatal(err)
				}
			}
		}

		afterDeleteServices, err := m.List()
		So(err, ShouldBeNil)
		So(len(afterDeleteServices), ShouldEqual, 0)

		<-time.After(1 * time.Second)
	})
}
