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

package grpc

import (
	"context"
	"fmt"
	"os"

	"github.com/pkg/errors"
	minio "github.com/pydio/minio-srv/cmd"
	// Import minio gateways
	_ "github.com/pydio/minio-srv/cmd/gateway"

	"io/ioutil"
	"path/filepath"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/data/source/objects"
)

// ObjectHandler definition
type ObjectHandler struct {
	Config *object.MinioConfig
}

// StartMinioServer handler
func (o *ObjectHandler) StartMinioServer(ctx context.Context, minioServiceName string) error {

	accessKey := o.Config.ApiKey
	secretKey := o.Config.ApiSecret
	configFolder, e := objects.CreateMinioConfigFile(minioServiceName, accessKey, secretKey)
	if e != nil {
		return e
	}

	var gateway, folderName, customEndpoint string
	if o.Config.StorageType == object.StorageType_S3 {
		gateway = "s3"
		customEndpoint = o.Config.EndpointUrl
	} else if o.Config.StorageType == object.StorageType_AZURE {
		gateway = "azure"
	} else if o.Config.StorageType == object.StorageType_GCS {
		gateway = "gcs"
		var creds string
		if o.Config.GatewayConfiguration != nil {
			if jsonCred, ok := o.Config.GatewayConfiguration["jsonCredentials"]; ok {
				creds = jsonCred
			}
		}
		if creds == "" {
			return errors.New("missing google application credentials to start GCS gateway")
		}
		// Create gcs-credentials.json and pass it as env variable
		fName := filepath.Join(configFolder, "gcs-credentials.json")
		ioutil.WriteFile(fName, []byte(creds), 0777)
		os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", fName)
	} else {
		folderName = o.Config.LocalFolder
	}

	port := o.Config.RunningPort

	params := []string{"minio"}
	if gateway != "" {
		params = append(params, "gateway")
		params = append(params, gateway)
	} else {
		params = append(params, "server")
	}

	if accessKey == "" {
		return errors.New("missing accessKey to start minio service")
	}

	params = append(params, "--quiet")

	params = append(params, "--config-dir")
	params = append(params, configFolder)

	if port > 0 {
		params = append(params, "--address")
		params = append(params, fmt.Sprintf(":%d", port))
	}

	if folderName != "" {
		params = append(params, folderName)
	} else if customEndpoint != "" {
		params = append(params, customEndpoint)
	}

	log.Logger(ctx).Info("Starting objects service " + minioServiceName)

	os.Setenv("MINIO_ACCESS_KEY", accessKey)
	os.Setenv("MINIO_SECRET_KEY", secretKey)
	os.Setenv("MINIO_BROWSER", "off")
	minio.Main(params)

	return nil

}

// GetHttpURL of handler
func (o *ObjectHandler) GetMinioConfig(ctx context.Context, req *object.GetMinioConfigRequest, resp *object.GetMinioConfigResponse) error {

	resp.MinioConfig = o.Config

	return nil
}
