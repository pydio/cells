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

	"github.com/emicklei/go-restful"
	"go.uber.org/zap"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	service2 "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
)

/*********************
DATASOURCES MANAGEMENT
*********************/
func (s *Handler) GetDataSource(req *restful.Request, resp *restful.Response) {

	dsName := req.PathParameter("Name")
	if res, err := s.loadDataSource(req.Request.Context(), dsName); err != nil {
		service.RestError500(req, resp, err)
	} else {
		resp.WriteEntity(res)
	}

}

func (s *Handler) PutDataSource(req *restful.Request, resp *restful.Response) {

	var ds object.DataSource
	if err := req.ReadEntity(&ds); err != nil {
		service.RestError500(req, resp, err)
		return
	}
	ctx := req.Request.Context()

	currentSources := utils.ListSourcesFromConfig()
	currentMinios := utils.ListMinioConfigsFromConfig()
	_, update := currentSources[ds.Name]

	minioConfig := utils.FactorizeMinioServers(currentMinios, &ds)
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
	config.Set(utils.IndexServiceTableNames(dsName), "services", "pydio.grpc.data.index."+dsName, "tables")
	// UPDATE SYNC
	config.Set(ds, "services", "pydio.grpc.data.sync."+dsName)
	// UPDATE OBJECTS
	config.Set(minioConfig, "services", "pydio.grpc.data.objects."+minioConfig.Name)

	log.Logger(ctx).Info("Now Store Sources", zap.Any("sources", currentSources), zap.Any("ds", &ds))
	utils.SourceNamesToConfig(currentSources)
	utils.MinioConfigNamesToConfig(currentMinios)

	u, _ := utils.FindUserNameInContext(ctx)
	if u == "" {
		u = "rest"
	}
	if err := config.Save(u, "Create DataSource"); err == nil {
		eventType := object.DataSourceEvent_CREATE
		if update {
			eventType = object.DataSourceEvent_UPDATE
		}
		client.Publish(ctx, client.NewPublication(common.TOPIC_DATASOURCE_EVENT, &object.DataSourceEvent{
			Name:   dsName,
			Type:   eventType,
			Config: &ds,
		}))
		resp.WriteEntity(&ds)
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
	currentSources := utils.ListSourcesFromConfig()

	if _, ok := currentSources[dsName]; !ok {
		service.RestError500(req, resp, fmt.Errorf("Cannot find datasource!"))
		return
	}
	delete(currentSources, dsName)
	utils.SourceNamesToConfig(currentSources)
	config.Del("services", "pydio.grpc.data.index."+dsName)
	config.Del("services", "pydio.grpc.data.sync."+dsName)

	currentMinios := utils.ListMinioConfigsFromConfig()
	if key := utils.UnusedMinioServers(currentMinios, currentSources); key != "" {
		config.Del("services", "pydio.grpc.data.objects."+key)
		delete(currentMinios, key)
		utils.MinioConfigNamesToConfig(currentMinios)
	}

	u, _ := utils.FindUserNameInContext(req.Request.Context())
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

	log.Logger(req.Request.Context()).Info("ListDataSources")

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

	var cfgMap config.Map

	if err := config.Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_INDEX).Scan(&cfgMap); err != nil {
		return nil, err
	}

	sources := cfgMap.StringArray("sources")

	log.Logger(ctx).Info("ListDataSources", zap.Any("sources", sources))
	var dataSources []*object.DataSource
	for _, src := range sources {
		if ds, err := s.loadDataSource(ctx, src); err == nil {
			dataSources = append(dataSources, ds)
		}
	}

	return dataSources, nil
}

func (s *Handler) loadDataSource(ctx context.Context, dsName string) (*object.DataSource, error) {

	var objects *object.DataSource
	if err := config.Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_SYNC_+dsName).Scan(&objects); err != nil {
		return nil, err
	} else {
		log.Logger(ctx).Info("LoadDataSource", zap.Any("objects", objects))
		return objects, nil
	}

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
