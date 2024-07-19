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

package migrations

import (
	"context"
	"fmt"
	"path"

	version "github.com/hashicorp/go-version"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	v, _ := version.NewVersion("2.2.99")
	add(v, getMigration(updateVersionsStore))
	add(v, getMigration(updateThumbsStore))
}

func updateVersionsStore(conf configx.Values) error {

	// TODO NIL CONTEXT
	var ctx context.Context

	c := conf.Val("services", "pydio.versions-store")
	dsName := c.Val("datasource").Default(configx.Reference("#/defaults/datasource")).String()
	bucket := c.Val("bucket").Default("versions").String()

	// Create a new "internal" datasource
	crtSources := config.ListSourcesFromConfig(ctx)
	dsObject, ok := crtSources[dsName]
	if !ok {
		return fmt.Errorf("cannot find versions-store datasource")
	}
	var newDsName = "versions"
	if _, exists := config.ListSourcesFromConfig(ctx)[newDsName]; exists {
		newDsName = "versions" + uuid.New()[0:6]
	}
	dsCopy := proto.Clone(dsObject).(*object.DataSource)
	dsCopy.Name = newDsName
	dsCopy.ObjectsBucket = bucket
	dsCopy.FlatStorage = true
	dsCopy.StorageConfiguration[object.StorageKeyCellsInternal] = "true"
	dsCopy.StorageConfiguration[object.StorageKeyInitFromBucket] = "true"
	dsCopy.StorageConfiguration[object.StorageKeyNormalize] = "false"
	dsCopy.VersioningPolicyName = ""
	dsCopy.EncryptionKey = ""
	if f, o := dsObject.StorageConfiguration[object.StorageKeyFolder]; o {
		dsCopy.StorageConfiguration[object.StorageKeyFolder] = path.Join(path.Dir(f), bucket)
	}
	conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+newDsName).Set(dsCopy)
	conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataIndex_+newDsName).Set(map[string]interface{}{
		"dsn":    "default",
		"tables": config.IndexServiceTableNames(newDsName),
	})
	// Reset sync > sources
	syncSrcVal := conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources")
	indexSrcVal := conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataIndex, "sources")
	indexSlice := indexSrcVal.StringArray()
	syncSlice := syncSrcVal.StringArray()
	syncSlice = append(syncSlice, newDsName)
	indexSlice = append(indexSlice, newDsName)
	syncSrcVal.Set(syncSlice)
	indexSrcVal.Set(indexSlice)

	// Finally update pydio.versions-store/datasource value
	c.Val("datasource").Set(newDsName)

	return nil
}

func updateThumbsStore(conf configx.Values) error {

	// TODO NIL CONTEXT
	var ctx context.Context

	c := conf.Val("services", "pydio.thumbs_store")
	dsName := c.Val("datasource").Default(configx.Reference("#/defaults/datasource")).String()
	bucket := c.Val("bucket").Default("thumbs").String()

	// Create a new "internal" datasource
	crtSources := config.ListSourcesFromConfig(ctx)
	dsObject, ok := crtSources[dsName]
	if !ok {
		return fmt.Errorf("cannot find thumbs_store datasource")
	}
	var newDsName = "thumbnails"
	if _, exists := config.ListSourcesFromConfig(ctx)[newDsName]; exists {
		newDsName = "thumbnails" + uuid.New()[0:6]
	}
	dsCopy := proto.Clone(dsObject).(*object.DataSource)
	dsCopy.Name = newDsName
	dsCopy.ObjectsBucket = bucket
	dsCopy.FlatStorage = true
	dsCopy.StorageConfiguration[object.StorageKeyCellsInternal] = "true"
	dsCopy.StorageConfiguration[object.StorageKeyInitFromBucket] = "true"
	dsCopy.StorageConfiguration[object.StorageKeyNormalize] = "false"
	dsCopy.VersioningPolicyName = ""
	dsCopy.EncryptionKey = ""
	if f, o := dsObject.StorageConfiguration[object.StorageKeyFolder]; o {
		dsCopy.StorageConfiguration[object.StorageKeyFolder] = path.Join(path.Dir(f), bucket)
	}
	conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+newDsName).Set(dsCopy)
	conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataIndex_+newDsName).Set(map[string]interface{}{
		"dsn":    "default",
		"tables": config.IndexServiceTableNames(newDsName),
	})
	// Reset sync > sources
	syncSrcVal := conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources")
	indexSrcVal := conf.Val("services", common.ServiceGrpcNamespace_+common.ServiceDataIndex, "sources")
	indexSlice := indexSrcVal.StringArray()
	syncSlice := syncSrcVal.StringArray()
	syncSlice = append(syncSlice, newDsName)
	indexSlice = append(indexSlice, newDsName)
	syncSrcVal.Set(syncSlice)
	indexSrcVal.Set(indexSlice)

	// Finally update pydio.thumbs_store/datasource value
	c.Val("datasource").Set(newDsName)

	return nil
}
