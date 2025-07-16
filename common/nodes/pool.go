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

package nodes

import (
	"context"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	clientgrpc "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/object"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/watch"
)

var (
	poolPool   *openurl.Pool[SourcesPool]
	poolOnce   sync.Once
	poolOpener = NewPool
)

type sourceAlias struct {
	dataSource string
	bucket     string
}

type LoadedSource struct {
	*object.DataSource
	Client StorageClient
}

type SourcesPool interface {
	Once()
	Close()
	GetTreeClient() tree.NodeProviderClient
	GetTreeClientWrite() tree.NodeReceiverClient
	GetDataSourceInfo(dsName string, retries ...int) (LoadedSource, error)
	GetDataSources() map[string]LoadedSource
	LoadDataSources()
}

func (s LoadedSource) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	return encoder.AddObject("DataSource", s.DataSource)
}

// ClientsPool is responsible for discovering available datasources and
// keeping an up to date registry that is used by the routers.
type ClientsPool struct {
	ctx context.Context
	o   sync.Once
	reg registry.Registry

	sync.RWMutex
	sources map[string]LoadedSource
	aliases map[string]sourceAlias

	// Statically set for testing
	treeClient      tree.NodeProviderClient
	treeClientWrite tree.NodeReceiverClient

	regWatcher  registry.Watcher
	confWatcher watch.Receiver

	reload chan bool
}

// SetSourcesPoolOpener replaces the internal standard opener, used for testing
func SetSourcesPoolOpener(o func(ctx context.Context) *openurl.Pool[SourcesPool]) {
	poolOpener = o
}

// GetSourcesPool lazily resolves a SourcesPool for a given context
func GetSourcesPool(ctx context.Context) SourcesPool {
	poolOnce.Do(func() {
		poolPool = poolOpener(ctx)
	})
	p, e := poolPool.Get(ctx)
	if e != nil {
		panic(e)
	}
	p.Once()
	return p
}

// NewPool provides a simple memory-based contextualized pool
func NewPool(ctx context.Context) *openurl.Pool[SourcesPool] {
	return openurl.MustMemPool[SourcesPool](ctx, func(ctx context.Context, url string) SourcesPool {
		return openPool(ctx)
	})
}

// NewTestPool creates a pool of empty stubs, eventually forcing to return always the same preset
func NewTestPool(ctx context.Context, presetSource ...SourcesPool) *openurl.Pool[SourcesPool] {
	return openurl.MustMemPool[SourcesPool](ctx, func(ctx context.Context, url string) SourcesPool {
		if len(presetSource) > 0 {
			return presetSource[0]
		}
		return &ClientsPool{
			ctx:     ctx,
			sources: make(map[string]LoadedSource),
			aliases: make(map[string]sourceAlias),
			reload:  make(chan bool),
		}
	})
}

// NewTestPoolWithDataSources will provide a list of LoadedSource with preset mock data
func NewTestPoolWithDataSources(ctx context.Context, sc StorageClient, dss ...string) *openurl.Pool[SourcesPool] {
	return openurl.MustMemPool[SourcesPool](ctx, func(ctx context.Context, url string) SourcesPool {
		cp := &ClientsPool{
			ctx:     ctx,
			sources: make(map[string]LoadedSource),
			aliases: make(map[string]sourceAlias),
			reload:  make(chan bool),
		}
		for _, ds := range dss {
			cp.sources[ds] = LoadedSource{
				DataSource: &object.DataSource{Name: ds, ObjectsBucket: ds},
				Client:     sc,
			}
		}
		return cp
	})

}

func openPool(ctx context.Context) *ClientsPool {
	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		fmt.Println("openPool will panic, missing manager in context")
		panic("cannot instantiate client pool (missing manager in context)")
	}

	pool := &ClientsPool{
		ctx:     propagator.ForkedBackgroundWithMeta(ctx),
		sources: make(map[string]LoadedSource),
		aliases: make(map[string]sourceAlias),
		reload:  make(chan bool),
		reg:     reg,
	}
	return pool
}

func (p *ClientsPool) Once() {
	p.o.Do(func() {
		if p.reg != nil { // reg is nil during tests
			go p.LoadDataSources()
			go p.reloadDebounced()
			go p.watchRegistry(p.reg)
			go p.watchConfigChanges()
		}
	})
}

// Close stops the underlying watcher if defined.
func (p *ClientsPool) Close() {
	if p.regWatcher != nil {
		p.regWatcher.Stop()
	}
	if p.confWatcher != nil {
		p.confWatcher.Stop()
	}
}

// GetTreeClient returns the internal NodeProviderClient pointing to the TreeService.
func (p *ClientsPool) GetTreeClient() tree.NodeProviderClient {
	if p.treeClient != nil {
		return p.treeClient
	}
	return tree.NewNodeProviderClient(clientgrpc.ResolveConn(p.ctx, common.ServiceTreeGRPC))
}

// GetTreeClientWrite returns the internal NodeReceiverClient pointing to the TreeService.
func (p *ClientsPool) GetTreeClientWrite() tree.NodeReceiverClient {
	if p.treeClientWrite != nil {
		return p.treeClientWrite
	}
	return tree.NewNodeReceiverClient(clientgrpc.ResolveConn(p.ctx, common.ServiceTreeGRPC))
}

// GetDataSourceInfo tries to find information about a DataSource, eventually retrying as DataSource
// could be currently starting and not yet registered in the ClientsPool.
func (p *ClientsPool) GetDataSourceInfo(dsName string, retries ...int) (LoadedSource, error) {

	if dsName == "" {
		log.Logger(context.Background()).Error("Entered GetDataSourceInfo with an empty dsName", zap.Stack("stack"))
		return LoadedSource{}, errors.New("empty dsName")
	}

	if dsName == "default" {
		dsName = config.Get(p.ctx, "defaults", "datasource").Default("default").String()
	}

	p.RLock()
	cl, ok := p.sources[dsName]
	p.RUnlock()

	if ok {

		return cl, nil

	} else if alias, aOk := p.aliases[dsName]; aOk {

		if dsi, e := p.GetDataSourceInfo(alias.dataSource); e != nil {

			return dsi, e

		} else {

			ds := LoadedSource{}
			ds.DataSource = proto.Clone(dsi.DataSource).(*object.DataSource)
			ds.DataSource.ObjectsBucket = alias.bucket
			ds.Client = dsi.Client
			return ds, nil

		}

	} else if len(retries) == 0 || retries[0] <= 5 {

		var retry int
		if len(retries) > 0 {
			retry = retries[0]
		}
		delay := (retry) * 2
		if retry > 0 {
			log.Logger(p.ctx).Warn(fmt.Sprintf("[ClientsPool] cannot find datasource, retrying in %ds...", delay), zap.String("ds", dsName), zap.Any("retries", retry))
			<-time.After(time.Duration(delay) * time.Second)
		}
		p.LoadDataSources()
		return p.GetDataSourceInfo(dsName, retry+1)

	} else {

		e := errors.New("Could not find DataSource " + dsName)
		var keys []string
		p.RLock()
		for k := range p.sources {
			keys = append(keys, k)
		}
		p.RUnlock()
		log.Logger(p.ctx).Error(e.Error(), zap.Strings("currentSources", keys))
		return LoadedSource{}, e

	}

}

// GetDataSources returns currently loaded datasources
func (p *ClientsPool) GetDataSources() (out map[string]LoadedSource) {
	// Create a copy
	out = make(map[string]LoadedSource)
	p.RLock()
	for k, v := range p.sources {
		out[k] = v
	}
	p.RUnlock()
	return
}

// LoadDataSources queries the registry to reload available datasources
func (p *ClientsPool) LoadDataSources() {
	if IsUnitTestEnv {
		// Workaround the fact that no registry is present when doing unit tests
		return
	}

	sources := config.Get(p.ctx, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources").StringArray()
	sources = config.SourceNamesFiltered(sources)

	for _, source := range sources {
		if sif, er := config.GetSourceInfoByName(p.ctx, source); er != nil || sif.Disabled {
			continue
		}
		endpointClient := object.NewDataSourceEndpointClient(clientgrpc.ResolveConn(p.ctx, common.ServiceDataSyncGRPC_+source))
		to, ca := context.WithTimeout(p.ctx, 20*time.Second)
		response, err := endpointClient.GetDataSourceConfig(to, &object.GetDataSourceConfigRequest{})
		if err == nil && response.DataSource != nil {
			log.Logger(p.ctx).Debug("Creating client for datasource " + source)
			if e := p.CreateClientsForDataSource(source, response.DataSource); e != nil {
				log.Logger(p.ctx).Warn("Cannot create clients for datasource "+source, zap.Error(e))
			}
		} else {
			if !errors.Is(err, errors.StatusServiceUnavailable) {
				log.Logger(p.ctx).Warn("service " + common.ServiceDataSyncGRPC_ + source + " not available yet...")
			} else {
				log.Logger(p.ctx).Error("no answer from endpoint, maybe not ready yet? "+common.ServiceDataSyncGRPC_+source, zap.Any("r", response), zap.Error(err))
			}
		}
		ca()
	}

	if e := p.registerAlternativeClient(common.PydioThumbstoreNamespace); e != nil {
		log.Logger(p.ctx).Warn("Cannot register alternative client "+common.PydioThumbstoreNamespace, zap.Error(e))
	}
	if e := p.registerAlternativeClient(common.PydioDocstoreBinariesNamespace); e != nil {
		log.Logger(p.ctx).Warn("Cannot register alternative client "+common.PydioDocstoreBinariesNamespace, zap.Error(e))
	}
	if e := p.registerAlternativeClient(common.PydioVersionsNamespace); e != nil {
		log.Logger(p.ctx).Warn("Cannot register alternative client "+common.PydioVersionsNamespace, zap.Error(e))
	}
}

func (p *ClientsPool) registerAlternativeClient(namespace string) error {
	dataSource, bucket, err := GetGenericStoreClientConfig(p.ctx, namespace)
	if err != nil {
		return err
	}
	p.Lock()
	defer p.Unlock()
	p.aliases[namespace] = sourceAlias{
		dataSource: dataSource,
		bucket:     bucket,
	}
	return nil
}

func (p *ClientsPool) watchRegistry(reg registry.Registry) error {

	w, err := reg.Watch(registry.WithType(pb.ItemType_ADDRESS))
	if err != nil {
		return err
	}
	p.regWatcher = w

	for {
		_, err := w.Next()
		if err != nil {
			return err
		}

		go func() { p.reload <- true }()
	}

}

func (p *ClientsPool) reloadDebounced() {
	timer := time.NewTimer(1 * time.Second)
	var reloadRequired bool
	for {
		select {
		case <-p.reload:
			reloadRequired = true
			timer.Stop()
			timer = time.NewTimer(1 * time.Second)
		case <-timer.C:
			if reloadRequired {
				go p.LoadDataSources()
				reloadRequired = false
			}
		}
	}
}

func (p *ClientsPool) watchConfigChanges() {
	for {
		watcher, err := config.Watch(p.ctx, watch.WithPath("services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources"))
		if err != nil {
			// Cool-off period
			time.Sleep(1 * time.Second)
			continue
		}

		p.confWatcher = watcher
		for {
			event, err := watcher.Next()
			if err != nil {
				break
			}

			if event != nil {
				p.reload <- true
			}
		}

		watcher.Stop()

		// Cool-off period
		time.Sleep(1 * time.Second)
	}
}

func (p *ClientsPool) CreateClientsForDataSource(dataSourceName string, dataSource *object.DataSource) error {

	log.Logger(p.ctx).Debug("Adding dataSource", zap.String("dsname", dataSourceName))
	loaded := LoadedSource{
		DataSource: dataSource,
	}
	client, err := NewStorageClient(dataSource.ClientConfig(p.ctx, config.GetSecret))
	if err != nil {
		return err
	}
	loaded.Client = client

	p.Lock()
	p.sources[dataSourceName] = loaded
	p.Unlock()

	return nil
}

func MakeFakeClientsPool(tc tree.NodeProviderClient, tw tree.NodeReceiverClient) *ClientsPool {
	IsUnitTestEnv = true

	mockDatasource := &object.DataSource{
		Name:          "datasource",
		ObjectsHost:   "localhost",
		ObjectsPort:   9078,
		ApiKey:        "access",
		ApiSecret:     "secret",
		ObjectsSecure: false,
		ObjectsBucket: "bucket",
	}

	loaded := LoadedSource{
		DataSource: mockDatasource,
	}
	cfg := configx.New()
	_ = cfg.Val("type").Set("mock")
	client, _ := NewStorageClient(cfg)
	loaded.Client = client

	return &ClientsPool{
		ctx: context.TODO(),
		sources: map[string]LoadedSource{
			"datasource": loaded,
		},
		aliases:         make(map[string]sourceAlias),
		reload:          make(chan bool),
		treeClient:      tc,
		treeClientWrite: tw,
	}

}
