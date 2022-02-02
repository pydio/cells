package configregistry

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"testing"

	"github.com/pydio/cells/v4/common/config/file"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

func TestMemory(t *testing.T) {
	c, err := file.New("/tmp/whatever", true, WithJSONItem())
	if err != nil {
		log.Fatal(err)
	}
	m := NewConfigRegistry(c)

	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		w, err := m.Watch()
		if err != nil {
			log.Fatal(err)
		}

		for {
			res, err := w.Next()
			if err != nil {
				log.Fatal(err)
			}

			fmt.Println(res)

			wg.Done()
		}
	}()

	ctx := context.Background()
	ctx = servicecontext.WithRegistry(ctx, m)

	s := service.NewService(
		service.Name("test"),
		service.Context(ctx),
	)

	servicesBefore, err := m.List()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Services before stop are ", servicesBefore)

	wg.Wait()

	wg.Add(1)

	if err := s.Stop(); err != nil {
		log.Fatal(err)
	}

	servicesAfter, err := m.List()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Services after stop are ", servicesAfter)

	wg.Wait()

	os.Remove("/tmp/whatever")
}
