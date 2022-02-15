package configregistry

import (
	"context"
	"fmt"
	"log"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/config/memory"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"

	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

func TestMemory(t *testing.T) {
	numServices := 100

	//etcdconn, err := clientv3.New(clientv3.Config{
	//	Endpoints:   []string{"http://0.0.0.0:2379"},
	//	DialTimeout: 2 * time.Second,
	//})
	//if err != nil {
	//	log.Fatal("could not start etcd", zap.Error(err))
	//}

	c := memory.New()
	//c := etcd.NewSource(context.Background(), etcdconn, "registry", WithJSONItem())
	//c, err := file.New("/tmp/whatever", true, WithJSONItem())
	//if err != nil {
	//	log.Fatal(err)
	//}

	m := NewConfigRegistry(c)

	wg := &sync.WaitGroup{}
	go func() {
		w, err := m.Watch(registry.WithAction(pb.ActionType_FULL_DIFF))
		if err != nil {
			log.Fatal(err)
		}

		for {
			res, err := w.Next()
			if err != nil {
				log.Fatal(err)
			}

			fmt.Println("Number of Items received ? ", len(res.Items()))

			for _ = range res.Items() {
				wg.Done()
			}
		}
	}()

	ctx := context.Background()
	ctx = servicecontext.WithRegistry(ctx, m)

	wg.Add(numServices)

	var services []service.Service
	for i := 0; i < numServices; i++ {
		go func(i int) {
			services = append(services, service.NewService(
				service.Name(fmt.Sprintf("test %d", i)),
				service.Context(ctx),
			))
		}(i)
	}

	<-time.After(1 * time.Second)

	servicesBefore, err := m.List()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Number of services before stop :", len(servicesBefore))

	wg.Wait()

	wg.Add(numServices)

	for _, s := range services {
		go func(s service.Service) {
			if err := s.Stop(); err != nil {
				log.Fatal(err)
			}
		}(s)
	}

	wg.Wait()

	servicesAfter, err := m.List()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Services after stop are ", servicesAfter)
}
