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

package actions

import (
	"context"
	"fmt"
	"io/ioutil"
	"path"
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/etl/models"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
	models2 "github.com/pydio/cells/common/views/models"
	"github.com/pydio/cells/scheduler/actions"
	json "github.com/pydio/cells/x/jsonx"
)

type MigratePydioMetaAction struct {
	metaMapping map[string]string
	cellAdmin   string
	router      *views.Router
}

func (c *MigratePydioMetaAction) ProvidesProgress() bool {
	return true
}

var (
	MigratePydioMetaActionName = "actions.etl.p8-legacy-meta"
	phpMetaFileName            = ".ajxp_meta"
)

func (c *MigratePydioMetaAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              MigratePydioMetaActionName,
		IsInternal:      true,
		Label:           "Legacy meta from P8",
		Icon:            "",
		Description:     "Pydio 8 migration specific task (do not use manually).",
		Category:        actions.ActionCategoryETL,
		SummaryTemplate: "",
		HasForm:         false,
	}
}

func (c *MigratePydioMetaAction) GetParametersForm() *forms.Form {
	return nil
}

// Unique identifier
func (c *MigratePydioMetaAction) GetName() string {
	return MigratePydioMetaActionName
}

func (c *MigratePydioMetaAction) GetRouter() *views.Router {
	if c.router == nil {
		c.router = views.NewStandardRouter(views.RouterOptions{})
	}
	return c.router
}

func (c *MigratePydioMetaAction) isTemplatePath(rootUuid string) bool {
	manager := views.GetVirtualNodesManager()
	_, ok := manager.ByUuid(rootUuid)
	return ok
}

func (c *MigratePydioMetaAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if mappingJson, ok := action.Parameters["metaMapping"]; !ok {
		return fmt.Errorf("task must take a mapping parameter")
	} else if e := json.Unmarshal([]byte(mappingJson), &c.metaMapping); e != nil {
		return fmt.Errorf("task cannot parse json parameter: " + e.Error())
	}
	if admin, ok := action.Parameters["cellAdmin"]; ok {
		c.cellAdmin = admin
	} else {
		return fmt.Errorf("please provide a cellAdmin parameter to open all accesses")
	}
	return nil
}

// Run performs the actual action code
func (c *MigratePydioMetaAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	msg := "[Meta] Starting migration for files metadata"
	log.TasksLogger(ctx).Info(msg)
	channels.StatusMsg <- msg
	channels.Status <- jobs.TaskStatus_Running

	defer func() {
		channels.StatusMsg <- "Finished parsing files metadata"
		channels.Status <- jobs.TaskStatus_Idle
	}()

	output := input
	// Browse all workspaces
	q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Scope: idm.WorkspaceScope_ADMIN,
	})
	wsClient := idm.NewWorkspaceServiceClient(registry.GetClient(common.ServiceWorkspace))
	s, e := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: &service.Query{SubQueries: []*any.Any{q}},
	})
	if e != nil {
		return input.WithError(e), e
	}
	var commonWorkspaces []string
	var templateWorkspaces []string

	adminCtx, _ := ComputeContextForUser(ctx, c.cellAdmin, nil)

	defer s.Close()
	for {
		r, e := s.Recv()
		if e != nil {
			break
		}
		hasTpl, e := c.WorkspaceHasTemplatePath(ctx, r.Workspace)
		if e != nil {
			log.Logger(ctx).Error("Ignoring workspace", r.Workspace.Zap(), zap.Error(e))
			continue
		}
		if !hasTpl {
			commonWorkspaces = append(commonWorkspaces, r.Workspace.Slug)
		} else {
			templateWorkspaces = append(templateWorkspaces, r.Workspace.Slug)
		}
	}

	for _, slug := range commonWorkspaces {
		e := c.BrowseNodesForMeta(adminCtx, slug, channels)
		if len(e) > 0 {
			return input.WithError(e[0]), e[0]
		}
	}

	// For those with Template Path, impersonate each user
	uClient := idm.NewUserServiceClient(registry.GetClient(common.ServiceUser))
	qU, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
		NodeType: idm.NodeType_USER,
	})
	q2, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
		AttributeName:  idm.UserAttrProfile,
		AttributeValue: common.PydioProfileShared,
		Not:            true,
	})
	q3, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
		Login: common.PydioS3AnonUsername,
		Not:   true,
	})
	st, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{
		Query: &service.Query{SubQueries: []*any.Any{qU, q2, q3}, Operation: service.OperationType_AND},
	})
	if e != nil {
		return input.WithError(e), e
	}
	defer st.Close()
	for {
		r, e := st.Recv()
		if e != nil {
			break
		}
		log.TasksLogger(ctx).Info("Browsing workspaces for user", r.User.ZapLogin())
		channels.StatusMsg <- "[Meta] Browsing workspaces for user " + r.User.Login
		userCtx, e := ComputeContextForUser(ctx, "", r.User)
		if e != nil {
			log.TasksLogger(ctx).Error("Cannot load access list for user", r.User.ZapLogin(), zap.Error(e))
			continue
		}
		for _, slug := range templateWorkspaces {
			e := c.BrowseNodesForMeta(userCtx, slug, channels)
			if len(e) > 0 {
				log.TasksLogger(ctx).Error("Cannot browse workspace "+slug+" for user "+r.User.Login, zap.Error(e[0]))
			}
		}
		<-time.After(100 * time.Millisecond)
	}

	return output, nil
}

func (c *MigratePydioMetaAction) BrowseNodesForMeta(ctx context.Context, slug string, channels *actions.RunnableChannels) []error {
	router := c.GetRouter()
	log.TasksLogger(ctx).Info("Browsing Workspace " + slug + " looking for legacy metadata files")
	metaClient := tree.NewNodeReceiverClient(registry.GetClient(common.ServiceMeta))
	s, e := router.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: slug}, Recursive: true, FilterType: tree.NodeType_LEAF})
	if e != nil {
		return []error{e}
	}
	defer s.Close()
	var metas []*tree.Node
	var errors []error
	for {
		r, e := s.Recv()
		if e != nil {
			break
		}
		if strings.HasSuffix(r.Node.Path, phpMetaFileName) {
			metas = append(metas, r.Node)
		}
	}
	total := len(metas)
	if total > 0 {
		channels.StatusMsg <- fmt.Sprintf("Parsing and converting %d metas file inside %s", len(metas), slug)
	} else {
		channels.StatusMsg <- "No metas files to parse detected"
	}
	for i, metaNode := range metas {
		channels.Progress <- float32(i) / float32(total)
		reader, e := router.GetObject(ctx, metaNode, &models2.GetRequestData{Length: -1})
		if e != nil {
			log.TasksLogger(ctx).Warn("Cannot get node content - skipping", metaNode.Zap(), zap.Error(e))
			errors = append(errors, e)
			continue
		}
		data, e := ioutil.ReadAll(reader)
		if e != nil {
			log.TasksLogger(ctx).Warn("Cannot read buffer content - skipping", metaNode.Zap(), zap.Error(e))
			errors = append(errors, e)
			continue
		}
		reader.Close()
		userMetas, e := models.UserMetasFromPhpData(data)
		if e != nil {
			log.TasksLogger(ctx).Error("Cannot parse meta content - skipping", zap.Any("data", string(data)), metaNode.Zap(), zap.Error(e))
			errors = append(errors, e)
			continue
		}
		for _, userMeta := range userMetas {
			nodePath := path.Join(path.Dir(metaNode.Path), userMeta.NodeName)
			if resp, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: nodePath}}); e == nil && resp.Node != nil {
				// Store Metadata for this node !
				target := resp.Node.Clone()
				i := 0
				for k, v := range userMeta.Meta {
					if ns, ok := c.metaMapping[k]; ok {
						target.SetMeta(ns, v)
						i++
					} else {
						log.Logger(ctx).Debug("Ignoring meta: no associated namespace found for "+k, zap.Any("mapping", c.metaMapping), metaNode.Zap(), zap.Any("metadata", userMeta.Meta))
					}
				}
				if i > 0 {
					_, e := metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: target})
					if e != nil {
						log.TasksLogger(ctx).Error("Cannot store meta for node : ", metaNode.Zap(), resp.Node.Zap(), zap.Any("metadata", userMeta.Meta), zap.Error(e))
					} else {
						log.TasksLogger(ctx).Info("Metadata found for node : ", metaNode.Zap(), resp.Node.Zap(), zap.Any("metadata", userMeta.Meta))
					}
				}
				// TODO Uncomment to Delete original file - NO DON'T IF WE ARE LOOKING DIRECTLY AT THE P8 STORAGE! Should be a separate task
				// router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: metaNode})
			}
		}
	}

	return errors
}

func (c *MigratePydioMetaAction) WorkspaceHasTemplatePath(ctx context.Context, ws *idm.Workspace) (bool, error) {

	acls, err := permissions.GetACLsForWorkspace(ctx, []string{ws.UUID}, &idm.ACLAction{Name: permissions.AclWsrootActionName})
	if err != nil {
		return false, err
	}
	ws.RootNodes = make(map[string]*tree.Node)
	if len(acls) == 0 {
		return false, fmt.Errorf("cannot find root nodes")
	}
	treeClient := c.GetRouter().GetClientsPool().GetTreeClient()
	for _, a := range acls {
		r, e := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: a.NodeID}})
		if e == nil && r != nil {
			return false, nil
		} else if _, ok := views.GetVirtualNodesManager().ByUuid(a.NodeID); ok {
			return true, nil
		} else {
			return false, fmt.Errorf("cannot find root nodes")
		}
	}
	return false, fmt.Errorf("cannot find root nodes")

}

func ComputeContextForUser(ctx context.Context, name string, user *idm.User) (context.Context, error) {
	var userCtx context.Context
	if name != "" {
		accessList, _, e := permissions.AccessListFromUser(ctx, name, false)
		if e != nil {
			return nil, e
		}
		userCtx = context.WithValue(ctx, common.PydioContextUserKey, name)
		userCtx = context.WithValue(userCtx, views.CtxUserAccessListKey{}, accessList)
	} else {
		accessList, e := permissions.AccessListFromRoles(ctx, user.Roles, false, true)
		if e != nil {
			return nil, e
		}
		userCtx = context.WithValue(ctx, common.PydioContextUserKey, user.Login)
		userCtx = context.WithValue(userCtx, views.CtxUserAccessListKey{}, accessList)
	}
	userCtx = context.WithValue(userCtx, views.CtxKeepAccessListKey{}, true)
	return userCtx, nil
}
