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

package grpc

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	minio "github.com/minio/minio/cmd"
	_ "github.com/minio/minio/cmd/gateway"
	"github.com/pkg/errors"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/object"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/data/source/objects"
)

// ObjectHandler definition
type ObjectHandler struct {
	object.UnimplementedObjectsEndpointServer
	object.UnimplementedResourceCleanerEndpointServer
	Config           *object.MinioConfig
	MinioConsolePort int
	handlerName      string
}

func (o *ObjectHandler) Name() string {
	return o.handlerName
}

// StartMinioServer handler
func (o *ObjectHandler) StartMinioServer(ctx context.Context, minioServiceName string) error {

	if o.Config.StorageType != object.StorageType_LOCAL && o.Config.StorageType != object.StorageType_GCS {
		return nil
	}

	accessKey := o.Config.ApiKey
	secretKey := o.Config.ApiSecret

	// Replace secretKey on the fly
	if sec := config.GetSecret(secretKey).String(); sec != "" {
		secretKey = sec
	}
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
		var credsUuid string
		if o.Config.GatewayConfiguration != nil {
			if jsonCred, ok := o.Config.GatewayConfiguration["jsonCredentials"]; ok {
				credsUuid = jsonCred
			}
		}
		if credsUuid == "" {
			return errors.New("missing google application credentials to start GCS gateway")
		}
		creds := config.GetSecret(credsUuid).Bytes()
		if len(creds) == 0 {
			return errors.New("missing google application credentials to start GCS gateway (cannot find inside vault)")
		}
		var strjs string
		if e := json.Unmarshal(creds, &strjs); e == nil && len(strjs) > 0 {
			// Consider the internal string value as the json
			creds = []byte(strjs)
		}

		// Create gcs-credentials.json and pass it as env variable
		fName := filepath.Join(configFolder, "gcs-credentials.json")
		if er := os.WriteFile(fName, creds, 0600); er != nil {
			return errors.New("cannot prepare gcs-credentials.json file: " + e.Error())
		}
		_ = os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", fName)
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
	if o.MinioConsolePort > 0 {
		params = append(params, "--console-address", fmt.Sprintf(":%d", o.MinioConsolePort))
	} else {
		_ = os.Setenv("MINIO_BROWSER", "off")
	}

	params = append(params, "--config-dir")
	params = append(params, configFolder)

	if port > 0 {
		params = append(params, "--address")
		params = append(params, fmt.Sprintf(":%d", port))
	}

	if folderName != "" {
		params = append(params, folderName)
		log.Logger(ctx).Info("Starting local objects service " + minioServiceName + " on " + folderName)
	} else if customEndpoint != "" {
		params = append(params, customEndpoint)
		log.Logger(ctx).Info("Starting gateway objects service " + minioServiceName + " to " + customEndpoint)
	} else if gateway == "s3" && customEndpoint == "" {
		params = append(params, "https://s3.amazonaws.com", "pydio-ds")
		log.Logger(ctx).Info("Starting gateway objects service " + minioServiceName + " to Amazon S3")
	}

	_ = os.Setenv("MINIO_ROOT_USER", accessKey)
	_ = os.Setenv("MINIO_ROOT_PASSWORD", secretKey)

	minio.HookRegisterGlobalHandler(func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handler.ServeHTTP(w, r)
		})
	})
	minio.HookExtractReqParams(func(req *http.Request, m map[string]string) {
		if v := req.Header.Get(common.PydioContextUserKey); v != "" {
			m[common.PydioContextUserKey] = v
		}
		for _, key := range common.XSpecialPydioHeaders {
			if v := req.Header.Get("X-Amz-Meta-" + key); v != "" {
				m[key] = v
			} else if v := req.Header.Get(key); v != "" {
				m[key] = v
			}
		}
	})

	minio.Main(params)

	return nil
}

// GetMinioConfig returns current configuration
func (o *ObjectHandler) GetMinioConfig(_ context.Context, _ *object.GetMinioConfigRequest) (*object.GetMinioConfigResponse, error) {

	return &object.GetMinioConfigResponse{
		MinioConfig: o.Config,
	}, nil

}

// StorageStats returns statistics about storage
func (o *ObjectHandler) StorageStats(_ context.Context, _ *object.StorageStatsRequest) (*object.StorageStatsResponse, error) {

	resp := &object.StorageStatsResponse{}
	resp.Stats = make(map[string]string)
	resp.Stats["StorageType"] = o.Config.StorageType.String()
	switch o.Config.StorageType {
	case object.StorageType_LOCAL:
		folder := o.Config.LocalFolder
		if stats, e := minio.ExposedDiskStats(context.Background(), folder, false); e != nil {
			return nil, e
		} else {
			resp.Stats["Total"] = fmt.Sprintf("%d", stats["Total"])
			resp.Stats["Free"] = fmt.Sprintf("%d", stats["Free"])
			resp.Stats["FSType"] = fmt.Sprintf("%s", stats["FSType"])
		}
	}

	return resp, nil
}

// CleanResourcesBeforeDelete removes the .minio.sys/config folder if it exists
func (o *ObjectHandler) CleanResourcesBeforeDelete(ctx context.Context, request *object.CleanResourcesRequest) (resp *object.CleanResourcesResponse, err error) {
	resp = &object.CleanResourcesResponse{
		Success: true,
		Message: "Nothing to do",
	}
	if o.Config.StorageType != object.StorageType_LOCAL {
		return
	}
	configFolder := filepath.Join(o.Config.LocalFolder, ".minio.sys", "config")
	if _, er := os.Stat(configFolder); er == nil {
		if err = os.RemoveAll(configFolder); err == nil {
			resp.Message = "Removed minio config folder"
		} else {
			resp.Success = false
			resp.Message = err.Error()
		}
	}
	return
}
