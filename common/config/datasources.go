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

package config

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/net"
	standard "github.com/pydio/cells/v4/common/utils/std"
)

var (
	sourcesTimestampPrefix = "updated:"
)

// ListMinioConfigsFromConfig scans configs for objects services configs
func ListMinioConfigsFromConfig(ctx context.Context, skipSecret ...bool) map[string]*object.MinioConfig {
	res := make(map[string]*object.MinioConfig)

	names := SourceNamesForDataServices(ctx, common.ServiceDataObjects)
	for _, name := range names {
		var conf *object.MinioConfig
		if e := Get(ctx, configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects_+name)).Scan(&conf); e == nil && conf != nil {
			res[name] = conf
			if len(skipSecret) == 0 || !skipSecret[0] {
				// Replace ApiSecret with value from vault
				if sec := GetSecret(ctx, conf.ApiSecret).String(); sec != "" {
					conf.ApiSecret = sec
				}
			}
		}
	}
	return res
}

// ListSourcesFromConfig scans configs for sync services configs
func ListSourcesFromConfig(ctx context.Context) map[string]*object.DataSource {
	res := make(map[string]*object.DataSource)
	names := SourceNamesForDataServices(ctx, common.ServiceDataSync)
	for _, name := range names {
		if conf, e := GetSourceInfoByName(ctx, name); e == nil {
			res[name] = conf
		}
	}
	return res
}

func GetSourceInfoByName(ctx context.Context, dsName string) (*object.DataSource, error) {
	var conf *object.DataSource
	c := Get(ctx, configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+dsName))
	if e := c.Scan(&conf); e == nil {
		if conf == nil {
			return nil, fmt.Errorf("cannot load source by name " + dsName)
		}
		return conf, nil
	} else {
		return nil, e
	}
}

// SourceNamesForDataServices list sourceNames from the config, excluding the timestamp key
func SourceNamesForDataServices(ctx context.Context, dataSrvType string) []string {
	return SourceNamesFromDataConfigs(Get(ctx, configx.FormatPath("services", common.ServiceGrpcNamespace_+dataSrvType)))
}

// SourceNamesFromDataConfigs list sourceNames from the config, excluding the timestamp key
func SourceNamesFromDataConfigs(values configx.Values) []string {
	names := values.Val("sources").StringArray()
	return SourceNamesFiltered(names)
}

// SourceNamesFiltered excludes the timestamp key from a slice of source names
func SourceNamesFiltered(names []string) []string {
	var res []string
	for _, name := range names {
		if !strings.HasPrefix(name, sourcesTimestampPrefix) {
			res = append(res, name)
		}
	}
	return res
}

// SourceNamesToConfig saves index and sync sources to configs
func SourceNamesToConfig(ctx context.Context, sources map[string]*object.DataSource) {
	var sourcesJsonKey []string
	for name := range sources {
		sourcesJsonKey = append(sourcesJsonKey, name)
	}
	// Append a timestamped value to make sure it modifies the sources and triggers a config.Watch() event
	sourcesJsonKey = append(sourcesJsonKey, fmt.Sprintf("%s%v", sourcesTimestampPrefix, time.Now().Unix()))
	Set(ctx, sourcesJsonKey, configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataSync, "sources"))
	Set(ctx, sourcesJsonKey, configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataIndex, "sources"))
}

// TouchSourceNamesForDataServices update the timestamp set with the source list
func TouchSourceNamesForDataServices(ctx context.Context, dataSrvType string) {
	sources := SourceNamesForDataServices(ctx, dataSrvType)
	sources = append(sources, fmt.Sprintf("%s%v", sourcesTimestampPrefix, time.Now().Unix()))
	Set(ctx, sources, configx.FormatPath("services", common.ServiceGrpcNamespace_+dataSrvType, "sources"))
	Save(ctx, common.PydioSystemUsername, "Touch sources update date for "+dataSrvType)
}

// MinioConfigNamesToConfig saves objects sources to config
func MinioConfigNamesToConfig(ctx context.Context, sources map[string]*object.MinioConfig) {
	var sourcesJSONKey []string
	for name := range sources {
		sourcesJSONKey = append(sourcesJSONKey, name)
	}
	// Append a timestamped value to make sure it modifies the sources and triggers a config.Watch() event
	sourcesJSONKey = append(sourcesJSONKey, fmt.Sprintf("%s%v", sourcesTimestampPrefix, time.Now().Unix()))
	Set(ctx, sourcesJSONKey, configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects, "sources"))
}

// IndexServiceTableNames returns table names for indexes
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
func UnusedMinioServers(minios map[string]*object.MinioConfig, sources map[string]*object.DataSource) []string {
	var unused []string
	for name := range minios {
		used := false
		for _, source := range sources {
			if source.ObjectsServiceName == name {
				used = true
			}
		}
		if !used {
			unused = append(unused, name)
		}
	}
	return unused
}

// FactorizeMinioServers tries to find exisiting MinioConfig that can be directly reused by the new source, or creates a new one
func FactorizeMinioServers(ctx context.Context, existingConfigs map[string]*object.MinioConfig, newSource *object.DataSource, update bool) (config *object.MinioConfig, e error) {

	if newSource.StorageType == object.StorageType_S3 {
		if gateway := filterGatewaysWithKeys(existingConfigs, newSource.StorageType, newSource.ApiKey, newSource.StorageConfiguration[object.StorageKeyCustomEndpoint]); gateway != nil {
			config = gateway
			newSource.ApiKey = config.ApiKey

			// If it's an update then we want to change the config secret
			if !update {
				newSource.ApiSecret = config.ApiSecret
			} else {
				// We may have to update signature version
				if sv, o := newSource.StorageConfiguration[object.StorageKeySignatureVersion]; o {
					if config.GatewayConfiguration == nil {
						config.GatewayConfiguration = make(map[string]string, 1)
					}
					config.GatewayConfiguration[object.StorageKeySignatureVersion] = sv
				}
			}
		} else if update {
			// Update existing config
			config = existingConfigs[newSource.ObjectsServiceName]
			config.ApiKey = newSource.ApiKey
			config.ApiSecret = newSource.ApiSecret
			config.EndpointUrl = newSource.StorageConfiguration[object.StorageKeyCustomEndpoint]
			if sv, o := newSource.StorageConfiguration[object.StorageKeySignatureVersion]; o {
				if config.GatewayConfiguration == nil {
					config.GatewayConfiguration = make(map[string]string, 1)
				}
				config.GatewayConfiguration[object.StorageKeySignatureVersion] = sv
			}
		} else {
			config = &object.MinioConfig{
				Name:        createConfigName(existingConfigs, object.StorageType_S3),
				StorageType: object.StorageType_S3,
				ApiKey:      newSource.ApiKey,
				ApiSecret:   newSource.ApiSecret,
				RunningPort: createConfigPort(existingConfigs, newSource.ObjectsPort),
				EndpointUrl: newSource.StorageConfiguration[object.StorageKeyCustomEndpoint],
			}
			if sv, o := newSource.StorageConfiguration[object.StorageKeySignatureVersion]; o {
				config.GatewayConfiguration = map[string]string{
					object.StorageKeySignatureVersion: sv,
				}
			}
		}
	} else if newSource.StorageType == object.StorageType_AZURE {
		if gateway := filterGatewaysWithKeys(existingConfigs, newSource.StorageType, newSource.ApiKey, ""); gateway != nil {
			config = gateway
			newSource.ApiKey = config.ApiKey

			// If it's an update then we want to change the config secret
			if !update {
				newSource.ApiSecret = config.ApiSecret
			}
		} else if update {
			// Update existing config
			config = existingConfigs[newSource.ObjectsServiceName]
			config.ApiKey = newSource.ApiKey
			config.ApiSecret = newSource.ApiSecret
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
		creds := newSource.StorageConfiguration[object.StorageKeyJsonCredentials]
		if gateway := filterGatewaysWithStorageConfigKey(existingConfigs, newSource.StorageType, object.StorageKeyJsonCredentials, creds); gateway != nil {
			config = gateway
			newSource.ApiKey = config.ApiKey

			// If it's an update then we want to change the config secret
			if !update {
				newSource.ApiSecret = config.ApiSecret
			}
		} else if update {
			config = existingConfigs[newSource.ObjectsServiceName]
			updateCredsSecret := true
			var crtSecretId string
			if config.GatewayConfiguration != nil {
				var ok bool
				if crtSecretId, ok = config.GatewayConfiguration["jsonCredentials"]; ok {
					if crtSecretId == creds {
						updateCredsSecret = false
					}
				}
			}
			if updateCredsSecret {
				if crtSecretId != "" {
					_ = DelSecret(ctx, crtSecretId)
				}
				secretId := NewKeyForSecret()
				if er := SetSecret(ctx, secretId, creds); er != nil {
					return nil, fmt.Errorf("error while saving secret key %w", er)
				}
				config.GatewayConfiguration = map[string]string{object.StorageKeyJsonCredentials: secretId}
				newSource.StorageConfiguration[object.StorageKeyJsonCredentials] = secretId
			}

		} else {
			if newSource.ApiKey == "" {
				newSource.ApiKey = standard.Randkey(16)
				newSource.ApiSecret = standard.Randkey(24)
			}
			// Replace credentials by a secret Key
			secretId := NewKeyForSecret()
			if er := SetSecret(ctx, secretId, creds); er != nil {
				return nil, fmt.Errorf("error while saving secrte key %w", er)
			}
			newSource.StorageConfiguration[object.StorageKeyJsonCredentials] = secretId
			config = &object.MinioConfig{
				Name:                 createConfigName(existingConfigs, object.StorageType_GCS),
				StorageType:          object.StorageType_GCS,
				ApiKey:               newSource.ApiKey,
				ApiSecret:            newSource.ApiSecret,
				RunningPort:          createConfigPort(existingConfigs, newSource.ObjectsPort),
				GatewayConfiguration: map[string]string{object.StorageKeyJsonCredentials: secretId},
			}
		}
	} else {
		dsDir, bucket := filepath.Split(newSource.StorageConfiguration[object.StorageKeyFolder])
		peerAddress := newSource.PeerAddress
		dsDir = strings.TrimRight(dsDir, "/")
		if minioConfig, e := filterMiniosWithBaseFolder(existingConfigs, peerAddress, dsDir); e != nil {
			return nil, e
		} else if minioConfig != nil {
			config = minioConfig
			newSource.ApiKey = config.ApiKey
			newSource.ApiSecret = config.ApiSecret
		} else if update {
			config = existingConfigs[newSource.ObjectsServiceName]
			config.LocalFolder = dsDir
			config.PeerAddress = peerAddress
		} else {
			if newSource.ApiKey == "" {
				newSource.ApiKey = standard.Randkey(16)
				newSource.ApiSecret = standard.Randkey(24)
			}
			config = &object.MinioConfig{
				Name:        createConfigName(existingConfigs, object.StorageType_LOCAL),
				StorageType: object.StorageType_LOCAL,
				ApiKey:      newSource.ApiKey,
				ApiSecret:   newSource.ApiSecret,
				LocalFolder: dsDir,
				RunningPort: createConfigPort(existingConfigs, newSource.ObjectsPort),
				PeerAddress: peerAddress,
			}
		}
		newSource.ObjectsBucket = bucket
	}

	newSource.ObjectsServiceName = config.Name
	return config, nil
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
func filterMiniosWithBaseFolder(configs map[string]*object.MinioConfig, peerAddress string, folder string) (*object.MinioConfig, error) {
	for _, source := range configs {
		if source.StorageType == object.StorageType_LOCAL && net.PeerAddressesAreSameNode(source.PeerAddress, peerAddress) {
			sep := string(os.PathSeparator)
			if source.LocalFolder == folder {
				// If one of these are empty (= start on all node) and not the other one, we don't know how to choose.
				if (source.PeerAddress == "" && peerAddress != "") || (source.PeerAddress != "" && peerAddress == "") {
					return nil, errors.WithMessagef(errors.DatasourceConflict, "there is a Peer Address conflict between two object services pointing on %s. Make sure to either set Peer Addresses everywhere, or no address at all.", source.LocalFolder)
				}
				return source, nil
			} else if strings.HasPrefix(source.LocalFolder, strings.TrimRight(folder, sep)+sep) || strings.HasPrefix(folder, strings.TrimRight(source.LocalFolder, sep)+sep) {
				return nil, errors.WithMessagef(errors.DatasourceConflict, "object service %s is already pointing to %s, make sure to avoid using nested paths for different datasources", source.Name, source.LocalFolder)
			}
		}
	}
	return nil, nil
}
