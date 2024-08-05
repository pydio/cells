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
	"net/url"
	"path"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/pydio-sdk-go/config"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/etl"
	"github.com/pydio/cells/v4/common/etl/stores/pydio8"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
)

type MigrateGlobalMetaAction struct {
	common.RuntimeHolder
	remoteUrl        *url.URL
	remoteUser       string
	remotePassword   string
	remoteSkipVerify bool
	mapping          map[string]string

	cellAdmin string
	router    nodes.Client
	slugs     map[string]string
}

var (
	MigrateGlobalMetaName = "actions.etl.p8-global-meta"
)

// GetDescription returns action description
func (c *MigrateGlobalMetaAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              MigrateGlobalMetaName,
		IsInternal:      true,
		Label:           "Global meta from P8",
		Icon:            "",
		Description:     "Pydio 8 migration specific task (do not use manually).",
		Category:        actions.ActionCategoryETL,
		SummaryTemplate: "",
		HasForm:         false,
	}
}

// GetParametersForm returns a UX form
func (c *MigrateGlobalMetaAction) GetParametersForm() *forms.Form {
	return nil
}

// GetName returns the unique identifier of this action.
func (c *MigrateGlobalMetaAction) GetName() string {
	return MigrateGlobalMetaName
}

// GetRouter returns an initialized router
func (c *MigrateGlobalMetaAction) GetRouter() nodes.Client {
	if c.router == nil {
		c.router = compose.PathClient(c.GetRuntimeContext())
	}
	return c.router
}

// Init passes relevant parameters.
func (c *MigrateGlobalMetaAction) Init(job *jobs.Job, action *jobs.Action) error {
	var ok bool
	if paramUrl, ok := action.Parameters["url"]; !ok {
		return fmt.Errorf("task sync user must take a url parameter")
	} else {
		var e error
		if c.remoteUrl, e = url.Parse(paramUrl); e != nil {
			return fmt.Errorf("cannot parse remote url")
		}
	}
	if c.remoteUser, ok = action.Parameters["user"]; !ok {
		return fmt.Errorf("task sync user must take a user parameter")
	}
	if c.remotePassword, ok = action.Parameters["password"]; !ok {
		return fmt.Errorf("task sync user must take a password parameter")
	}
	if skipVerify, ok := action.Parameters["skipVerify"]; ok && skipVerify == "true" {
		c.remoteSkipVerify = true
	}
	if mappingJson, ok := action.Parameters["mapping"]; !ok {
		return fmt.Errorf("task sync user must take a mapping parameter")
	} else {
		if e := json.Unmarshal([]byte(mappingJson), &c.mapping); e != nil {
			return fmt.Errorf("task sync cannot parse json parameter: " + e.Error())
		}
	}
	if admin, ok := action.Parameters["cellAdmin"]; ok {
		c.cellAdmin = admin
	} else {
		return fmt.Errorf("please provide a cellAdmin parameter to open all accesses")
	}

	c.slugs = make(map[string]string)
	return nil
}

func (c *MigrateGlobalMetaAction) loadMeta(ctx context.Context, conf *config.SdkConfig, mapping map[string]string, progress chan etl.MergeOperation) error {

	v1 := &pydio8.ClientV1{}
	data, e := v1.ListP8GlobalMeta(conf)
	if e != nil {
		return e
	}
	adminCtx, e := ComputeContextForUser(ctx, c.cellAdmin, nil)
	if e != nil {
		log.TasksLogger(ctx).Error("Cannot load access list for user", zap.Any("login", c.cellAdmin), zap.Error(e))
		return e
	}
	subClient := activity.NewActivityServiceClient(grpc.ResolveConn(ctx, common.ServiceActivityGRPC))
	metaClient := idmc.UserMetaServiceClient(ctx)
	log.TasksLogger(ctx).Info("Global Meta", zap.Int("data length", len(data)))
	for wsId, users := range data {
		slug := c.FindSlug(ctx, wsId)
		if slug == "" {
			continue
		}
		for user, nodes := range users {
			var userCtx context.Context
			if user == pydio8.P8GlobalMetaSharedUser {
				userCtx = adminCtx
			} else {
				// Load User Context
				userCtx, e = ComputeContextForUser(ctx, user, nil)
				if e != nil {
					log.TasksLogger(ctx).Warn("Cannot load access list for user - skipping", zap.Any("login", user), zap.Error(e))
					continue
				}
			}
			for nodePath, nodeMetas := range nodes {
				// Find N
				reqNode := &tree.Node{Path: path.Join(slug, nodePath)}
				r, e := c.GetRouter().ReadNode(userCtx, &tree.ReadNodeRequest{Node: reqNode})
				if e != nil {
					log.TasksLogger(ctx).Error("Cannot find node", reqNode.ZapPath(), zap.Error(e))
					continue
				}
				for watchUser, watchType := range nodeMetas.Watches {
					// Set Watch for user
					desc := fmt.Sprintf("Should set watch %s for user %s on node %s", watchType, watchUser, r.Node.Path)
					var events []string
					if watchType == pydio8.P8GlobalMetaWatchBoth || watchType == pydio8.P8GlobalMetaWatchChange {
						events = append(events, "change")
					} else if watchType == pydio8.P8GlobalMetaWatchBoth || watchType == pydio8.P8GlobalMetaWatchRead {
						events = append(events, "read")
					}
					_, e := subClient.Subscribe(userCtx, &activity.SubscribeRequest{
						Subscription: &activity.Subscription{
							UserId:     user,
							ObjectType: activity.OwnerType_NODE,
							ObjectId:   r.Node.Uuid,
							Events:     events,
						},
					})
					if e != nil {
						progress <- etl.MergeOperation{Description: desc, Error: e}
					} else {
						log.TasksLogger(ctx).Info(desc)
						progress <- etl.MergeOperation{Description: desc}
					}
				}
				for bmUser := range nodeMetas.Bookmark {
					desc := fmt.Sprintf("Should set bookmark for user %s on node %s", bmUser, r.Node.Path)
					builder := service.NewResourcePoliciesBuilder()
					builder = builder.WithUserWrite(user)
					builder = builder.WithUserRead(user)
					builder = builder.WithOwner(user)
					_, e := metaClient.UpdateUserMeta(userCtx, &idm.UpdateUserMetaRequest{
						Operation: idm.UpdateUserMetaRequest_PUT,
						MetaDatas: []*idm.UserMeta{{
							NodeUuid:     r.Node.Uuid,
							ResolvedNode: r.Node,
							Namespace:    "bookmark",
							JsonValue:    "\"true\"",
							Policies:     builder.Policies(),
						}},
					})
					if e != nil {
						progress <- etl.MergeOperation{Description: desc, Error: e}
					} else {
						log.TasksLogger(ctx).Info(desc)
						progress <- etl.MergeOperation{Description: desc}
					}
				}
			}
		}
	}

	return nil
}

// Run the actual action code
func (c *MigrateGlobalMetaAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	channels.StatusMsg <- "[Global Meta] Initializing Migrate Global Meta..."

	progress := make(chan etl.MergeOperation)
	finished := make(chan bool)
	defer close(progress)
	defer close(finished)
	var pgErrors []error
	var messages []string

	go func() {
		for {
			select {
			case op := <-progress:
				channels.StatusMsg <- op.Description
				log.Logger(ctx).Info("[Global Meta]", zap.Any("op", op))
				if op.Total > 0 {
					channels.Progress <- float32(op.Cursor) / float32(op.Total)
				}
				if op.Error != nil {
					pgErrors = append(pgErrors, op.Error)
				} else {
					messages = append(messages, op.Description)
				}
			case <-finished:
				return
			}
		}
	}()

	conf := &config.SdkConfig{
		Protocol:   c.remoteUrl.Scheme,
		Url:        c.remoteUrl.Host,
		Path:       c.remoteUrl.Path,
		User:       c.remoteUser,
		Password:   c.remotePassword,
		SkipVerify: c.remoteSkipVerify,
	}

	e := c.loadMeta(ctx, conf, c.mapping, progress)
	finished <- true
	if e != nil {
		return input.WithError(e), e
	}

	// Compute message output
	output := input.Clone()
	data, _ := json.Marshal(map[string]interface{}{
		"msg":    messages,
		"errors": pgErrors,
	})
	actionOutput := &jobs.ActionOutput{
		Success:    len(pgErrors) == 0,
		StringBody: "Finished Migrating Global Meta: \n" + strings.Join(messages, ",\n"),
		JsonBody:   data,
	}
	var gE error
	if len(pgErrors) > 0 {
		gE = pgErrors[0]
		actionOutput.ErrorString = gE.Error()
	}
	output.AppendOutput(actionOutput)
	log.Logger(ctx).Info("Returning output: ", zap.Any("output", output))
	return output, gE
}

func (c *MigrateGlobalMetaAction) FindSlug(ctx context.Context, p8WsId string) string {

	if loaded, ok := c.slugs[p8WsId]; ok {
		return loaded
	}

	mapped, ok := c.mapping[p8WsId]
	if !ok {
		c.slugs[p8WsId] = ""
		return ""
	}

	if ws, er := permissions.SearchUniqueWorkspace(ctx, mapped, ""); er != nil {
		c.slugs[p8WsId] = ""
		return ""
	} else {
		c.slugs[p8WsId] = ws.GetSlug()
		return ws.GetSlug()
	}
	/*
		wsClient := idm.NewWorkspaceServiceClient(grpc.ResolveConn(ctx, common.ServiceWorkspace))
		q, _ := anypb.New(&idm.WorkspaceSingleQuery{Uuid: mapped})
		s, e := wsClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
		if e != nil {
			c.slugs[p8WsId] = ""
			return ""
		}
		for {
			r, e := s.Recv()
			if e != nil {
				break
			}
			c.slugs[p8WsId] = r.Workspace.GetSlug()
			return c.slugs[p8WsId]
		}
		c.slugs[p8WsId] = ""
		return ""
	*/

}
