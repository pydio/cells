/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package views

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/client"
	microregistry "github.com/micro/go-micro/registry"
	"github.com/patrickmn/go-cache"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/x/configx"
)

var (
	ancestorsCacheExpiration = 800 * time.Millisecond
	ancestorsParentsCache    = cache.New(ancestorsCacheExpiration, 5*time.Second)
	ancestorsNodesCache      = cache.New(ancestorsCacheExpiration, 5*time.Second)
)

type sourceAlias struct {
	dataSource string
	bucket     string
}

// ClientsPool is responsible for discovering available datasources and
// keeping an up to date registry that is used by the routers.
type ClientsPool struct {
	sync.Mutex
	sources map[string]LoadedSource
	aliases map[string]sourceAlias

	// Statically set for testing
	treeClient      tree.NodeProviderClient
	treeClientWrite tree.NodeReceiverClient

	genericClient client.Client
	watcher       microregistry.Watcher
	confWatcher   configx.Receiver
}

// NewSource instantiates a LoadedSource with a minio client
func NewSource(data *object.DataSource) (LoadedSource, error) {
	loaded := LoadedSource{}
	loaded.DataSource = *data
	var err error
	loaded.Client, err = data.CreateClient()
	return loaded, err
}

// NewClientsPool creates a client pool and initialises it by calling the registry.
func NewClientsPool(watchRegistry bool) *ClientsPool {

	pool := &ClientsPool{
		sources: make(map[string]LoadedSource),
		aliases: make(map[string]sourceAlias),
	}

	if IsUnitTestEnv {
		// Workaround the fact that no registry is present when doing unit tests
		return pool
	}

	pool.LoadDataSources()
	if watchRegistry {
		go pool.watchRegistry()
		go pool.watchConfigChanges()
	}

	return pool
}

// Close stops the underlying watcher if defined.
func (p *ClientsPool) Close() {
	if p.watcher != nil {
		p.watcher.Stop()
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
	return tree.NewNodeProviderClient(common.ServiceGrpcNamespace_+common.ServiceTree, defaults.NewClient())
}

// GetTreeClientWrite returns the internal NodeReceiverClient pointing to the TreeService.
func (p *ClientsPool) GetTreeClientWrite() tree.NodeReceiverClient {
	if p.treeClientWrite != nil {
		return p.treeClientWrite
	}
	return tree.NewNodeReceiverClient(common.ServiceGrpcNamespace_+common.ServiceTree, defaults.NewClient())
}

// GetDataSourceInfo tries to find information about a DataSource, eventually retrying as DataSource
// could be currently starting and not yet registered in the ClientsPool.
func (p *ClientsPool) GetDataSourceInfo(dsName string, retries ...int) (LoadedSource, error) {

	if dsName == "default" {
		dsName = config.Get("defaults", "datasource").Default("default").String()
	}

	if cl, ok := p.sources[dsName]; ok {

		return cl, nil

	} else if alias, aOk := p.aliases[dsName]; aOk {

		if dsi, e := p.GetDataSourceInfo(alias.dataSource); e != nil {

			return dsi, e

		} else {

			ds := LoadedSource{}
			ds.DataSource = *proto.Clone(&dsi.DataSource).(*object.DataSource)
			ds.DataSource.ObjectsBucket = alias.bucket
			ds.Client = dsi.Client
			return ds, nil

		}

	} else if len(retries) == 0 || retries[0] <= 5 {

		var retry int
		if len(retries) > 0 {
			retry = retries[0]
		}
		delay := (retry + 1) * 2

		log.Logger(context.Background()).Debug(fmt.Sprintf("[ClientsPool] cannot find datasource, retrying in %ds...", delay), zap.String("ds", dsName), zap.Any("retries", retry))

		<-time.After(time.Duration(delay) * time.Second)
		p.LoadDataSources()
		return p.GetDataSourceInfo(dsName, retry+1)

	} else {

		e := fmt.Errorf("Could not find DataSource " + dsName)
		var keys []string
		for k := range p.sources {
			keys = append(keys, k)
		}
		log.Logger(context.Background()).Error(e.Error(), zap.Strings("currentSources", keys))
		return LoadedSource{}, e

	}

}

// GetDataSources returns currently loaded datasources
func (p *ClientsPool) GetDataSources() map[string]LoadedSource {
	return p.sources
}

// LoadDataSources queries the registry to reload available datasources
func (p *ClientsPool) LoadDataSources() {
	if IsUnitTestEnv {
		// Workaround the fact that no registry is present when doing unit tests
		return
	}

	sources := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources").StringArray()
	sources = config.SourceNamesFiltered(sources)

	cli := defaults.NewClient()

	ctx := context.Background()
	for _, source := range sources {
		endpointClient := object.NewDataSourceEndpointClient(common.ServiceGrpcNamespace_+common.ServiceDataSync_+source, cli)
		response, err := endpointClient.GetDataSourceConfig(ctx, &object.GetDataSourceConfigRequest{})
		if err == nil && response.DataSource != nil {
			log.Logger(ctx).Debug("Creating client for datasource " + source)
			p.createClientsForDataSource(source, response.DataSource)
		} else {
			log.Logger(context.Background()).Debug("no answer from endpoint, maybe not ready yet? "+common.ServiceGrpcNamespace_+common.ServiceDataSync_+source, zap.Any("r", response), zap.Error(err))
		}
	}

	p.registerAlternativeClient(common.PydioThumbstoreNamespace)
	p.registerAlternativeClient(common.PydioDocstoreBinariesNamespace)
	p.registerAlternativeClient(common.PydioVersionsNamespace)
}

func (p *ClientsPool) registerAlternativeClient(namespace string) error {
	dataSource, bucket, err := GetGenericStoreClientConfig(namespace)
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

func (p *ClientsPool) watchRegistry() {

	watcher, err := registry.Watch()
	p.watcher = watcher
	if err != nil {
		return
	}
	for {
		result, err := watcher.Next()
		if result != nil && err == nil {
			srv := result.Service
			if strings.Contains(srv.Name, common.ServiceGrpcNamespace_+common.ServiceDataSync_) {
				dsName := strings.TrimPrefix(srv.Name, common.ServiceGrpcNamespace_+common.ServiceDataSync_)

				log.Logger(context.Background()).Debug("[ClientsPool] Registry action", zap.String("action", result.Action), zap.Any("srv", srv.Name))
				if _, ok := p.sources[dsName]; ok && result.Action == "delete" {
					// Reset list
					p.Lock()
					delete(p.sources, dsName)
					p.Unlock()
				}
				p.LoadDataSources()
			}
		}
	}
}

func (p *ClientsPool) watchConfigChanges() {
	for {
		watcher, err := config.Watch("services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources")
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
				p.LoadDataSources()
			}
		}

		watcher.Stop()

		// Cool-off period
		time.Sleep(1 * time.Second)
	}
}

func (p *ClientsPool) createClientsForDataSource(dataSourceName string, dataSource *object.DataSource) error {

	log.Logger(context.Background()).Debug("Adding dataSource", zap.String("dsname", dataSourceName))
	p.Lock()
	defer p.Unlock()
	loaded, err := NewSource(dataSource)
	if err != nil {
		return err
	}

	p.sources[dataSourceName] = loaded
	return nil
}
