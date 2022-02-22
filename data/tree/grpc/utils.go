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
	"fmt"
	"go.uber.org/zap"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common/client/grpc"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	servicecontext "github.com/pydio/cells/v4/common/service/context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/registry"
)

func updateServicesList(ctx context.Context, treeServer *TreeServer, retry int) {

	treeServer.Lock()
	initialLength := len(treeServer.DataSources)
	treeServer.Unlock()

	reg := servicecontext.GetRegistry(ctx)
	items, err := reg.List(registry.WithType(pb.ItemType_SERVICE), registry.WithFilter(func(item registry.Item) bool {
		return strings.HasPrefix(item.Name(), common.ServiceGrpcNamespace_+common.ServiceDataSync_) && item.Name() != common.ServiceGrpcNamespace_+common.ServiceDataSync_
	}))
	if err != nil {
		return
	}

	var dsKeys []string
	dataSources := make(map[string]DataSource)
	for _, i := range items {
		var syncService registry.Service
		if !i.As(&syncService) {
			continue
		}
		dataSourceName := strings.TrimPrefix(syncService.Name(), common.ServiceGrpcNamespace_+common.ServiceDataSync_)
		indexService := common.ServiceDataIndex_ + dataSourceName
		dataSources[dataSourceName] = DataSource{
			Name:   dataSourceName,
			writer: tree.NewNodeReceiverClient(grpc.GetClientConnFromCtx(ctx, indexService)),
			reader: tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(ctx, indexService)),
		}
		dsKeys = append(dsKeys, dataSourceName)
		log.Logger(ctx).Debug("[Tree:updateServicesList] Add datasource " + dataSourceName)
	}

	treeServer.Lock()
	treeServer.DataSources = dataSources
	treeServer.Unlock()

	// If registry event comes too soon, running services may not be loaded yet
	if retry < 4 && initialLength == len(dataSources) {
		<-time.After(10 * time.Second)
		updateServicesList(ctx, treeServer, retry+1)
	}
	if retry == 5 {
		log.Logger(ctx).Info("Force UpdateServicesList", zap.Strings("datasources", dsKeys))
	}
}

func watchRegistry(ctx context.Context, treeServer *TreeServer) {

	reg := servicecontext.GetRegistry(ctx)

	w, err := reg.Watch(registry.WithType(pb.ItemType_SERVICE))
	if err != nil {
		return
	}

	for {
		r, err := w.Next()
		if err != nil {
			return
		}

		do := false
		// TODO V4 - on DS deletion, event received is UPDATE, but r.Items() is empty
		// Also we could debounce this event
		do = true
		fmt.Println("TreeService, WatchRegistry Action:", r.Action().String(), ", Items: ", len(r.Items()))
		for _, item := range r.Items() {
			var s registry.Service
			if !item.As(&s) {
				continue
			}
			if strings.Contains(s.Name(), common.ServiceDataSync_) {
				do = true
				break
			}
		}
		if do {
			updateServicesList(ctx, treeServer, 0)
		}
	}

}
