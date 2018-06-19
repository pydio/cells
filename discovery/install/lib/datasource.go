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

	"github.com/dchest/uniuri"
	"github.com/gogo/protobuf/proto"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/utils"
)

// DATASOURCE Action
func actionDatasourceAdd(c *install.InstallConfig) error {

	conf, err := addDatasourceLocal(c)
	if err != nil {
		return err
	}

	// First store minio config
	minioConfig := utils.FactorizeMinioServers(map[string]*object.MinioConfig{}, conf)
	config.Set(minioConfig, "services", fmt.Sprintf(`pydio.grpc.data.objects.%s`, minioConfig.Name))
	config.Set([]string{minioConfig.Name}, "services", "pydio.grpc.data.objects", "sources")

	// Store keys
	sources := []string{conf.Name, "personal", "cellsdata"}
	config.Set(sources, "services", "pydio.grpc.data.index", "sources")
	config.Set(sources, "services", "pydio.grpc.data.sync", "sources")
	storageFolder := filepath.Dir(conf.StorageConfiguration["folder"])

	for _, source := range sources {
		// Store indexes tables
		index := fmt.Sprintf(`pydio.grpc.data.index.%s`, source)
		config.Set("default", "services", index, "dsn")
		config.Set(conf.PeerAddress, "services", index, "PeerAddress")
		tableNames := utils.IndexServiceTableNames(source)
		config.Set(tableNames, "services", index, "tables")
		// Clone conf with specific source attributes
		sourceConf := proto.Clone(conf).(*object.DataSource)
		sourceConf.Name = source
		sourceConf.ObjectsBucket = source
		sourceConf.VersioningPolicyName = "default-policy"
		sourceConf.StorageConfiguration["folder"] = filepath.Join(storageFolder, source)
		config.Set(sourceConf, "services", fmt.Sprintf(`pydio.grpc.data.sync.%s`, source))
	}

	// Set main dsName as default
	if config.Get("defaults", "datasource").String("") == "" {
		config.Set(conf.Name, "defaults", "datasource")
	}

	config.Save("cli", "Install / Setting default DataSources")

	return nil
}

func addDatasourceLocal(c *install.InstallConfig) (*object.DataSource, error) {

	conf := &object.DataSource{}
	conf.Name = c.GetDsName()
	conf.StorageType = object.StorageType_LOCAL
	port, _ := strconv.ParseInt(c.GetDsPort(), 10, 32)
	conf.ApiKey = uniuri.New()
	conf.ApiSecret = uniuri.NewLen(24)
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
	ip, _ := utils.GetExternalIP()
	conf.PeerAddress = ip.String()
	conf.StorageConfiguration = map[string]string{
		"folder":    folder,
		"normalize": normalize,
	}

	return conf, nil
}

func validateDir(val interface{}) error {
	if path, ok := val.(string); ok {
		if err := os.MkdirAll(path, 0755); err != nil {
			return fmt.Errorf("Cannot access dir")
		}
	}

	return nil
}
