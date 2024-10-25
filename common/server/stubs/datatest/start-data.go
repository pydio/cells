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

package datatest

import (
	"context"
	"fmt"
	"strings"

	grpc2 "google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func RegisterDataServices(ctx context.Context, nodes ...*tree.Node) error {

	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		return fmt.Errorf("cannot find registry in context")
	}
	ii, _ := reg.List(registry.WithType(pb.ItemType_SERVICE))
	var treeSvc service.Service
	idxs := map[string]service.Service{}
	for _, item := range ii {
		svc := item.(service.Service)
		var cc grpc2.ClientConnInterface
		var err error
		if item.Name() == common.ServiceDocStoreGRPC {
			cc, err = NewDocStoreService(ctx, svc)
		} else if item.Name() == common.ServiceMetaGRPC {
			cc, err = NewMetaService(ctx, svc, nodes...)
		} else if item.Name() == common.ServiceTreeGRPC {
			treeSvc = svc
		} else if strings.HasPrefix(item.Name(), common.ServiceDataIndexGRPC_) {
			idxs[item.Name()] = svc
		}
		if err != nil {
			return err
		}
		if cc != nil {
			grpc.RegisterMock(item.Name(), cc)
		}
	}
	var dss []string
	for dsName, svc := range idxs {
		idx, e := NewIndexService(ctx, svc)
		if e != nil {
			return e
		}
		grpc.RegisterMock(dsName, idx)
		// Register a pure mock for Sync
		ds := strings.TrimPrefix(dsName, common.ServiceDataIndexGRPC_)
		dss = append(dss, ds)
		dsServ := NewDataSourceService(ctx, ds)
		grpc.RegisterMock(common.ServiceDataSyncGRPC_+ds, dsServ)
	}

	if treeSvc != nil {
		ts, e := NewTreeService(ctx, treeSvc, dss, nodes...)
		if e != nil {
			return e
		}
		grpc.RegisterMock(common.ServiceTreeGRPC, ts)
	}

	return nil
}
