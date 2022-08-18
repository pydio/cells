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

package object

import (
	"fmt"
	"strings"

	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const (
	StorageKeyFolder       = "folder"
	StorageKeyFolderCreate = "create"
	StorageKeyNormalize    = "normalize"

	StorageKeyCustomEndpoint   = "customEndpoint"
	StorageKeyCustomRegion     = "customRegion"
	StorageKeyMinioServer      = "minioServer"
	StorageKeyBucketsTags      = "bucketsTags"
	StorageKeyObjectsTags      = "objectsTags"
	StorageKeyNativeEtags      = "nativeEtags"
	StorageKeyBucketsRegexp    = "bucketsRegexp"
	StorageKeyReadonly         = "readOnly"
	StorageKeyJsonCredentials  = "jsonCredentials"
	StorageKeyStorageClass     = "storageClass"
	StorageKeySignatureVersion = "signatureVersion"

	StorageKeyCellsInternal    = "cellsInternal"
	StorageKeyInitFromBucket   = "initFromBucket"
	StorageKeyInitFromSnapshot = "initFromSnapshot"

	AmazonS3Endpoint = "s3.amazonaws.com"
)

func (d *DataSource) ClientConfig() configx.Values {
	cfg := configx.New()
	_ = cfg.Val("type").Set("mc")
	if d.StorageType == StorageType_AZURE {
		_ = cfg.Val("type").Set("azure")
	}
	_ = cfg.Val("endpoint").Set(d.BuildUrl())
	_ = cfg.Val("key").Set(d.GetApiKey())
	_ = cfg.Val("secret").Set(d.GetApiSecret())
	_ = cfg.Val("secure").Set(d.GetObjectsSecure())
	_ = cfg.Val("minioServer").Set(d.ServerIsMinio())
	if d.StorageConfiguration != nil {
		if r, o := d.StorageConfiguration[StorageKeyCustomRegion]; o && r != "" {
			_ = cfg.Val("region").Set(r)
		}
		if ce, o := d.StorageConfiguration[StorageKeyCustomEndpoint]; o && ce != "" {
			_ = cfg.Val(StorageKeyCustomEndpoint).Set(ce)
		}
		if sv, o := d.StorageConfiguration[StorageKeySignatureVersion]; o && sv != "" {
			_ = cfg.Val("signature").Set(sv)
		}
	}
	return cfg
}

// BuildUrl constructs the url used for clients.
func (d *DataSource) BuildUrl() string {
	host := d.ObjectsHost
	if d.ObjectsHost == "" {
		host = "localhost"
	}
	if d.ObjectsPort == 443 || d.ObjectsPort == 0 {
		return host
	} else {
		return fmt.Sprintf("%s:%d", host, d.ObjectsPort)
	}
}

// ServerIsMinio checks if server is local, of if remote definition has the minioServer key
func (d *DataSource) ServerIsMinio() bool {
	if d.StorageType == StorageType_LOCAL {
		return true
	}
	if d.StorageConfiguration == nil {
		return false
	}
	if m, o := d.StorageConfiguration[StorageKeyMinioServer]; o && m == "true" {
		return true
	}
	return false
}

func (d *MinioConfig) ClientConfig() configx.Values {
	cfg := configx.New()
	_ = cfg.Val("type").Set("mc")
	_ = cfg.Val("endpoint").Set(d.BuildUrl())
	_ = cfg.Val("key").Set(d.GetApiKey())
	_ = cfg.Val("secret").Set(d.GetApiSecret())
	_ = cfg.Val("secure").Set(d.GetRunningSecure())
	if d.StorageType == StorageType_LOCAL {
		_ = cfg.Val("minioServer").Set(true)
	} else if d.StorageType == StorageType_AZURE {
		_ = cfg.Val("type").Set("azure")
	}
	if d.GatewayConfiguration != nil {
		if m, o := d.GatewayConfiguration[StorageKeyMinioServer]; o && m == "true" {
			_ = cfg.Val("minioServer").Set(true)
		}
		if r, o := d.GatewayConfiguration[StorageKeyCustomRegion]; o && r != "" {
			_ = cfg.Val("region").Set(r)
		}
		if ce, o := d.GatewayConfiguration[StorageKeyCustomEndpoint]; o && ce != "" {
			_ = cfg.Val("customEndpoint").Set(ce)
		}
		if sv, o := d.GatewayConfiguration[StorageKeySignatureVersion]; o && sv != "" {
			_ = cfg.Val("signature").Set(sv)
		}
	}
	return cfg
}

// BuildUrl builds the url used for clients
func (d *MinioConfig) BuildUrl() string {
	host := d.RunningHost
	if d.RunningHost == "" {
		host = "localhost"
	}
	if d.RunningPort == 443 || d.RunningPort == 0 {
		return host
	} else {
		return fmt.Sprintf("%s:%d", host, d.RunningPort)
	}
}

// IsInternal is a shorthand to check StorageConfiguration["cellsInternal"] key
func (d *DataSource) IsInternal() bool {
	if d.StorageConfiguration != nil {
		_, i := d.StorageConfiguration[StorageKeyCellsInternal]
		return i
	}
	return false
}

/* LOGGING SUPPORT */

// MarshalLogObject implements custom marshalling for datasource, to avoid logging ApiKey
func (d *DataSource) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if d == nil {
		return nil
	}
	if d.Name != "" {
		encoder.AddString("Name", d.Name)
	}
	if d.ObjectsHost != "" {
		if d.ObjectsPort != 0 {
			encoder.AddString("Host", fmt.Sprintf("%s:%d", d.ObjectsHost, d.ObjectsPort))
		} else {
			encoder.AddString("Host", d.ObjectsHost)
		}
	}
	if d.ObjectsBucket != "" {
		encoder.AddString("Bucket", d.ObjectsBucket)
	}
	encoder.AddString("StorageType", d.StorageType.String())
	if d.PeerAddress != "" {
		encoder.AddString("PeerAddress", d.PeerAddress)
	}
	if d.EncryptionMode != EncryptionMode_CLEAR {
		encoder.AddString("EncryptionMode", d.EncryptionMode.String())
	}
	return nil
}

// MarshalLogObject implements custom marshalling for Minio, to avoid logging ApiKey
func (d *MinioConfig) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if d == nil {
		return nil
	}
	if d.Name != "" {
		encoder.AddString("Name", d.Name)
	}
	if d.RunningHost != "" {
		if d.RunningPort != 0 {
			encoder.AddString("Host", fmt.Sprintf("%s:%d", d.RunningHost, d.RunningPort))
		} else {
			encoder.AddString("Host", d.RunningHost)
		}
	}
	if d.RunningSecure {
		encoder.AddBool("Secure", d.RunningSecure)
	}
	encoder.AddString("StorageType", d.StorageType.String())
	if d.PeerAddress != "" {
		encoder.AddString("PeerAddress", d.PeerAddress)
	}
	return nil
}

func (m *DataSourceSingleQuery) Matches(object interface{}) bool {
	ds, ok := object.(*DataSource)
	if !ok {
		return false
	}
	var bb []bool
	if m.Name != "" {
		bb = append(bb, compareStrings(ds.Name, m.Name))
	}
	if m.ObjectServiceName != "" {
		bb = append(bb, compareStrings(ds.ObjectsServiceName, m.ObjectServiceName))
	}
	if m.StorageType != StorageTypeFilter_ANY {
		if m.StorageType == StorageTypeFilter_LOCALFS {
			bb = append(bb, ds.StorageType == StorageType_LOCAL)
		} else {
			bb = append(bb, ds.StorageType != StorageType_LOCAL)
		}
	}
	if m.IsDisabled {
		bb = append(bb, ds.Disabled)
	}
	// Check versioning
	if m.IsVersioned {
		bb = append(bb, ds.VersioningPolicyName != "")
	}
	if m.VersioningPolicyName != "" {
		bb = append(bb, compareStrings(ds.VersioningPolicyName, m.VersioningPolicyName))
	}
	// Check encryption
	if m.IsEncrypted {
		bb = append(bb, ds.EncryptionMode != EncryptionMode_CLEAR)
	}
	if m.EncryptionMode != EncryptionMode_CLEAR {
		bb = append(bb, m.EncryptionMode == m.EncryptionMode)
	}
	if m.EncryptionKey != "" {
		bb = append(bb, compareStrings(ds.EncryptionKey, m.EncryptionKey))
	}
	if m.FlatStorage {
		bb = append(bb, ds.FlatStorage)
	}
	if m.SkipSyncOnRestart {
		bb = append(bb, ds.SkipSyncOnRestart)
	}
	if m.PeerAddress != "" {
		bb = append(bb, compareStrings(ds.PeerAddress, m.PeerAddress))
	}
	if m.StorageConfigurationName != "" {
		cf := ds.StorageConfiguration
		if cf == nil {
			cf = map[string]string{}
		}
		val, ok := ds.StorageConfiguration[m.StorageConfigurationName]
		if m.StorageConfigurationValue == "" {
			bb = append(bb, ok)
		} else {
			bb = append(bb, compareStrings(val, m.StorageConfigurationValue))
		}
	}

	result := service.ReduceQueryBooleans(bb, service.OperationType_AND)
	if m.Not {
		return !result
	} else {
		return result
	}
}

func compareStrings(ref, search string) bool {
	// Basic search: can have wildcard on left, right, or none (exact search)
	var left, right bool
	if strings.HasPrefix(search, "*") {
		left = true
	}
	if strings.HasSuffix(search, "*") {
		right = true
	}
	search = strings.Trim(search, "*")
	if left || right {
		// If not exact search, lowerCase
		ref = strings.ToLower(ref)
		search = strings.ToLower(search)
	}
	if left && right && !strings.Contains(ref, search) { // *part*
		return false
	} else if right && !left && !strings.HasPrefix(ref, search) { // start*
		return false
	} else if left && !right && !strings.HasSuffix(ref, search) { // *end
		return false
	} else if !left && !right && ref != search { // exact term
		return false
	}
	return true
}
