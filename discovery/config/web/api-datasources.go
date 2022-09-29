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
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/filesystem"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

/*********************
DATASOURCES MANAGEMENT
*********************/

// GetDataSource retrieves a datasource given its name.
func (s *Handler) GetDataSource(req *restful.Request, resp *restful.Response) {

	dsName := req.PathParameter("Name")
	res, err := s.loadDataSource(req.Request.Context(), dsName)

	if err != nil {
		err = fmt.Errorf("could not to retrieve datasource with name [%s], root cause: %s", dsName, err.Error())
		service.RestError500(req, resp, err)
		return
	}

	if res == nil {
		err = fmt.Errorf("unknown datasource [%s]", dsName)
		service.RestError404(req, resp, err)
		return
	}

	resp.WriteEntity(res)
}

func (s *Handler) PutDataSource(req *restful.Request, resp *restful.Response) {

	var ds object.DataSource
	if err := req.ReadEntity(&ds); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	if ds.Name == "" {
		ds.Name = req.PathParameter("Name")
	}
	if ds.Name == "" {
		service.RestError500(req, resp, fmt.Errorf("cannot create datasource without at least a name"))
		return
	}

	// Replace uuid secret if it exists
	var secretUuid string
	if sec := config.GetSecret(ds.ApiSecret).String(); sec != "" {
		secretUuid = ds.ApiSecret
		ds.ApiSecret = sec
	}

	if reg, _ := regexp.MatchString("^[0-9a-z]*$", ds.Name); !reg {
		service.RestError500(req, resp, fmt.Errorf("datasource name contains an invalid character, please use alphanumeric characters"))
		return
	}

	ctx := req.Request.Context()

	// Handle / and \ for OS
	if ds.StorageType == object.StorageType_LOCAL {
		if err := s.ValidateLocalDSFolderOnPeer(ctx, &ds); err != nil {
			service.RestError500(req, resp, err)
			return
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
	}

	minioConfig, e := config.FactorizeMinioServers(currentMinios, &ds, update)
	if e != nil {
		service.RestError500(req, resp, e)
		return
	}
	currentSources[ds.Name] = &ds
	currentMinios[minioConfig.Name] = minioConfig
	if ds.ApiSecret != "" {
		if secretUuid == "" {
			secretUuid = uuid.New()
			config.SetSecret(secretUuid, ds.ApiSecret)
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

		err = resp.WriteEntity(&ds)
		if err != nil {
			log.Logger(ctx).Warn("could not write response", zap.Error(err))
		}

	} else {
		service.RestError500(req, resp, err)
	}

}

func (s *Handler) DeleteDataSource(req *restful.Request, resp *restful.Response) {

	ctx := req.Request.Context()
	dsName := req.PathParameter("Name")
	if dsName == "" {
		service.RestError500(req, resp, fmt.Errorf("Please provide a data source name"))
		return
	}
	if dsName == config.Get("defaults", "datasource").String() {
		service.RestError500(req, resp, fmt.Errorf("This is the default datasource! Please replace it in your config file before trying to delete."))
		return
	}
	hasWorkspace, err := s.findWorkspacesForDatasource(req.Request.Context(), dsName)
	if err != nil {
		service.RestError500(req, resp, fmt.Errorf("Error while trying to find workspaces for datasource:"+err.Error()))
		return
	} else if hasWorkspace {
		service.RestError500(req, resp, fmt.Errorf("There are workspaces defined on this datasource, please delete them before removing datasource"))
		return
	}
	currentSources := config.ListSourcesFromConfig()

	if existingDS, ok := currentSources[dsName]; !ok {
		service.RestError500(req, resp, fmt.Errorf("Cannot find datasource!"))
		return
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
		service.RestError500(req, resp, e)
		return
	}
	broker.Publish(req.Request.Context(), common.TopicDatasourceEvent, &object.DataSourceEvent{
		Name: dsName,
		Type: object.DataSourceEvent_DELETE,
	})

	resp.WriteEntity(&rest.DeleteDataSourceResponse{
		Success: true,
	})
}

func (s *Handler) ListDataSources(req *restful.Request, resp *restful.Response) {

	if sources, err := s.getDataSources(req.Request.Context()); err != nil {
		service.RestError500(req, resp, err)

	} else {
		resp.WriteEntity(&rest.DataSourceCollection{
			DataSources: sources,
			Total:       int32(len(sources)),
		})
	}
}

// ListStorageBuckets implements corresponding API. Lists available buckets on a remote
// object storage. Currently only supports S3 type storages.
func (s *Handler) ListStorageBuckets(req *restful.Request, resp *restful.Response) {
	var r rest.ListStorageBucketsRequest
	if e := req.ReadEntity(&r); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	if r.DataSource.StorageType != object.StorageType_S3 {
		service.RestError500(req, resp, fmt.Errorf("unsupported datasource type"))
		return
	}
	ds := r.DataSource
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
	cfData.Val("endpoint").Set(host)
	cfData.Val("key").Set(ds.ApiKey)
	cfData.Val("secret").Set(ds.ApiSecret)
	cfData.Val("secure").Set(secure)
	cfData.Val("type").Set("mc")
	if r, o := ds.StorageConfiguration[object.StorageKeyCustomRegion]; o && r != "" {
		cfData.Val("customRegion").Set(object.StorageKeyCustomRegion)
	}
	mc, er := nodes.NewStorageClient(cfData)
	if er != nil {
		service.RestErrorDetect(req, resp, er)
		return
	}
	bb, er := mc.ListBuckets(context.Background())
	if er != nil {
		service.RestErrorDetect(req, resp, er)
		return
	}
	var filter *regexp.Regexp
	if r.BucketsRegexp != "" {
		filter, er = regexp.Compile(r.BucketsRegexp)
		if er != nil {
			service.RestError500(req, resp, er)
			return
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
	resp.WriteEntity(response)

}

func (s *Handler) getDataSources(ctx context.Context) ([]*object.DataSource, error) {

	sources := config.SourceNamesForDataServices(common.ServiceDataIndex)
	var dataSources []*object.DataSource
	for _, src := range sources {
		if ds, err := s.loadDataSource(ctx, src); err == nil {
			dataSources = append(dataSources, ds)
		}
	}
	return dataSources, nil
}

func (s *Handler) loadDataSource(ctx context.Context, dsName string) (*object.DataSource, error) {

	var ds *object.DataSource

	err := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+dsName).Scan(&ds)
	if err != nil {
		return nil, err
	}

	if ds == nil {
		log.Logger(ctx).Debug(fmt.Sprintf("No datasource found for name [%s]", dsName))
		return nil, nil
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
	return ds, nil
}

// findWorkspacesForDatasource loads all workspaces, find their roots in Acls and check if these roots
// belong to the given datasource.
func (s *Handler) findWorkspacesForDatasource(ctx context.Context, dsName string) (bool, error) {

	// List all workspaces
	// List all ACLs
	// Check if Nodes belong to datasource => break
	wsClient := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceWorkspace))
	aclClient := idm.NewACLServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceAcl))
	treeClient := tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(ctx, common.ServiceTree))
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
	jobsClient := jobs.NewJobServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceJobs))
	to, can := context.WithTimeout(ctx, grpc.CallTimeoutShort)
	defer can()
	_, e := jobsClient.DeleteJob(to, &jobs.DeleteJobRequest{JobID: jId})
	return e
}

func createFullVersioningJob(ctx context.Context, dsName string) error {

	//T := lang.Bundle().GetTranslationFunc(i18n.GetDefaultLanguage(config.Get()))

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

	jobsClient := jobs.NewJobServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceJobs))
	to, can := context.WithTimeout(ctx, grpc.CallTimeoutShort)
	defer can()
	if _, err := jobsClient.GetJob(to, &jobs.GetJobRequest{JobID: j.ID}); err != nil {
		log.Logger(ctx).Info("Inserting full versioning job")
		_, e := jobsClient.PutJob(to, &jobs.PutJobRequest{Job: j})
		return e
	}

	return nil
}
