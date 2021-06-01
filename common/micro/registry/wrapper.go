package registry

import (
	"errors"
	"fmt"
	"time"

	"github.com/micro/go-micro/registry"

	"github.com/pydio/cells/common/config"
	pydioregistry "github.com/pydio/cells/common/registry"
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

type registryWithPeers struct {
	registry.Registry
}

func NewRegistryWithPeers(r registry.Registry) registry.Registry {
	return &registryWithPeers{
		Registry: r,
	}
}

func (r *registryWithPeers) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	for _, node := range s.Nodes {
		pydioregistry.GetPeer(node).Add(s, fmt.Sprintf("%d", node.Port))
	}
	return r.Registry.Register(s, opts...)
}

func (r *registryWithPeers) Deregister(s *registry.Service) error {
	for _, node := range s.Nodes {
		pydioregistry.GetPeer(node).Delete(s, fmt.Sprintf("%d", node.Port))
	}
	return r.Registry.Deregister(s)
}

type registryWithProcesses struct {
	registry.Registry
}

func NewRegistryWithProcesses(r registry.Registry) registry.Registry {
	return &registryWithProcesses{
		Registry: r,
	}
}

func (r *registryWithProcesses) Register(s *registry.Service, opts ...registry.RegisterOption) error {
	for _, node := range s.Nodes {
		pydioregistry.GetProcess(node).Add(s.Name)
	}
	return r.Registry.Register(s, opts...)
}

func (r *registryWithProcesses) Deregister(s *registry.Service) error {
	for _, node := range s.Nodes {
		pydioregistry.GetProcess(node).Delete(s.Name)
	}
	return r.Registry.Deregister(s)
}
