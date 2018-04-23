# Memory Registry

In-memory registry can be used where no coordination or third party dependency is required.

## Usage

### With Flag

```go
import _ "github.com/micro/go-plugins/registry/memory"
```

```shell
go run main.go --registry=memory
```

### Direct Use

```go
import (
	"github.com/micro/go-micro"
	"github.com/micro/go-plugins/registry/memory"
)

func main() {
	service := micro.NewService(
		micro.Name("my.service"),
		micro.Registry(memory.NewRegistry()),
	)
}
```

### Preload Services

```go
import (
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-plugins/registry/memory"
)

func main() {
	// list of services
	services := map[string][]*registry.Service{
		"srv.foo": []*registry.Service{
			&registry.Service{
				Name: "srv.foo",
				Version: "latest",
				Nodes: []*registry.Node{
					&registry.Node{
						Id: "srv.foo.1",
						Address: "10.0.0.1",
						Port: 10001,
					},
				},
			}
		},
	}

	// create registry
	r := memory.NewRegistry(
		memory.Services(services),
	)

	service := micro.NewService(
		micro.Name("my.service"),
		micro.Registry(r),
	)
}
```
