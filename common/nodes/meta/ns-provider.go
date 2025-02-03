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

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
)

var (
	TestPresetNamespaces []*idm.UserMetaNamespace
)

// NsProvider lists all namespaces info from services declared ServiceMetaNsProvider
// It watches events to maintain the list
type NsProvider struct {
	sync.RWMutex // this handles a lock for the namespaces field
	Ctx          context.Context
	namespaces   []*idm.UserMetaNamespace
	loaded       bool
	streamers    []tree.NodeProviderStreamer_ReadNodeStreamClient
	closer       context.CancelFunc
}

// NewNsProvider creates a new namespace provider
func NewNsProvider(ctx context.Context) *NsProvider {
	ns := &NsProvider{
		Ctx: ctx,
	}
	if TestPresetNamespaces != nil {
		ns.namespaces = TestPresetNamespaces
		ns.loaded = true
	}
	ns.Watch(ctx)
	return ns
}

// Namespaces lists all known usermeta namespaces
func (p *NsProvider) Namespaces() map[string]*idm.UserMetaNamespace {
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
func (p *NsProvider) ExcludeIndexes() map[string]struct{} {
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
func (p *NsProvider) IncludedIndexes() map[string]struct{} {
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
func (p *NsProvider) Load() {
	// Other Meta Providers (running services only)
	services, err := servicesWithMeta(p.Ctx, ServiceMetaNsProvider, "list")
	if err != nil {
		return
	}
	defer func() {
		p.loaded = true
	}()
	ct, ca := context.WithCancel(context.WithoutCancel(p.Ctx))
	defer ca()
	for _, srv := range services {
		cl := idm.NewUserMetaServiceClient(grpc.ResolveConn(p.Ctx, srv.Name()))
		s, e := cl.ListUserMetaNamespace(ct, &idm.ListUserMetaNamespaceRequest{})
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
	}

}

// InitStreamers prepares a set of NodeProviderStreamerClients ready to be requested
func (p *NsProvider) InitStreamers(ctx context.Context) error {
	services, err := servicesWithMeta(p.Ctx, ServiceMetaNsProvider, "list")
	if err != nil {
		return err
	}
	ct, can := context.WithCancel(ctx)
	p.closer = can
	for _, srv := range services {
		c := tree.NewNodeProviderStreamerClient(grpc.ResolveConn(ctx, srv.Name()))
		if s, e := c.ReadNodeStream(ct); e == nil {
			p.streamers = append(p.streamers, s)
		}
	}
	return nil
}

// CloseStreamers closes all prepared streamer clients
func (p *NsProvider) CloseStreamers() error {
	if p.closer != nil {
		p.closer()
	}
	p.streamers = []tree.NodeProviderStreamer_ReadNodeStreamClient{}
	return nil
}

// ReadNode goes through all prepared streamers to collect metadata
func (p *NsProvider) ReadNode(node *tree.Node) (*tree.Node, error) {
	out := node.Clone()
	if out.MetaStore == nil {
		out.MetaStore = make(map[string]string)
	}
	for _, s := range p.streamers {
		if er := s.Send(&tree.ReadNodeRequest{Node: node}); er != nil {
			return node, er
		}
		if resp, e := s.Recv(); e == nil && resp.Node.MetaStore != nil {
			for k, v := range resp.Node.MetaStore {
				out.MetaStore[k] = v
			}
		} else if e != nil {
			return node, e
		}
	}
	return out, nil
}

// Clear unload cached data to force reload at next call
func (p *NsProvider) Clear() {
	p.Lock()
	p.namespaces = nil
	p.loaded = false
	p.Unlock()
}

// Watch watches idm ChangeEvents to force reload when metadata namespaces are modified
func (p *NsProvider) Watch(ctx context.Context) {
	_ = broker.SubscribeCancellable(context.WithoutCancel(ctx), common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
		ce := &idm.ChangeEvent{}
		if _, e := message.Unmarshal(ctx, ce); e == nil && ce.MetaNamespace != nil {
			p.Clear()
		}
		return nil
	}, broker.WithCounterName("ns_provider"))
}
