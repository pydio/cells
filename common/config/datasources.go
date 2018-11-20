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

package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dchest/uniuri"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/object"
)

// ListMinioConfigsFromConfig scans configs for objects services configs
func ListMinioConfigsFromConfig() map[string]*object.MinioConfig {
	res := make(map[string]*object.MinioConfig)

	var cfgMap Map
	if err := Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS).Scan(&cfgMap); err != nil {
		return res
	}
	names := cfgMap.StringArray("sources")
	for _, name := range names {
		var conf *object.MinioConfig
		if e := Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS_+name).Scan(&conf); e == nil {
			res[name] = conf
		}
	}
	return res
}

// ListSourcesFromConfig scans configs for sync services configs
func ListSourcesFromConfig() map[string]*object.DataSource {
	res := make(map[string]*object.DataSource)

	var cfgMap Map
	if err := Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC).Scan(&cfgMap); err != nil {
		return res
	}
	names := cfgMap.StringArray("sources")
	for _, name := range names {
		var conf *object.DataSource
		if e := Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_+name).Scan(&conf); e == nil {
			res[name] = conf
		}
	}
	return res
}

func SourceNamesToConfig(sources map[string]*object.DataSource) {
	var sourcesJsonKey []string
	for name, _ := range sources {
		sourcesJsonKey = append(sourcesJsonKey, name)
	}
	marsh, _ := json.Marshal(sourcesJsonKey)
	Set(string(marsh), "services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC, "sources")
	Set(string(marsh), "services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_INDEX, "sources")
}

func MinioConfigNamesToConfig(sources map[string]*object.MinioConfig) {
	var sourcesJsonKey []string
	for name, _ := range sources {
		sourcesJsonKey = append(sourcesJsonKey, name)
	}
	marsh, _ := json.Marshal(sourcesJsonKey)
	Set(string(marsh), "services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS, "sources")
}

func IndexServiceTableNames(dsName string) map[string]string {
	dsName = strings.Replace(dsName, "-", "_", -1)
	if len(dsName) > 51 {
		dsName = dsName[0:50] // table names must be limited
	}
	return map[string]string{
		"commits": "data_" + dsName + "_commits",
		"nodes":   "data_" + dsName + "_nodes",
		"tree":    "data_" + dsName + "_tree",
	}
}

// UnusedMinioServers searches for existing minio configs that are not used anywhere in datasources
func UnusedMinioServers(minios map[string]*object.MinioConfig, sources map[string]*object.DataSource) string {

	for name, _ := range minios {
		used := false
		for _, source := range sources {
			if source.ObjectsServiceName == name {
				used = true
			}
		}
		if !used {
			return name
		}
	}
	return ""
}

func ValidateDataSourceConfig(newSource *object.DataSource) error {
	if newSource.StorageType == object.StorageType_LOCAL {
		folder := newSource.StorageConfiguration["folder"]
		_, e := os.Stat(folder)
		if e != nil && os.IsNotExist(e) {
			return e
		}
		parentName := filepath.Dir(folder)
		if strings.Trim(parentName, "/") == "" {
			return fmt.Errorf("Please use at least a two-levels deep folder")
		}
		// Try to write a tmp file and remove it
		touch := filepath.Join(parentName, uuid.New())
		if _, e := os.OpenFile(touch, os.O_RDONLY|os.O_CREATE, 0666); e != nil {
			return fmt.Errorf("Please make sure that parent folder is writeable by the application")
		} else {
			os.Remove(touch)
		}
	}
	return nil
}

// FactorizeMinioServers tries to find exisiting MinioConfig that can be directly reused by the new source, or creates a new one
func FactorizeMinioServers(existingConfigs map[string]*object.MinioConfig, newSource *object.DataSource) (config *object.MinioConfig) {

	if newSource.StorageType == object.StorageType_S3 {
		if gateway := filterGatewaysWithKeys(existingConfigs, newSource.StorageType, newSource.ApiKey, newSource.StorageConfiguration["customEndpoint"]); gateway != nil {
			config = gateway
			newSource.ApiKey = config.ApiKey
			newSource.ApiSecret = config.ApiSecret
		} else {
			config = &object.MinioConfig{
				Name:        createConfigName(existingConfigs, object.StorageType_S3),
				StorageType: object.StorageType_S3,
				ApiKey:      newSource.ApiKey,
				ApiSecret:   newSource.ApiSecret,
				RunningPort: createConfigPort(existingConfigs, newSource.ObjectsPort),
				EndpointUrl: newSource.StorageConfiguration["customEndpoint"],
			}
		}
	} else if newSource.StorageType == object.StorageType_AZURE {
		if gateway := filterGatewaysWithKeys(existingConfigs, newSource.StorageType, newSource.ApiKey, ""); gateway != nil {
			config = gateway
			newSource.ApiKey = config.ApiKey
			newSource.ApiSecret = config.ApiSecret
		} else {
			config = &object.MinioConfig{
				Name:        createConfigName(existingConfigs, object.StorageType_AZURE),
				StorageType: object.StorageType_AZURE,
				ApiKey:      newSource.ApiKey,
				ApiSecret:   newSource.ApiSecret,
				RunningPort: createConfigPort(existingConfigs, newSource.ObjectsPort),
			}
		}
	} else if newSource.StorageType == object.StorageType_GCS {
		creds := newSource.StorageConfiguration["jsonCredentials"]
		if gateway := filterGatewaysWithStorageConfigKey(existingConfigs, newSource.StorageType, "jsonCredentials", creds); gateway != nil {
			config = gateway
			newSource.ApiKey = config.ApiKey
			newSource.ApiSecret = config.ApiSecret
		} else {
			if newSource.ApiKey == "" {
				newSource.ApiKey = uniuri.New()
				newSource.ApiSecret = uniuri.NewLen(24)
			}
			// Replace credentials by a secret Key
			secretId := NewKeyForSecret()
			SetSecret(secretId, creds)
			newSource.StorageConfiguration["jsonCredentials"] = secretId
			config = &object.MinioConfig{
				Name:                 createConfigName(existingConfigs, object.StorageType_GCS),
				StorageType:          object.StorageType_GCS,
				ApiKey:               newSource.ApiKey,
				ApiSecret:            newSource.ApiSecret,
				RunningPort:          createConfigPort(existingConfigs, newSource.ObjectsPort),
				GatewayConfiguration: map[string]string{"jsonCredentials": secretId},
			}
		}
	} else {
		base, bucket := filepath.Split(newSource.StorageConfiguration["folder"])
		peerAddress := newSource.PeerAddress
		base = strings.TrimRight(base, "/")
		if minioConfig := filterMiniosWithBaseFolder(existingConfigs, peerAddress, base); minioConfig != nil {
			config = minioConfig
			newSource.ApiKey = config.ApiKey
			newSource.ApiSecret = config.ApiSecret
		} else {
			if newSource.ApiKey == "" {
				newSource.ApiKey = uniuri.New()
				newSource.ApiSecret = uniuri.NewLen(24)
			}
			config = &object.MinioConfig{
				Name:        createConfigName(existingConfigs, object.StorageType_LOCAL),
				StorageType: object.StorageType_LOCAL,
				ApiKey:      newSource.ApiKey,
				ApiSecret:   newSource.ApiSecret,
				LocalFolder: base,
				RunningPort: createConfigPort(existingConfigs, newSource.ObjectsPort),
				PeerAddress: peerAddress,
			}
		}
		newSource.ObjectsBucket = bucket
	}

	newSource.ObjectsServiceName = config.Name
	return config
}

// createConfigName creates a new name for a minio config (local or gateway suffixed with an index)
func createConfigName(existingConfigs map[string]*object.MinioConfig, storageType object.StorageType) string {
	base := "gateway"
	if storageType == object.StorageType_LOCAL {
		base = "local"
	}
	index := 1
	label := fmt.Sprintf("%s%d", base, index)
	for {
		if _, ok := existingConfigs[label]; ok {
			index++
			label = fmt.Sprintf("%s%d", base, index)
		} else {
			break
		}
	}
	return label
}

// createConfigPort set up a port that is not already used by other configs
func createConfigPort(existingConfigs map[string]*object.MinioConfig, passedPort int32) int32 {
	port := int32(9001)
	if passedPort != 0 {
		port = passedPort
	}
	exists := func(p int32, configs map[string]*object.MinioConfig) bool {
		for _, c := range configs {
			if c.RunningPort == p {
				return true
			}
		}
		return false
	}
	for exists(port, existingConfigs) {
		port++
	}
	return port
}

// filterGatewaysWithKeys finds gateways configs that share the same ApiKey
func filterGatewaysWithKeys(configs map[string]*object.MinioConfig, storageType object.StorageType, apiKey string, endpointUrl string) *object.MinioConfig {

	for _, source := range configs {
		if source.StorageType == storageType && source.ApiKey == apiKey && source.EndpointUrl == endpointUrl {
			return source
		}
	}
	return nil

}

func filterGatewaysWithStorageConfigKey(configs map[string]*object.MinioConfig, storageType object.StorageType, configKey string, configValue string) *object.MinioConfig {

	for _, source := range configs {
		if source.StorageType == storageType {
			if source.GatewayConfiguration != nil {
				if v, ok := source.GatewayConfiguration[configKey]; ok && v == configValue {
					return source
				}
			}
		}
	}
	return nil

}

// filterGatewaysWithKeys finds local folder configs that share the same base folder
func filterMiniosWithBaseFolder(configs map[string]*object.MinioConfig, peerAddress string, folder string) *object.MinioConfig {

	for _, source := range configs {
		if source.StorageType == object.StorageType_LOCAL && source.PeerAddress == peerAddress && source.LocalFolder == folder {
			return source
		}
	}
	return nil

}
