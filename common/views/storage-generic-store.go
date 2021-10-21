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

package views

import (
	"context"

	"github.com/micro/go-micro/client"
	"github.com/pydio/minio-go"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/x/configx"
)

// GetGenericStoreClient creates a *minio.Core client for a given binary store.
func GetGenericStoreClient(ctx context.Context, storeNamespace string, microClient client.Client) (client *minio.Core, bucket string, e error) {

	var dataSource string
	var err error
	dataSource, bucket, err = GetGenericStoreClientConfig(storeNamespace)
	if err != nil {
		return nil, "", err
	}

	s3endpointClient := object.NewDataSourceEndpointClient(common.ServiceGrpcNamespace_+common.ServiceDataSync_+dataSource, microClient)
	response, err := s3endpointClient.GetDataSourceConfig(ctx, &object.GetDataSourceConfigRequest{})
	if err != nil {
		return nil, "", err
	}

	source := response.DataSource

	client, err = source.CreateClient()
	return client, bucket, err

}

// GetGenericStoreClientConfig finds datasource/bucket for a given store.
func GetGenericStoreClientConfig(storeNamespace string) (dataSource string, bucket string, e error) {

	// TMP - TO BE FIXED
	var configKey string
	switch storeNamespace {
	case common.PydioDocstoreBinariesNamespace:
		configKey = "pydio.docstore-binaries"
		break
	case common.PydioThumbstoreNamespace:
		configKey = "pydio.thumbs_store"
		break
	default:
		configKey = "pydio." + storeNamespace
		break
	}

	c := config.Get("services", configKey)

	dataSource = c.Val("datasource").Default(configx.Reference("#/defaults/datasource")).String()
	bucket = c.Val("bucket").String()

	return dataSource, bucket, nil
}
