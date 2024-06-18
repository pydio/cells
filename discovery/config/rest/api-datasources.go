/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package rest

import (
	"context"
	"fmt"
	"net/url"
	"path/filepath"
	"regexp"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/filesystem"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

/*********************
DATASOURCES MANAGEMENT
*********************/

// GetDataSource retrieves a datasource given its name.
func (s *Handler) GetDataSource(req *restful.Request, resp *restful.Response) error {

	dsName := req.PathParameter("Name")
	res, found, err := s.loadDataSource(req.Request.Context(), dsName)
	if err != nil {
		return err
	}
	if !found {
		return errors.WithStack(errors.DatasourceNotFound)
	}
	return resp.WriteEntity(res)

}

func (s *Handler) PutDataSource(req *restful.Request, resp *restful.Response) error {

	var ds object.DataSource
	if err := req.ReadEntity(&ds); err != nil {
		return err
	}
	if ds.Name == "" {
		ds.Name = req.PathParameter("Name")
	}
	if ds.Name == "" {
		return errors.WithMessage(errors.InvalidParameters, "cannot create datasource without at least a name")
	}

	// Replace uuid secret if it exists
	var secretUuid string
	if sec := config.GetSecret(ds.ApiSecret).String(); sec != "" {
		secretUuid = ds.ApiSecret
		ds.ApiSecret = sec
	}

	if reg, _ := regexp.MatchString("^[0-9a-z]*$", ds.Name); !reg {
		return errors.WithMessage(errors.InvalidParameters, "datasource name contains an invalid character, please use alphanumeric characters")
	}

	ctx := req.Request.Context()

	// Handle / and \ for OS
	if ds.StorageType == object.StorageType_LOCAL {
		if err := s.ValidateLocalDSFolderOnPeer(ctx, &ds); err != nil {
			return err
		}
		osFolder := filesystem.ToFilePath(ds.StorageConfiguration[object.StorageKeyFolder])
		rootPrefix := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects, "allowedLocalDsFolder").String()
		if rootPrefix != "" && !strings.HasPrefix(osFolder, rootPrefix) {
			osFolder = filepath.Join(rootPrefix, osFolder)
		}
		ds.StorageConfiguration[object.StorageKeyFolder] = osFolder
	}

	currentSources := config.ListSourcesFromConfig()
	currentMinios := config.ListMinioConfigsFromConfig()
	initialDs, update := currentSources[ds.Name]
	var initialVersioningEmpty bool
	if update {
		initialVersioningEmpty = initialDs.VersioningPolicyName == ""
	} else {
		// Set default value for hashing version on new datasources
		if ds.StorageConfiguration == nil {
			ds.StorageConfiguration = map[string]string{}
		}
		ds.StorageConfiguration[object.StorageKeyHashingVersion] = object.CurrentHashingVersion
	}

	minioConfig, e := config.FactorizeMinioServers(currentMinios, &ds, update)
	if e != nil {
		return e
	}
	if !update && ds.PeerAddress == "" && ds.StorageType == object.StorageType_LOCAL {
		// Make sure it is not a full duplicate
		newDsFolder := ds.StorageConfiguration[object.StorageKeyFolder]
		for _, src := range currentSources {
			if src.StorageType == ds.StorageType && src.StorageConfiguration[object.StorageKeyFolder] == newDsFolder {
				return errors.WithMessagef(errors.DatasourceConflict, "Cannot create a datasource at the same location than %s", src.Name)
			}
		}
	}
	currentSources[ds.Name] = &ds
	currentMinios[minioConfig.Name] = minioConfig
	if ds.ApiSecret != "" {
		if secretUuid == "" {
			secretUuid = config.NewKeyForSecret()
			if er := config.SetSecret(secretUuid, ds.ApiSecret); er != nil {
				return er
			}
		}
		ds.ApiSecret = secretUuid
		minioConfig.ApiSecret = secretUuid
	}

	dsName := ds.Name
	// UPDATE INDEX
	if ds.Disabled {
		config.Set(true, "services", "pydio.grpc.data.index."+dsName, "Disabled")
	} else {
		config.Del("services", "pydio.grpc.data.index."+dsName, "Disabled")
	}
	config.Get().Map()
	if ds.PeerAddress != "" {
		config.Set(ds.PeerAddress, "services", "pydio.grpc.data.index."+dsName, "PeerAddress")
	} else {
		config.Del("services", "pydio.grpc.data.index."+dsName, "PeerAddress")
	}
	config.Get().Map()
	config.Set("default", "services", "pydio.grpc.data.index."+dsName, "dsn")
	config.Set(config.IndexServiceTableNames(dsName), "services", "pydio.grpc.data.index."+dsName, "tables")
	// UPDATE SYNC
	config.Set(ds, "services", "pydio.grpc.data.sync."+dsName)
	// UPDATE OBJECTS
	config.Set(minioConfig, "services", "pydio.grpc.data.objects."+minioConfig.Name)

	log.Logger(ctx).Debug("Now Store Sources", zap.Any("sources", currentSources), zap.Any("ds", &ds))
	config.SourceNamesToConfig(currentSources)
	config.MinioConfigNamesToConfig(currentMinios)

	u, _ := permissions.FindUserNameInContext(ctx)
	if u == "" {
		u = "rest"
	}

	if err := config.Save(u, "Create DataSource"); err == nil {
		eventType := object.DataSourceEvent_CREATE
		if update {
			eventType = object.DataSourceEvent_UPDATE
			if initialVersioningEmpty && ds.VersioningPolicyName != "" {
				if e := createFullVersioningJob(ctx, dsName); e != nil {
					log.Logger(ctx).Warn("Could not insert full versioning job for datasource " + dsName)
				}
			} else if ds.VersioningPolicyName == "" && !initialVersioningEmpty {
				if e := removeFullVersioningJob(ctx, dsName); e != nil {
					log.Logger(ctx).Warn("Could not insert full versioning job for datasource " + dsName)
				}
			}
		}

		if err = broker.Publish(ctx, common.TopicDatasourceEvent, &object.DataSourceEvent{
			Name:   dsName,
			Type:   eventType,
			Config: &ds,
		}); err != nil {
			log.Logger(ctx).Warn("could not notify the new data source creation", zap.Error(err))
		}
		return resp.WriteEntity(&ds)
	} else {
		return err
	}

}

func (s *Handler) DeleteDataSource(req *restful.Request, resp *restful.Response) error {

	ctx := req.Request.Context()
	dsName := req.PathParameter("Name")
	if dsName == "" {
		return errors.WithMessage(errors.InvalidParameters, "please provide a datasource name")
	}
	if dsName == config.Get("defaults", "datasource").String() {
		return errors.WithMessage(errors.StatusBadRequest, "This is the default datasource! Please replace it in your config file before trying to delete.")
	}
	hasWorkspace, err := s.findWorkspacesForDatasource(req.Request.Context(), dsName)
	if err != nil {
		return err
	} else if hasWorkspace {
		return errors.WithMessage(errors.DatasourceConflict, "There are workspaces defined on this datasource, please delete them before removing datasource")
	}
	currentSources := config.ListSourcesFromConfig()

	if existingDS, ok := currentSources[dsName]; !ok {
		return errors.WithStack(errors.DatasourceNotFound)
	} else if existingDS.VersioningPolicyName != "" {
		if e := removeFullVersioningJob(ctx, dsName); e != nil {
			log.Logger(ctx).Warn("Error while removing full versioning job on ds deletion", zap.Error(e))
		}
	}
	delete(currentSources, dsName)
	config.SourceNamesToConfig(currentSources)
	config.Del("services", "pydio.grpc.data.index."+dsName)
	config.Del("services", "pydio.grpc.data.sync."+dsName)

	currentMinios := config.ListMinioConfigsFromConfig()
	if keys := config.UnusedMinioServers(currentMinios, currentSources); len(keys) > 0 {
		for _, key := range keys {
			config.Del("services", "pydio.grpc.data.objects."+key)
			delete(currentMinios, key)
		}
		config.MinioConfigNamesToConfig(currentMinios)
	}

	u, _ := permissions.FindUserNameInContext(req.Request.Context())
	if u == "" {
		u = "rest"
	}
	if e := config.Save(u, "Delete DataSource"); e != nil {
		return e
	}
	_ = broker.Publish(req.Request.Context(), common.TopicDatasourceEvent, &object.DataSourceEvent{
		Name: dsName,
		Type: object.DataSourceEvent_DELETE,
	})

	return resp.WriteEntity(&rest.DeleteDataSourceResponse{
		Success: true,
	})
}

func (s *Handler) ListDataSources(req *restful.Request, resp *restful.Response) error {

	if sources, err := s.getDataSources(req.Request.Context()); err != nil {
		return err

	} else {
		return resp.WriteEntity(&rest.DataSourceCollection{
			DataSources: sources,
			Total:       int32(len(sources)),
		})
	}
}

func (s *Handler) storageClientForDatasource(ds *object.DataSource) (nodes.StorageClient, error) {
	endpoint := "https://s3.amazonaws.com"
	if c, o := ds.StorageConfiguration[object.StorageKeyCustomEndpoint]; o && c != "" {
		endpoint = c
	}
	u, _ := url.Parse(endpoint)
	host := u.Host
	secure := u.Scheme == "https"
	if sec := config.GetSecret(ds.ApiSecret).String(); sec != "" {
		ds.ApiSecret = sec
	}

	cfData := configx.New()
	_ = cfData.Val("endpoint").Set(host)
	_ = cfData.Val("key").Set(ds.ApiKey)
	_ = cfData.Val("secret").Set(ds.ApiSecret)
	_ = cfData.Val("secure").Set(secure)
	_ = cfData.Val("type").Set("mc")
	if r, o := ds.StorageConfiguration[object.StorageKeyCustomRegion]; o && r != "" {
		_ = cfData.Val("customRegion").Set(r)
	}
	if sv, o := ds.StorageConfiguration[object.StorageKeySignatureVersion]; o && sv != "" {
		_ = cfData.Val("signature").Set(sv)
	}

	return nodes.NewStorageClient(cfData)
}

// ListStorageBuckets implements corresponding API. Lists available buckets on a remote
// object storage. Currently only supports S3 type storages.
func (s *Handler) ListStorageBuckets(req *restful.Request, resp *restful.Response) error {
	var r rest.ListStorageBucketsRequest
	if e := req.ReadEntity(&r); e != nil {
		return e
	}
	if r.DataSource.StorageType != object.StorageType_S3 {
		return errors.WithMessage(errors.StatusBadRequest, "unsupported datasource type")
	}
	mc, er := s.storageClientForDatasource(r.DataSource)
	if er != nil {
		return er
	}
	bb, er := mc.ListBuckets(context.Background())
	if er != nil {
		return er
	}
	var filter *regexp.Regexp
	if r.BucketsRegexp != "" {
		filter, er = regexp.Compile(r.BucketsRegexp)
		if er != nil {
			return er
		}
	}
	response := &rest.NodesCollection{}
	for _, b := range bb {
		if filter != nil && !filter.MatchString(b.Name) {
			continue
		}
		response.Children = append(response.Children, &tree.Node{
			Path:  b.Name,
			Type:  tree.NodeType_COLLECTION,
			MTime: b.CreationDate.Unix(),
		})
	}
	return resp.WriteEntity(response)

}

// CreateStorageBucket instantiates a Storage client to create a bucket
func (s *Handler) CreateStorageBucket(req *restful.Request, resp *restful.Response) error {
	var r rest.CreateStorageBucketRequest
	if e := req.ReadEntity(&r); e != nil {
		return e
	}
	if r.DataSource.StorageType != object.StorageType_S3 {
		return errors.WithMessage(errors.StatusBadRequest, "unsupported datasource type")
	}
	bucketName := req.PathParameter("BucketName")
	if bucketName == "" {
		return errors.WithMessage(errors.InvalidParameters, "missing bucket name")
	}
	mc, er := s.storageClientForDatasource(r.DataSource)
	if er != nil {
		return er
	}
	location := ""
	if reg, o := r.DataSource.StorageConfiguration[object.StorageKeyCustomRegion]; o && reg != "" {
		location = reg
	}
	er = mc.MakeBucket(req.Request.Context(), bucketName, location)
	if er != nil {
		return er
	}
	response := &rest.CreateStorageBucketResponse{
		Success:    true,
		BucketName: bucketName,
	}
	return resp.WriteEntity(response)

}

func (s *Handler) getDataSources(ctx context.Context) ([]*object.DataSource, error) {

	sources := config.SourceNamesForDataServices(common.ServiceDataIndex)
	var dataSources []*object.DataSource
	for _, src := range sources {
		if ds, found, _ := s.loadDataSource(ctx, src); found {
			dataSources = append(dataSources, ds)
		}
	}
	return dataSources, nil
}

func (s *Handler) loadDataSource(ctx context.Context, dsName string) (*object.DataSource, bool, error) {

	var ds *object.DataSource

	err := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+dsName).Scan(&ds)
	if err != nil {
		return nil, false, err
	}

	if ds == nil {
		log.Logger(ctx).Debug(fmt.Sprintf("No datasource found for name [%s]", dsName))
		return nil, false, nil
	}

	if ds.StorageConfiguration != nil {
		if folder, ok := ds.StorageConfiguration[object.StorageKeyFolder]; ok {
			rootPrefix := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects, "allowedLocalDsFolder").String()
			if rootPrefix != "" && strings.HasPrefix(folder, rootPrefix) {
				folder = strings.TrimPrefix(folder, rootPrefix)
			}
			// For the API Output, we want to always expose "/" paths, whatever the OS
			ds.StorageConfiguration[object.StorageKeyFolder] = filesystem.ToNodePath(folder)
		}
	}

	log.Logger(ctx).Debug(fmt.Sprintf("Retrieved datasource [%s]", dsName), zap.Any("datasource", ds))
	return ds, true, nil
}

// findWorkspacesForDatasource loads all workspaces, find their roots in Acls and check if these roots
// belong to the given datasource.
func (s *Handler) findWorkspacesForDatasource(ctx context.Context, dsName string) (bool, error) {

	// List all workspaces
	// List all ACLs
	// Check if Nodes belong to datasource => break
	wsClient := idmc.WorkspaceServiceClient(ctx)
	aclClient := idmc.ACLServiceClient(ctx)
	treeClient := treec.NodeProviderClient(ctx)
	wsSearch, _ := anypb.New(&idm.WorkspaceSingleQuery{
		Scope: idm.WorkspaceScope_ADMIN,
	})
	stream, err := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service2.Query{
		SubQueries: []*anypb.Any{wsSearch},
	}})
	if err != nil {
		return false, err
	}
	var aclSubs []*anypb.Any
	for {
		resp, er := stream.Recv()
		if er != nil {
			break
		}
		q, _ := anypb.New(&idm.ACLSingleQuery{WorkspaceIDs: []string{resp.Workspace.UUID}})
		aclSubs = append(aclSubs, q)
	}

	stream2, err2 := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service2.Query{SubQueries: aclSubs, Operation: service2.OperationType_OR},
	})
	if err2 != nil {
		return false, err
	}
	for {
		resp, er := stream2.Recv()
		if er != nil {
			break
		}
		if resp != nil && resp.ACL.NodeID != "" {
			nodeResp, e := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: resp.ACL.NodeID}})
			if e == nil && nodeResp.Node.GetStringMeta(common.MetaNamespaceDatasourceName) == dsName {
				return true, nil
			}
		}
	}

	return false, nil
}

func removeFullVersioningJob(ctx context.Context, dsName string) error {
	jId := "full-versioning-job-" + dsName
	jobsClient := jobsc.JobServiceClient(ctx)
	to, can := context.WithTimeout(ctx, grpc.CallTimeoutShort)
	defer can()
	_, e := jobsClient.DeleteJob(to, &jobs.DeleteJobRequest{JobID: jId})
	return e
}

func createFullVersioningJob(ctx context.Context, dsName string) error {

	//T := lang.Bundle().T(i18n.GetDefaultLanguage(config.Get()))

	j := &jobs.Job{
		ID:                "full-versioning-job-" + dsName,
		Owner:             common.PydioSystemUsername,
		Label:             "[Versioning] Create new version for all files inside " + dsName,
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		Actions: []*jobs.Action{
			{
				ID: "actions.versioning.create",
				NodesSelector: &jobs.NodesSelector{
					Query: &service2.Query{
						SubQueries: jobs.MustMarshalAnyMultiple(
							&tree.Query{
								Type:       tree.NodeType_LEAF,
								PathPrefix: []string{dsName + "/"},
							},
							&tree.Query{
								FileName: common.PydioSyncHiddenFile,
								Not:      true,
							},
						),
						Operation: service2.OperationType_AND,
					},
				},
			},
		},
	}

	jobsClient := jobsc.JobServiceClient(ctx)
	to, can := context.WithTimeout(ctx, grpc.CallTimeoutShort)
	defer can()
	if _, err := jobsClient.GetJob(to, &jobs.GetJobRequest{JobID: j.ID}); err != nil {
		log.Logger(ctx).Info("Inserting full versioning job")
		_, e := jobsClient.PutJob(to, &jobs.PutJobRequest{Job: j})
		return e
	}

	return nil
}
