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

package grpc

import (
	"context"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
)

func updateServicesList(ctx context.Context, treeServer *TreeServer, retry int) {

	treeServer.Lock()
	initialLength := len(treeServer.DataSources)
	treeServer.Unlock()

	otherServices, err := registry.ListRunningServices()
	if err != nil {
		return
	}

	syncServices := filterServices(otherServices, func(v string) bool {
		return strings.Contains(v, common.ServiceGrpcNamespace_+common.ServiceDataSync_)
	})

	dataSources := make(map[string]DataSource, len(syncServices))

	for _, syncService := range syncServices {
		dataSourceName := strings.TrimPrefix(syncService, common.ServiceGrpcNamespace_+common.ServiceDataSync_)

		if dataSourceName == "" {
			continue
		}
		indexService := common.ServiceGrpcNamespace_ + common.ServiceDataIndex_ + dataSourceName

		ds := DataSource{
			Name:   dataSourceName,
			writer: tree.NewNodeReceiverClient(indexService, defaults.NewClient()),
			reader: tree.NewNodeProviderClient(indexService, defaults.NewClient()),
		}

		dataSources[dataSourceName] = ds
		log.Logger(ctx).Debug("[Tree:updateServicesList] Add datasource " + dataSourceName)
	}

	treeServer.Lock()
	treeServer.DataSources = dataSources
	treeServer.Unlock()

	// If registry event comes too soon, running services may not be loaded yet
	if retry < 2 && initialLength == len(dataSources) {
		<-time.After(2 * time.Second)
		updateServicesList(ctx, treeServer, retry+1)
	}
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

func watchRegistry(ctx context.Context, treeServer *TreeServer) {

	watcher, err := registry.Watch()
	if err != nil {
		return
	}
	for {
		result, err := watcher.Next()
		if result != nil && err == nil {
			srv := result.Service
			if strings.Contains(srv.Name, common.ServiceDataSync_) {
				updateServicesList(ctx, treeServer, 0)
			}
		} else if err != nil {
			log.Logger(ctx).Error("Registry Watcher Error", zap.Error(err))
		}
	}
}
