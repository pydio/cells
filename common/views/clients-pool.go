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
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	config2 "github.com/pydio/go-os/config"
)

var (
	clientWithRetriesOnce = &sync.Once{}
)

type sourceAlias struct {
	dataSource string
	bucket     string
}

// ClientsPool is responsible for discovering available datasources and
// keeping an up to date registry that is used by the routers.
type ClientsPool struct {
	Sources map[string]LoadedSource
	aliases map[string]sourceAlias

	// Statically set for testing
	TreeClient      tree.NodeProviderClient
	TreeClientWrite tree.NodeReceiverClient

	genericClient client.Client
	configMutex   *sync.Mutex
	watcher       registry.Watcher
	confWatcher   config2.Watcher
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
func NewClientsPool(watchRegistry bool) (pool *ClientsPool) {

	pool = &ClientsPool{
		Sources: make(map[string]LoadedSource),
		aliases: make(map[string]sourceAlias),
	}

	pool.configMutex = &sync.Mutex{}

	if IsUnitTestEnv {
		// Workaround the fact that no registry is present when doing unit tests
		return pool
	}

	pool.listDatasources()
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

func (p *ClientsPool) GetTreeClient() tree.NodeProviderClient {
	if p.TreeClient != nil {
		return p.TreeClient
	}
	return tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())
}

func (p *ClientsPool) GetTreeClientWrite() tree.NodeReceiverClient {
	if p.TreeClientWrite != nil {
		return p.TreeClientWrite
	}
	return tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())
}

func (p *ClientsPool) GetDataSourceInfo(dsName string, retries ...int) (LoadedSource, error) {

	if dsName == "default" {
		dsName = config.Get("defaults", "datasource").String("default")
	}

	if cl, ok := p.Sources[dsName]; ok {

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

		log.Logger(context.Background()).Info(fmt.Sprintf("[ClientsPool] cannot find datasource, retrying in %ds...", delay), zap.String("ds", dsName), zap.Any("retries", retry))

		<-time.After(time.Duration(delay) * time.Second)
		p.listDatasources()
		return p.GetDataSourceInfo(dsName, retry+1)

	} else {

		e := fmt.Errorf("Could not find DataSource " + dsName)
		var keys []string
		for k, _ := range p.Sources {
			keys = append(keys, k)
		}
		log.Logger(context.Background()).Error(e.Error(), zap.Strings("currentSources", keys))
		return LoadedSource{}, e

	}

}

func (p *ClientsPool) listDatasources() {

	if IsUnitTestEnv {
		// Workaround the fact that no registry is present when doing unit tests
		return
	}

	otherServices, err := registry.ListRunningServices()
	if err != nil {
		return
	}

	indexServices := filterServices(otherServices, func(v string) bool {
		return strings.Contains(v, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_)
	})

	cli := defaults.NewClient()
	clientWithRetriesOnce.Do(func() {
		cli = defaults.NewClient(
			client.Retries(3),
			// client.RequestTimeout(1*time.Second),
		)
	})

	ctx := context.Background()
	for _, indexService := range indexServices {
		dataSourceName := strings.TrimPrefix(indexService, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_)
		if dataSourceName == "" {
			continue
		}
		s3endpointClient := object.NewDataSourceEndpointClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_+dataSourceName, cli)
		response, err := s3endpointClient.GetDataSourceConfig(ctx, &object.GetDataSourceConfigRequest{})
		if err == nil && response.DataSource != nil {
			log.Logger(ctx).Debug("Creating client for datasource " + dataSourceName)
			p.createClientsForDataSource(dataSourceName, response.DataSource)
		} else {
			log.Logger(context.Background()).Debug("no answer from endpoint, maybe not ready yet? "+common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_+dataSourceName, zap.Any("r", response), zap.Error(err))
		}
	}

	p.registerAlternativeClient(common.PYDIO_THUMBSTORE_NAMESPACE)
	p.registerAlternativeClient(common.PYDIO_DOCSTORE_BINARIES_NAMESPACE)
	p.registerAlternativeClient(common.PYDIO_VERSIONS_NAMESPACE)
}

func (p *ClientsPool) registerAlternativeClient(namespace string) error {
	dataSource, bucket, err := GetGenericStoreClientConfig(namespace)
	if err != nil {
		return err
	}
	p.configMutex.Lock()
	defer p.configMutex.Unlock()
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
			if strings.Contains(srv.Name(), common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_) {
				dsName := strings.TrimPrefix(srv.Name(), common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_)

				log.Logger(context.Background()).Debug("[ClientsPool] Registry action", zap.String("action", result.Action), zap.Any("srv", srv.Name()))
				if _, ok := p.Sources[dsName]; ok && result.Action == "stopped" {
					// Reset list
					p.configMutex.Lock()
					delete(p.Sources, dsName)
					p.configMutex.Unlock()
				}
				p.listDatasources()
			}
		}
	}
}

func (p *ClientsPool) watchConfigChanges() {

	watcher, err := config.Default().Watch("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC, "sources")
	if err != nil {
		return
	}
	p.confWatcher = watcher
	for {
		event, err := watcher.Next()
		if event != nil && err == nil {
			p.listDatasources()
		}
	}

}

func (p *ClientsPool) createClientsForDataSource(dataSourceName string, dataSource *object.DataSource, registerKey ...string) error {

	log.Logger(context.Background()).Debug("Adding dataSource", zap.String("dsname", dataSourceName))
	p.configMutex.Lock()
	defer p.configMutex.Unlock()
	loaded, err := NewSource(dataSource)
	if err != nil {
		return err
	}

	p.Sources[dataSourceName] = loaded
	return nil
}

func filterServices(vs []registry.Service, f func(string) bool) []string {
	vsf := make([]string, 0)
	for _, v := range vs {
		if f(v.Name()) {
			vsf = append(vsf, v.Name())
		}
	}
	return vsf
}
