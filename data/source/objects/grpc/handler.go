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
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"time"

	minio "github.com/minio/minio/cmd"
	"github.com/minio/minio/pkg/auth"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/net"
	"github.com/pydio/cells/v5/data/source"
	"github.com/pydio/cells/v5/data/source/objects"

	_ "github.com/minio/minio/cmd/gateway"
)

func init() {
	runtime.RegisterEnvVariable("CELLS_MINIO_STALE_DATA_EXPIRY", "48h", "Expiration of stale data produced by objects upload parts")
}

type RunningMinioHandler struct {
	*object.MinioConfig
	Cancel context.CancelFunc
}

func NewObjectHandlerWithPreset(mc *object.MinioConfig) *ObjectHandler {
	return &ObjectHandler{
		PresetConfig: mc,
	}
}

// NewSharedObjectHandler creates a stateless handler for exposing configs
func NewSharedObjectHandler(resolver *source.Resolver[*RunningMinioHandler]) *ObjectHandler {
	return &ObjectHandler{
		Resolver: resolver,
	}
}

// ObjectHandler definition
type ObjectHandler struct {
	object.UnimplementedObjectsEndpointServer
	object.UnimplementedResourceCleanerEndpointServer
	*source.Resolver[*RunningMinioHandler]
	PresetConfig *object.MinioConfig
}

func (o *ObjectHandler) getConfig(ctx context.Context) (*object.MinioConfig, string, bool) {
	if o.PresetConfig != nil {
		return o.PresetConfig, "", true
	}
	obj, er := o.Resolve(ctx)
	if er != nil {
		return nil, "", false
	} else {
		return obj.MinioConfig, "", true
	}
}

// StartMinioServer handler
func (o *ObjectHandler) StartMinioServer(ctx context.Context, conf *object.MinioConfig, minioServiceName string) error {

	if conf.StorageType == object.StorageType_GCS {
		return fmt.Errorf("GCS Gateway is not supported anymore, use Google Storage S3 API instead")
	} else if conf.StorageType != object.StorageType_LOCAL {
		// Ignore
		return nil
	}

	accessKey := conf.ApiKey
	secretKey := conf.ApiSecret

	// Replace secretKey on the fly
	if sec := config.GetSecret(ctx, secretKey).String(); sec != "" {
		secretKey = sec
	}

	return o.startMinioServer(ctx, minioServiceName, accessKey, secretKey, conf.LocalFolder, conf.RunningPort)

}

// StartMinioServer handler
func (o *ObjectHandler) startMinioServer(ctx context.Context, minioServiceName, accessKey, secretKey, localFolder string, runningPort int32) error {

	// Create a config file
	configFolder := filepath.Join(
		runtime.MustServiceDataDir(common.ServiceDataObjectsGRPC),
		runtime.MultiContextManager().Current(ctx),
		minioServiceName,
	)
	if err := objects.CreateMinioConfigFile(configFolder, accessKey, secretKey); err != nil {
		return err
	}

	globals := minio.NewGlobals()
	globals.ActiveCred, _ = auth.CreateCredentials(accessKey, secretKey)
	globals.ConfigEncrypted = true
	globals.CliContext = &minio.CliContext{
		Quiet:      true,
		Addr:       fmt.Sprintf(":%d", runningPort),
		ConfigDir:  minio.NewConfigDir(configFolder),
		CertsDir:   minio.NewConfigDir(filepath.Join(configFolder, "certs")),
		CertsCADir: minio.NewConfigDir(filepath.Join(configFolder, "certs", "CAs")),
	}
	globals.ReqParamExtractors = append(globals.ReqParamExtractors, func(req *http.Request, m map[string]string) {
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

	globals.Context = ctx // will monitor
	log.Logger(ctx).Infof("Serving %s as minio server with config dir %s on port %d", localFolder, globals.CliContext.ConfigDir.Get(), runningPort)
	minio.StartServerWithGlobals(globals, localFolder)

	return nil

}

// GetMinioConfig returns current configuration
func (o *ObjectHandler) GetMinioConfig(ctx context.Context, _ *object.GetMinioConfigRequest) (*object.GetMinioConfigResponse, error) {

	if conf, ds, ok := o.getConfig(ctx); ok {
		return &object.GetMinioConfigResponse{
			MinioConfig: conf,
		}, nil
	} else {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource "+ds+" in context")
	}

}

// StorageStats returns statistics about storage
func (o *ObjectHandler) StorageStats(ctx context.Context, _ *object.StorageStatsRequest) (*object.StorageStatsResponse, error) {

	conf, ds, ok := o.getConfig(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource "+ds+" in context")
	}

	resp := &object.StorageStatsResponse{}
	resp.Stats = make(map[string]string)
	resp.Stats["StorageType"] = conf.StorageType.String()
	switch conf.StorageType {
	case object.StorageType_LOCAL:
		folder := conf.LocalFolder
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

	conf, ds, ok := o.getConfig(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusInternalServerError, "cannot find datasource "+ds+" in context")
	}

	resp = &object.CleanResourcesResponse{
		Success: true,
		Message: "Nothing to do",
	}
	if conf.StorageType != object.StorageType_LOCAL {
		return
	}
	configFolder := filepath.Join(conf.LocalFolder, ".minio.sys", "config")
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

func InitMinioConfig(conf *object.MinioConfig) (*object.MinioConfig, error) {
	mc := proto.Clone(conf).(*object.MinioConfig)
	if mc.StorageType == object.StorageType_LOCAL || mc.StorageType == object.StorageType_GCS {
		mc.RunningSecure = false
		mc.RunningHost = runtime.DefaultAdvertiseAddress()
		mc.RunningPort = int32(net.GetAvailablePort())
	} else if mc.StorageType == object.StorageType_S3 && mc.EndpointUrl == "" {
		mc.RunningHost = object.AmazonS3Endpoint
		mc.RunningSecure = true
		mc.RunningPort = 443
	} else {
		eu, e := url.Parse(mc.EndpointUrl)
		if e != nil {
			return nil, e
		}
		mc.RunningHost = eu.Hostname()
		p, _ := strconv.Atoi(eu.Port())
		mc.RunningPort = int32(p)
		mc.RunningSecure = eu.Scheme == "https"
	}
	return mc, nil
}

// MinioStaleDataCleaner looks up for stala data inside .minio.sys/tmp and .minio.sys/multipart on a regular basis.
// Defaults are 48h for expiry and 12h for interval. Expiry can be overriden with the CELLS_MINIO_STALE_DATA_EXPIRY env
// variable, in which case interval = expiry / 2
func (o *ObjectHandler) MinioStaleDataCleaner(ctx context.Context, rootFolder string) {
	folders := []string{"tmp", "multipart"}
	interval := time.Hour * 12
	expiry := time.Hour * 48
	if env := os.Getenv("CELLS_MINIO_STALE_DATA_EXPIRY"); env != "" {
		if d, e := time.ParseDuration(env); e == nil {
			expiry = d
			interval = expiry / 2
			log.Logger(ctx).Info("Loaded stale data expiry time from ENV: " + d.String() + ", will run every " + interval.String())
		}
	}

	timer := time.NewTimer(interval)
	defer timer.Stop()

	clean := func() {
		now := time.Now()
		for _, f := range folders {
			tmpFolder := filepath.Join(rootFolder, ".minio.sys", f)
			entries, err := os.ReadDir(tmpFolder)
			if err != nil {
				if !os.IsNotExist(err) {
					log.Logger(ctx).Error("Cannot read folder " + tmpFolder + " for cleaning stale data: " + err.Error())
				}
				continue
			}
			for _, e := range entries {
				if info, err := e.Info(); err == nil {
					if now.Sub(info.ModTime()) > expiry {
						stale := filepath.Join(tmpFolder, e.Name())
						if er := os.RemoveAll(stale); er == nil {
							log.Logger(ctx).Info("Removed stale entry from minio tmp folders " + stale)
						}
					}
				}
			}
		}
	}

	log.Logger(ctx).Info("Performing a first clean of minio stale data")
	clean()

	for {
		select {
		case <-ctx.Done():
			log.Logger(ctx).Info("Stopping minio stale data cleaner routine")
			return
		case <-timer.C:
			clean()
		}
	}
}
