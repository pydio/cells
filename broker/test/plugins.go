package test

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common/micro/router"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
)

func init() {
	lock := &sync.Mutex{}

	plugins.Register(func(ctx context.Context) {
		service.NewService(
			service.Name("testing"),
			service.Context(ctx),
			service.WithMicro(func(m micro.Service) error {
				r := router.NewRouter()
				fmt.Println(r)
				go func() {
					<-time.After(1 * time.Second)

					ticker := time.NewTicker(1 * time.Second)

					for {
						select {
						case <-ticker.C:
							lock.Lock()
							meta := m.Server().Options().Metadata
							c, ok := meta["testing"]
							_ = c
							_ = ok
							lock.Unlock()
						}
					}
				}()

				return nil
			}),
		)
	})
}
