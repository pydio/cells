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

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/object"
)

func NewDataSourceService(ctx context.Context, dsName string) *DataSourceService {
	var os *object.DataSource
	config.Get(ctx, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+dsName).Scan(&os)
	serv := &DataSourceService{
		data: os,
	}
	return serv
}

type DataSourceService struct {
	data *object.DataSource
}

func (u *DataSourceService) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	case "/object.DataSourceEndpoint/GetDataSourceConfig":
		reply.(*object.GetDataSourceConfigResponse).DataSource = u.data
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}

func (u *DataSourceService) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	return nil, errors.New(method + "  not implemented")
}
