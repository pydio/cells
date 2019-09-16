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
	"path/filepath"
	"regexp"
	"strings"

	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	service2 "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/filesystem"
	"github.com/pydio/cells/common/utils/permissions"
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
		osFolder := filesystem.ToFilePath(ds.StorageConfiguration["folder"])
		rootPrefix := config.Default().Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS, "allowedLocalDsFolder").String("")
		if rootPrefix != "" && !strings.HasPrefix(osFolder, rootPrefix) {
			osFolder = filepath.Join(rootPrefix, osFolder)
		}
		ds.StorageConfiguration["folder"] = osFolder
	}

	currentSources := config.ListSourcesFromConfig()
	currentMinios := config.ListMinioConfigsFromConfig()
	_, update := currentSources[ds.Name]

	minioConfig := config.FactorizeMinioServers(currentMinios, &ds, update)
	currentSources[ds.Name] = &ds
	currentMinios[minioConfig.Name] = minioConfig

	dsName := ds.Name
	// UPDATE INDEX
	if ds.Disabled {
		config.Set(true, "services", "pydio.grpc.data.index."+dsName, "Disabled")
	} else {
		config.Del("services", "pydio.grpc.data.index."+dsName, "Disabled")
	}
	if ds.PeerAddress != "" {
		config.Set(ds.PeerAddress, "services", "pydio.grpc.data.index."+dsName, "PeerAddress")
	} else {
		config.Del("services", "pydio.grpc.data.index."+dsName, "PeerAddress")
	}
	config.Set("default", "services", "pydio.grpc.data.index."+dsName, "dsn")
	config.Set(config.IndexServiceTableNames(dsName), "services", "pydio.grpc.data.index."+dsName, "tables")
	// UPDATE SYNC
	config.Set(ds, "services", "pydio.grpc.data.sync."+dsName)
	// UPDATE OBJECTS
	config.Set(minioConfig, "services", "pydio.grpc.data.objects."+minioConfig.Name)

	log.Logger(ctx).Info("Now Store Sources", zap.Any("sources", currentSources), zap.Any("ds", &ds))
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
		}

		if err = client.Publish(ctx, client.NewPublication(common.TOPIC_DATASOURCE_EVENT, &object.DataSourceEvent{
			Name:   dsName,
			Type:   eventType,
			Config: &ds,
		})); err != nil {
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

	dsName := req.PathParameter("Name")
	if dsName == "" {
		service.RestError500(req, resp, fmt.Errorf("Please provide a data source name"))
		return
	}
	if dsName == config.Get("defaults", "datasource").String("") {
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

	if _, ok := currentSources[dsName]; !ok {
		service.RestError500(req, resp, fmt.Errorf("Cannot find datasource!"))
		return
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
	cl := defaults.NewClient()
	cl.Publish(req.Request.Context(), cl.NewPublication(common.TOPIC_DATASOURCE_EVENT, &object.DataSourceEvent{
		Name: dsName,
		Type: object.DataSourceEvent_DELETE,
	}))
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

func (s *Handler) getDataSources(ctx context.Context) ([]*object.DataSource, error) {

	sources := config.SourceNamesForDataServices(common.SERVICE_DATA_INDEX)
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

	err := config.Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_+dsName).Scan(&ds)
	if err != nil {
		return nil, err
	}

	if ds == nil {
		log.Logger(ctx).Debug(fmt.Sprintf("No datasource found for name [%s]", dsName))
		return nil, nil
	}

	folder := ds.StorageConfiguration["folder"]
	rootPrefix := config.Default().Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS, "allowedLocalDsFolder").String("")
	if rootPrefix != "" && strings.HasPrefix(folder, rootPrefix) {
		folder = strings.TrimPrefix(folder, rootPrefix)
	}
	// For the API Output, we want to always expose "/" paths, whatever the OS
	ds.StorageConfiguration["folder"] = filesystem.ToNodePath(folder)

	log.Logger(ctx).Debug(fmt.Sprintf("Retrieved datasource [%s]", dsName), zap.Any("datasource", ds))
	return ds, nil
}

// findWorkspacesForDatasource loads all workspaces, find their roots in Acls and check if these roots
// belong to the given datasource.
func (s *Handler) findWorkspacesForDatasource(ctx context.Context, dsName string) (bool, error) {

	// List all workspaces
	// List all ACLs
	// Check if Nodes belong to datasource => break
	wsClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	treeClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, defaults.NewClient())
	wsSearch, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Scope: idm.WorkspaceScope_ADMIN,
	})
	stream, err := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service2.Query{
		SubQueries: []*any.Any{wsSearch},
	}})
	if err != nil {
		return false, err
	}
	aclSubs := []*any.Any{}
	defer stream.Close()
	for {
		resp, er := stream.Recv()
		if er != nil {
			break
		}
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{WorkspaceIDs: []string{resp.Workspace.UUID}})
		aclSubs = append(aclSubs, q)
	}

	stream2, err2 := aclClient.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service2.Query{SubQueries: aclSubs, Operation: service2.OperationType_OR},
	})
	if err2 != nil {
		return false, err
	}
	defer stream2.Close()
	for {
		resp, er := stream2.Recv()
		if er != nil {
			break
		}
		if resp != nil && resp.ACL.NodeID != "" {
			nodeResp, e := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: resp.ACL.NodeID}})
			if e == nil && nodeResp.Node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME) == dsName {
				return true, nil
			}
		}
	}

	return false, nil
}
