//go:build !arm
// +build !arm

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
	"io"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/etl/models"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/acl"
	"github.com/pydio/cells/v4/common/nodes/compose"
	models2 "github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
)

type MigratePydioMetaAction struct {
	common.RuntimeHolder
	metaMapping map[string]string
	cellAdmin   string
	router      nodes.Client
}

var (
	MigratePydioMetaActionName = "actions.etl.p8-legacy-meta"
	phpMetaFileName            = ".ajxp_meta"
)

// ProvidesProgress implements ProgressProvider interface
func (c *MigratePydioMetaAction) ProvidesProgress() bool {
	return true
}

// GetDescription returns action description
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

// GetParametersForm returns a UX form
func (c *MigratePydioMetaAction) GetParametersForm() *forms.Form {
	return nil
}

// GetName returns the unique identifier of this action.
func (c *MigratePydioMetaAction) GetName() string {
	return MigratePydioMetaActionName
}

// GetRouter returns an initialized router
func (c *MigratePydioMetaAction) GetRouter() nodes.Client {
	if c.router == nil {
		c.router = compose.PathClient(c.GetRuntimeContext())
	}
	return c.router
}

// Init passes relevant parameters.
func (c *MigratePydioMetaAction) Init(job *jobs.Job, action *jobs.Action) error {
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
func (c *MigratePydioMetaAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	msg := "[Meta] Starting migration for files metadata"
	log.TasksLogger(ctx).Info(msg)
	channels.StatusMsg <- msg
	channels.Status <- jobs.TaskStatus_Running

	defer func() {
		channels.StatusMsg <- "Finished parsing files metadata"
		channels.Status <- jobs.TaskStatus_Idle
	}()

	output := input.Clone()
	// Browse all workspaces
	q, _ := anypb.New(&idm.WorkspaceSingleQuery{
		Scope: idm.WorkspaceScope_ADMIN,
	})
	wsClient := idm.NewWorkspaceServiceClient(grpc.ResolveConn(c.GetRuntimeContext(), common.ServiceWorkspaceGRPC))
	s, e := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: &service.Query{SubQueries: []*anypb.Any{q}},
	})
	if e != nil {
		return input.WithError(e), e
	}
	var commonWorkspaces []string
	var templateWorkspaces []string

	adminCtx, _ := ComputeContextForUser(ctx, c.cellAdmin, nil)

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
	uClient := idm.NewUserServiceClient(grpc.ResolveConn(c.GetRuntimeContext(), common.ServiceUserGRPC))
	qU, _ := anypb.New(&idm.UserSingleQuery{
		NodeType: idm.NodeType_USER,
	})
	q2, _ := anypb.New(&idm.UserSingleQuery{
		AttributeName:  idm.UserAttrProfile,
		AttributeValue: common.PydioProfileShared,
		Not:            true,
	})
	q3, _ := anypb.New(&idm.UserSingleQuery{
		Login: common.PydioS3AnonUsername,
		Not:   true,
	})
	st, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{
		Query: &service.Query{SubQueries: []*anypb.Any{qU, q2, q3}, Operation: service.OperationType_AND},
	})
	if e != nil {
		return input.WithError(e), e
	}
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
	metaClient := tree.NewNodeReceiverClient(grpc.ResolveConn(c.GetRuntimeContext(), common.ServiceMetaGRPC))
	s, e := router.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: slug}, Recursive: true, FilterType: tree.NodeType_LEAF})
	if e != nil {
		return []error{e}
	}
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
		data, e := io.ReadAll(reader)
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
						target.MustSetMeta(ns, v)
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
				// We do not delete original metadata file if we are looking directly at the P8 storage
				// router.DeleteNode(ctx, &tree.DeleteNodeRequest{N: metaNode})
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
	treeClient := c.GetRouter().GetClientsPool(ctx).GetTreeClient()
	for _, a := range acls {
		r, e := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: a.NodeID}})
		if e == nil && r != nil {
			return false, nil
		} else if _, ok := abstract.GetVirtualNodesManager(c.GetRuntimeContext()).ByUuid(a.NodeID); ok {
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
		userCtx = acl.WithPresetACL(userCtx, accessList)
	} else {
		accessList, e := permissions.AccessListFromRoles(ctx, user.Roles, false, true)
		if e != nil {
			return nil, e
		}
		userCtx = context.WithValue(ctx, common.PydioContextUserKey, user.Login)
		userCtx = acl.WithPresetACL(userCtx, accessList)
	}
	return userCtx, nil
}
