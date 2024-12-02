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

package clients

import (
	"context"
	"fmt"
	"strconv"
	sync2 "sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	grpccli "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/server"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/sync/endpoints/index"
	"github.com/pydio/cells/v5/common/sync/endpoints/s3"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
)

func CheckSubServices(ctx context.Context, syncConfig *object.DataSource, cb ...func(sName string, status bool, detail string)) (minioConfig *object.MinioConfig, oc nodes.StorageClient, cErr error) {
	dataSource := syncConfig.Name
	var serviceCallback func(sName string, status bool, detail string)
	if len(cb) > 0 {
		serviceCallback = cb[0]
	}

	var indexOK bool
	wg := &sync2.WaitGroup{}
	wg.Add(2)

	// Making sure index is started
	go func() {
		defer wg.Done()
		log.Logger(ctx).Debug("Sync " + dataSource + " - Try to contact Index")
		cc := grpccli.ResolveConn(ctx, common.ServiceGrpcNamespace_+common.ServiceDataIndex_+dataSource)
		readyzClient := server.NewReadyzClient(cc)
		hsR, hsE := readyzClient.Ready(ctx, &server.ReadyCheckRequest{HealthCheckRequest: &grpc_health_v1.HealthCheckRequest{}})
		if hsE != nil {
			log.Logger(ctx).Error("Index Healthcheck Error", zap.Error(hsE))
			if serviceCallback != nil {
				serviceCallback("index", false, "Error: "+hsE.Error())
			}
		} else if hsR.GetReadyStatus() != server.ReadyStatus_Ready {
			log.Logger(ctx).Error("Index Not Ready " + hsR.GetReadyStatus().String())
			if serviceCallback != nil {
				serviceCallback("index", false, "index not ready")
				for k, v := range hsR.Components {
					serviceCallback("index."+k, v.ReadyStatus == server.ReadyStatus_Ready, v.Details)
				}
			}
		} else {
			log.Logger(ctx).Info("Index Connected", zap.Any("res", hsR))
			if serviceCallback != nil {
				serviceCallback("index", true, "index ready")
				for k, v := range hsR.Components {
					serviceCallback("index."+k, true, v.Details)
				}
			}
			indexOK = true
		}
	}()

	// Making sure Objects is started
	go func() {
		defer wg.Done()
		cli := object.NewObjectsEndpointClient(grpccli.ResolveConn(ctx, common.ServiceDataObjectsGRPC_+syncConfig.ObjectsServiceName))
		resp, err := cli.GetMinioConfig(ctx, &object.GetMinioConfigRequest{})
		if err != nil {
			log.Logger(ctx).Warn(common.ServiceDataObjects_+syncConfig.ObjectsServiceName+" not yet available", zap.Error(err))
			cErr = err
			if serviceCallback != nil {
				serviceCallback("object", false, "Object not ready: "+err.Error())
			}
			return
		} else if resp.MinioConfig == nil {
			log.Logger(ctx).Debug(common.ServiceDataObjects_ + syncConfig.ObjectsServiceName + " not yet available")
			cErr = fmt.Errorf("empty config")
			if serviceCallback != nil {
				serviceCallback("object", false, "Object not ready: "+cErr.Error())
			}
			return
		}
		minioConfig = proto.Clone(resp.MinioConfig).(*object.MinioConfig)
		if serviceCallback != nil {
			serviceCallback("object", true, "Object is ready (retrieved config)")
		}

		ocCfg := minioConfig.ClientConfig(ctx, config.GetSecret, s3.UserAgentAppName, s3.UserAgentVersion)

		var retryCount int
		cErr = std.Retry(ctx, func() error {
			retryCount++
			var e error
			oc, e = nodes.NewStorageClient(ocCfg)
			if e != nil {
				log.Logger(ctx).Error("Cannot create objects client "+e.Error(), zap.Error(e))
				if serviceCallback != nil {
					serviceCallback("storage", false, "S3 client cannot be configured: "+e.Error())
				}
				return e
			}
			testCtx := propagator.NewContext(ctx, map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})
			if syncConfig.ObjectsBucket == "" {
				log.Logger(ctx).Debug("Sending ListBuckets", zap.Any("config", syncConfig))
				_, err = oc.ListBuckets(testCtx)
				if err != nil {
					if serviceCallback != nil {
						serviceCallback("storage", false, "S3 cannot list buckets: "+err.Error())
					}
					return err
				} else {
					if serviceCallback != nil {
						serviceCallback("storage", true, "S3 successfully list buckets")
					}
					log.Logger(ctx).Info("Successfully listed buckets")
					return nil
				}
			} else {
				log.Logger(ctx).Debug("Sending ListObjects")
				t := time.Now()
				_, err = oc.ListObjects(testCtx, syncConfig.ObjectsBucket, "", "/", "/", 1)
				log.Logger(ctx).Debug("Sent ListObjects")
				if err != nil {
					if retryCount > 1 {
						log.Logger(ctx).Warn("Cannot contact s3 service (bucket "+syncConfig.ObjectsBucket+"), will retry in 1s", zap.Error(err))
					}
					if serviceCallback != nil {
						serviceCallback("storage", false, "S3 cannot list objects in bucket: "+err.Error())
					}
					return err
				} else {
					log.Logger(ctx).Info(fmt.Sprintf("Successfully retrieved first object from bucket %s (%s)", syncConfig.ObjectsBucket, time.Since(t)))
					if serviceCallback != nil {
						serviceCallback("storage", false, "S3 successfully list objects in bucket")
					}
					return nil
				}
			}
		}, 2*time.Second, 180*time.Second)
	}()

	wg.Wait()

	if cErr != nil {
		cErr = fmt.Errorf("objects not reachable: %v", cErr)
	} else if minioConfig == nil || oc == nil {
		cErr = fmt.Errorf("objects not reachable")
	} else if !indexOK {
		cErr = fmt.Errorf("index not reachable")
	}

	return
}

// InitEndpoints creates two model.Endpoint to be used in synchronisation or in a capture task
func InitEndpoints(ctx context.Context, syncConfig *object.DataSource, clientRead tree.NodeProviderClient, clientWrite tree.NodeReceiverClient, clientSession tree.SessionIndexerClient) (model.Endpoint, model.Endpoint, *object.MinioConfig, error) {

	// Making sure Object AND underlying S3 is started
	minioConfig, oc, err := CheckSubServices(ctx, syncConfig)
	if err != nil {
		return nil, nil, nil, err
	}

	dataSource := syncConfig.Name

	var source model.PathSyncSource
	if syncConfig.Watch {
		return nil, nil, nil, fmt.Errorf("datasource watch is not implemented yet")
	}
	options := model.EndpointOptions{}
	bucketTags, o1 := syncConfig.StorageConfiguration[object.StorageKeyBucketsTags]
	o1 = o1 && bucketTags != ""
	objectsTags, o2 := syncConfig.StorageConfiguration[object.StorageKeyObjectsTags]
	o2 = o2 && objectsTags != ""
	var syncMetas bool
	if o1 || o2 {
		syncMetas = true
		options.Properties = make(map[string]string)
		if o1 {
			options.Properties[object.StorageKeyBucketsTags] = bucketTags
		}
		if o2 {
			options.Properties[object.StorageKeyObjectsTags] = objectsTags
		}
	}
	if readOnly, o := syncConfig.StorageConfiguration[object.StorageKeyReadonly]; o && readOnly == "true" {
		options.BrowseOnly = true
	}

	if syncConfig.ObjectsBucket == "" {
		var bucketsFilter string
		if f, o := syncConfig.StorageConfiguration[object.StorageKeyBucketsRegexp]; o {
			bucketsFilter = f
		}
		var errs3 error
		if source, errs3 = s3.NewMultiBucketClient(ctx, oc, minioConfig.BuildUrl(), bucketsFilter, options); errs3 != nil {
			return nil, nil, nil, errs3
		}
	} else {
		source = s3.NewObjectClient(ctx, oc, minioConfig.BuildUrl(), syncConfig.ObjectsBucket, syncConfig.ObjectsBaseFolder, options)
	}

	// Setup normalization
	if normalizeS3, _ := strconv.ParseBool(syncConfig.StorageConfiguration[object.StorageKeyNormalize]); normalizeS3 {
		source.(s3.ClientConfigurator).SetServerRequiresNormalization()
	}
	// Setup Native Etags
	if k, o := syncConfig.StorageConfiguration[object.StorageKeyNativeEtags]; o && k == "true" {
		source.(s3.ClientConfigurator).SkipRecomputeEtagByCopy()
	}
	// Setup PlainSize computer
	if syncConfig.EncryptionMode != object.EncryptionMode_CLEAR {
		keyClient := encryption.NewNodeKeyManagerClient(grpccli.ResolveConn(ctx, common.ServiceEncKeyGRPC))
		computer := func(nodeUUID string) (i int64, e error) {
			if resp, e := keyClient.GetNodePlainSize(ctx, &encryption.GetNodePlainSizeRequest{
				NodeId: nodeUUID,
				UserId: "ds:" + syncConfig.Name,
			}); e == nil {
				log.Logger(ctx).Debug("Loaded plain size from data-key service")
				return resp.GetSize(), nil
			} else {
				log.Logger(ctx).Error("Cannot loaded plain size from data-key service", zap.Error(e))
				return 0, e
			}
		}
		source.(s3.ClientConfigurator).SetPlainSizeComputer(computer)
	}
	// Setup custom ChecksumMapper
	if cst, ok := syncConfig.StorageConfiguration["checksumMapper"]; ok && cst == "dao" {
		if csm, er := manager.Resolve[s3.ChecksumMapper](ctx); er != nil {
			log.Logger(ctx).Warn("Cannot resolve s3 checksum mapper service", zap.Error(er))
		} else {
			purge := syncConfig.ObjectsBucket != ""
			source.(s3.ClientConfigurator).SetChecksumMapper(csm, purge)
			log.Logger(ctx).Info("Attaching s3 checksum mapper")
		}
	}

	var target model.Endpoint
	if syncMetas {
		target = index.NewClientWithMeta(ctx, dataSource, clientRead, clientWrite, clientSession)
	} else {
		target = index.NewClient(dataSource, clientRead, clientWrite, clientSession)
	}

	return source, target, minioConfig, nil

}
