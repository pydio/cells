package registry

import (
	"fmt"
	microregistry "github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common/registry"
	"testing"
	"time"
)

func TestStan(t *testing.T) {
	EnableStan()

	registry.Init()

	ticker := time.Tick(1 * time.Second)

	service := &microregistry.Service{
		Name:    "test",
		Version: "",
	}

	microregistry.DefaultRegistry.Register(service, microregistry.RegisterTTL(3* time.Second))

	for {
		select {
		case <-ticker:
			fmt.Println(registry.ListRunningServices())
		}
	}
}
