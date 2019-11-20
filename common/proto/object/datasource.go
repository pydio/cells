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

package object

import (
	"fmt"

	"go.uber.org/zap/zapcore"

	"github.com/pydio/minio-go"
)

// Builds the url used for clients
func (d *DataSource) BuildUrl() string {
	return fmt.Sprintf("%s:%d", d.ObjectsHost, d.ObjectsPort)
}

// Creates a Minio.Core client from the datasource parameters
func (d *DataSource) CreateClient() (*minio.Core, error) {
	return minio.NewCore(d.BuildUrl(), d.GetApiKey(), d.GetApiSecret(), d.GetObjectsSecure())

}

// Builds the url used for clients
func (d *MinioConfig) BuildUrl() string {
	return fmt.Sprintf("%s:%d", d.RunningHost, d.RunningPort)
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
