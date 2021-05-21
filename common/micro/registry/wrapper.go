package registry

import (
	"errors"
	"time"

	"github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common/config"
)

type registryWithExpiry struct {
	registry.Registry
	duration time.Duration
}

func NewRegistryWithExpiry(r registry.Registry, duration time.Duration) registry.Registry {
	return &registryWithExpiry{Registry: r, duration: duration}
}

func (r *registryWithExpiry) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	// Adding time as a string metadata for the nodes
	for _, node := range s.Nodes {
		// Adding twice the ttl to make sure we don't have any false positive
		data, _ := time.Now().Add(r.duration).MarshalText()
		node.Metadata["expiry"] = string(data)
	}

	return r.Registry.Register(s, opts...)
}

type registryWithUnique struct {
	registry.Registry
}

func NewRegistryWithUnique(r registry.Registry) registry.Registry {
	return &registryWithUnique{Registry: r}
}

func (r *registryWithUnique) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	if config.Get("services", s.Name, "unique").Bool() {
		ss, err := r.GetService(s.Name)
		if err != nil {
			return err
		}
		if len(ss) > 0 {
			return errors.New("ErrServiceStartNeedsRetry - service already running")
		}
	}
	return r.Registry.Register(s, opts...)
}
