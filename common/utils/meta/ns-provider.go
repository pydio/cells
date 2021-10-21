/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package meta

import (
	"context"
	"sync"

	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/broker"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
)

// NamespaceProvider list all namespaces info from services declared ServiceMetaNsProvider
// It watches events to maintain the list
type NamespacesProvider struct {
	sync.RWMutex // this handles a lock for the namespaces field
	namespaces   []*idm.UserMetaNamespace
	loaded       bool
	streamers    []tree.NodeProviderStreamer_ReadNodeStreamClient
}

// NewNamespacesProvider creates a new namespace provider
func NewNamespacesProvider() *NamespacesProvider {
	ns := &NamespacesProvider{}
	ns.Watch()
	return ns
}

// Namespaces lists all known usermeta namespaces
func (p *NamespacesProvider) Namespaces() map[string]*idm.UserMetaNamespace {
	if !p.loaded {
		p.Load()
	}
	p.RLock()
	defer p.RUnlock()
	ns := make(map[string]*idm.UserMetaNamespace, len(p.namespaces))
	for _, n := range p.namespaces {
		ns[n.Namespace] = n
	}
	return ns
}

// ExcludeIndexes lists namespaces that should not be indexed by search engines
func (p *NamespacesProvider) ExcludeIndexes() map[string]struct{} {
	if !p.loaded {
		p.Load()
	}
	ni := make(map[string]struct{})
	p.RLock()
	defer p.RUnlock()
	for _, ns := range p.namespaces {
		if !ns.Indexable {
			ni[ns.Namespace] = struct{}{}
		}
	}
	return ni
}

// IncludedIndexes lists namespaces that should be indexed by search engines
func (p *NamespacesProvider) IncludedIndexes() map[string]struct{} {
	if !p.loaded {
		p.Load()
	}
	ni := make(map[string]struct{})
	p.RLock()
	defer p.RUnlock()
	for _, ns := range p.namespaces {
		if ns.Indexable {
			ni[ns.Namespace] = struct{}{}
		}
	}
	return ni
}

// Load finds all services declared as ServiceMetaNsProvider and call them to list the namespaces they declare
func (p *NamespacesProvider) Load() {
	// Other Meta Providers (running services only)
	services, err := registry.ListServicesWithMicroMeta(ServiceMetaNsProvider, "list")
	if err != nil {
		return
	}
	defer func() {
		p.loaded = true
	}()
	for _, srv := range services {
		cl := idm.NewUserMetaServiceClient(srv.Name(), defaults.NewClient())
		s, e := cl.ListUserMetaNamespace(context.Background(), &idm.ListUserMetaNamespaceRequest{})
		if e != nil {
			continue
		}
		p.Lock()
		for {
			r, er := s.Recv()
			if er != nil {
				break
			}
			p.namespaces = append(p.namespaces, r.UserMetaNamespace)
		}
		p.Unlock()
		s.Close()
	}

}

// InitStreamers prepares a set of NodeProviderStreamerClients ready to be requested
func (p *NamespacesProvider) InitStreamers(ctx context.Context) error {
	services, err := registry.ListServicesWithMicroMeta(ServiceMetaNsProvider, "list")
	if err != nil {
		return err
	}
	for _, srv := range services {
		c := tree.NewNodeProviderStreamerClient(srv.Name(), defaults.NewClient())
		if s, e := c.ReadNodeStream(ctx); e == nil {
			p.streamers = append(p.streamers, s)
		}
	}
	return nil
}

// CloseStreamers closes all prepared streamer clients
func (p *NamespacesProvider) CloseStreamers() error {
	var ers []error
	for _, s := range p.streamers {
		if e := s.Close(); e != nil {
			ers = append(ers, e)
		}
	}
	p.streamers = []tree.NodeProviderStreamer_ReadNodeStreamClient{}
	if len(ers) > 0 {
		return ers[0]
	}
	return nil
}

// ReadNode goes through all prepared streamers to collect metadata
func (p *NamespacesProvider) ReadNode(node *tree.Node) (*tree.Node, error) {
	out := node.Clone()
	if out.MetaStore == nil {
		out.MetaStore = make(map[string]string)
	}
	for _, s := range p.streamers {
		s.Send(&tree.ReadNodeRequest{Node: node})
		if resp, e := s.Recv(); e == nil && resp.Node.MetaStore != nil {
			for k, v := range resp.Node.MetaStore {
				out.MetaStore[k] = v
			}
		}
	}
	return out, nil
}

// Clear unload cached data to force reload at next call
func (p *NamespacesProvider) Clear() {
	p.Lock()
	p.namespaces = nil
	p.loaded = false
	p.Unlock()
}

// Watch watches idm ChangeEvents to force reload when metadata namespaces are modified
func (p *NamespacesProvider) Watch() {
	defaults.Broker().Subscribe(common.TopicIdmEvent, func(publication broker.Publication) error {
		var ce idm.ChangeEvent
		if e := proto.Unmarshal(publication.Message().Body, &ce); e == nil {
			if ce.MetaNamespace != nil {
				p.Clear()
			}
		}
		return nil
	})
}
