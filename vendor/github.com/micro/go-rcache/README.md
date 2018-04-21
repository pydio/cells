# Registry Cache [![License](https://img.shields.io/:license-apache-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![GoDoc](https://godoc.org/github.com/micro/go-rcache?status.svg)](https://godoc.org/github.com/micro/go-rcache)

Go-rcache is a library that provides a caching layer for the go-micro [registry](https://godoc.org/github.com/micro/go-micro/registry#Registry).

If you're looking for caching in your microservices use the [selector](https://micro.mu/docs/fault-tolerance.html#caching-discovery).

## Interface

```
// Cache is the registry cache interface
type Cache interface {
	// embed the registry interface
	registry.Registry
	// stop the cache watcher
	Stop()
}
```

## Usage

```
import (
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-rcache"
)

r := registry.NewRegistry()
cache := rcache.New(r)

services, _ := cache.GetService("my.service")
```
