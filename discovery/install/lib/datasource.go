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

package lib

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// actionDatasourceAdd created default datasources at install
func actionDatasourceAdd(c *install.InstallConfig) error {

	var conf *object.DataSource
	var err error
	var storageFolder string
	if c.GetDsType() == "S3" {
		conf, err = addDatasourceS3(c)
	} else {
		conf, err = addDatasourceLocal(c)
	}
	if err != nil {
		return err
	}
	conf.FlatStorage = true
	if os.Getenv("CELLS_DEFAULT_DS_STRUCT") == "true" {
		conf.FlatStorage = false
	}

	// First store minio config
	minioConfig, _ := config.FactorizeMinioServers(map[string]*object.MinioConfig{}, conf, false)
	// Replace ApiSecret with vault Uuid
	keyUuid := uuid.New()
	config.SetSecret(keyUuid, conf.ApiSecret)
	minioConfig.ApiSecret = keyUuid
	conf.ApiSecret = keyUuid
	// Now store in config
	config.Set(minioConfig, "services", fmt.Sprintf(`pydio.grpc.data.objects.%s`, minioConfig.Name))
	config.Set([]string{minioConfig.Name}, "services", "pydio.grpc.data.objects", "sources")

	// Store keys
	sources := []string{conf.Name, "personal", "cellsdata", "versions", "thumbnails"}
	config.Set(sources, "services", "pydio.grpc.data.index", "sources")
	config.Set(sources, "services", "pydio.grpc.data.sync", "sources")
	s3buckets := make(map[string]string, len(sources))
	if conf.StorageType == object.StorageType_LOCAL {
		storageFolder = filepath.Dir(conf.StorageConfiguration[object.StorageKeyFolder])
		s3buckets[conf.Name] = conf.Name
		s3buckets["personal"] = "personal"
		s3buckets["cellsdata"] = "cellsdata"
		s3buckets["versions"] = "versions"
		s3buckets["thumbnails"] = "thumbs"
	} else {
		s3buckets[conf.Name] = c.GetDsS3BucketDefault()
		s3buckets["personal"] = c.GetDsS3BucketPersonal()
		s3buckets["cellsdata"] = c.GetDsS3BucketCells()
		s3buckets["versions"] = c.GetDsS3BucketVersions()
		s3buckets["thumbnails"] = c.GetDsS3BucketThumbs()
	}

	for _, source := range sources {
		// Store indexes tables
		index := fmt.Sprintf(`pydio.grpc.data.index.%s`, source)
		config.Set("default", "services", index, "dsn")
		if conf.PeerAddress != "" {
			config.Set(conf.PeerAddress, "services", index, "PeerAddress")
		}
		tableNames := config.IndexServiceTableNames(source)
		config.Set(tableNames, "services", index, "tables")

		// Clone conf with specific source attributes
		sourceConf := proto.Clone(conf).(*object.DataSource)
		sourceConf.Name = source
		if sourceConf.StorageConfiguration == nil {
			sourceConf.StorageConfiguration = make(map[string]string)
		}
		if source == "versions" || source == "thumbnails" {
			sourceConf.FlatStorage = true
			sourceConf.StorageConfiguration[object.StorageKeyCellsInternal] = "true"
		}
		sourceConf.ObjectsBucket = s3buckets[source]
		if storageFolder != "" {
			sourceConf.StorageConfiguration[object.StorageKeyFolder] = filepath.Join(storageFolder, sourceConf.ObjectsBucket)
		}

		sync := fmt.Sprintf(`pydio.grpc.data.sync.%s`, source)
		config.Set(sourceConf, "services", sync)
	}

	// Set main dsName as default
	if config.Get("defaults", "datasource").String() == "" {
		config.Set(conf.Name, "defaults", "datasource")
	}

	// For S3 Case, technical buckets are generally custom ones
	if conf.StorageType == object.StorageType_S3 {
		config.Set(c.GetDsS3BucketBinaries(), "services", "pydio.docstore-binaries", "bucket")
		config.Set(c.GetDsS3BucketThumbs(), "services", "pydio.thumbs_store", "bucket")
	}
	vStoreConf := map[string]string{
		"datasource": "versions",
		"bucket":     s3buckets["versions"],
	}
	config.Set(vStoreConf, "services", "pydio.versions-store")

	tStoreConf := map[string]string{
		"datasource": "thumbnails",
		"bucket":     s3buckets["thumbnails"],
	}
	config.Set(tStoreConf, "services", "pydio.thumbs_store")

	config.Save("cli", "Install / Setting default DataSources")

	return nil
}

func addDatasourceS3(c *install.InstallConfig) (*object.DataSource, error) {
	port, _ := strconv.ParseInt(c.GetDsPort(), 10, 32)
	conf := &object.DataSource{
		Name:                 c.GetDsName(),
		StorageType:          object.StorageType_S3,
		ApiKey:               c.GetDsS3ApiKey(),
		ApiSecret:            c.GetDsS3ApiSecret(),
		ObjectsPort:          int32(port),
		StorageConfiguration: make(map[string]string),
	}
	if c.GetDsS3Custom() != "" {
		conf.StorageConfiguration[object.StorageKeyCustomEndpoint] = c.GetCleanDsS3Custom()
		if c.GetDsS3CustomRegion() != "" {
			conf.StorageConfiguration[object.StorageKeyCustomRegion] = c.GetDsS3CustomRegion()
		}
		if c.DetectS3CustomMinio() {
			conf.StorageConfiguration[object.StorageKeyMinioServer] = "true"
		}
	}
	return conf, nil
}

func addDatasourceLocal(c *install.InstallConfig) (*object.DataSource, error) {

	conf := &object.DataSource{}
	conf.Name = c.GetDsName()
	conf.StorageType = object.StorageType_LOCAL
	port, _ := strconv.ParseInt(c.GetDsPort(), 10, 32)
	conf.ApiKey = std.Randkey(16)
	conf.ApiSecret = std.Randkey(24)
	conf.ObjectsPort = int32(port)
	conf.Watch = false
	folder := c.DsFolder

	if err := os.MkdirAll(filepath.Join(folder, conf.Name), 0755); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(filepath.Join(folder, "thumbs"), 0755); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(filepath.Join(folder, "versions"), 0755); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(filepath.Join(folder, "binaries"), 0755); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(filepath.Join(folder, "personal"), 0755); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(filepath.Join(folder, "cellsdata"), 0755); err != nil {
		return nil, err
	}

	folder = filepath.Join(folder, conf.Name)
	normalize := "false"
	if runtime.GOOS == "darwin" {
		normalize = "true"
	}
	conf.StorageConfiguration = map[string]string{
		"folder":    folder,
		"normalize": normalize,
	}

	return conf, nil
}
