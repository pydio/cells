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
	"path"
	"sync"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/client/commons"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/idm/meta"
)

func NewGraphHandler(ctx context.Context) service.WebHandler {
	return &GraphHandler{runtimeContext: ctx}
}

type GraphHandler struct {
	runtimeContext context.Context
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *GraphHandler) SwaggerTags() []string {
	return []string{"GraphService"}
}

// Filter returns a function to filter the swagger path
func (h *GraphHandler) Filter() func(string) string {
	return nil
}

// UserState is an alias for requests without roleID
func (h *GraphHandler) UserState(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil {
		return errors.Tag(err, errors.StatusForbidden)
	}
	state := &rest.UserStateResponse{
		Workspaces:         []*idm.Workspace{},
		WorkspacesAccesses: make(map[string]string),
	}
	aW := accessList.GetWorkspaces()
	for wsId, right := range accessList.DetectedWsRights(ctx) {
		state.WorkspacesAccesses[wsId] = right.String()
		if ws, ok := aW[wsId]; ok {
			state.Workspaces = append(state.Workspaces, ws)
		}
	}
	return rsp.WriteEntity(state)

}

// Relation computes workspaces shared in common, and teams belonging.
func (h *GraphHandler) Relation(req *restful.Request, rsp *restful.Response) error {
	userName := req.PathParameter("UserId")
	ctx := req.Request.Context()
	responseObject := &rest.RelationResponse{}

	// Find all workspaces in common
	contextAccessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil {
		return errors.Tag(err, errors.StatusForbidden)
	}
	targetUserAccessList, _, err := permissions.AccessListFromUser(ctx, userName, false)
	if err != nil {
		return errors.Tag(err, errors.StatusForbidden)
	}
	// Intersect workspace nodes
	contextWorkspaces := contextAccessList.DetectedWsRights(ctx)
	targetWorkspaces := targetUserAccessList.DetectedWsRights(ctx)
	commonWorkspaces := map[string]string{}
	for uWs := range contextWorkspaces {
		if _, has := targetWorkspaces[uWs]; has {
			commonWorkspaces[uWs] = uWs
		}
	}
	for tWs := range targetWorkspaces {
		if _, has := targetWorkspaces[tWs]; has {
			commonWorkspaces[tWs] = tWs
		}
	}
	log.Logger(ctx).Debug("Common Workspaces", zap.Any("common", commonWorkspaces), zap.Any("context", contextWorkspaces), zap.Any("target", targetWorkspaces))

	wsCli := idmc.WorkspaceServiceClient(ctx)
	query := &service2.Query{
		SubQueries: []*anypb.Any{},
		Operation:  service2.OperationType_OR,
	}
	// Cell Workspaces accessible by both users
	for wsId := range commonWorkspaces {
		q, _ := anypb.New(&idm.WorkspaceSingleQuery{
			Uuid:  wsId,
			Scope: idm.WorkspaceScope_ROOM,
		})
		query.SubQueries = append(query.SubQueries, q)
	}
	// Build a ResourcePolicyQuery to restrict next request only to actual visible workspaces
	subjects, e := auth.SubjectsForResourcePolicyQuery(ctx, &rest.ResourcePolicyQuery{
		Type: rest.ResourcePolicyQuery_CONTEXT,
	})
	if e != nil {
		return e
	}
	query.ResourcePolicyQuery = &service2.ResourcePolicyQuery{
		Subjects: subjects,
	}

	log.Logger(ctx).Debug("QUERY", zap.Any("q", query))
	if len(query.SubQueries) > 0 {
		streamer, er := wsCli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: query})
		if e = commons.ForEach(streamer, er, func(t *idm.SearchWorkspaceResponse) error {
			responseObject.SharedCells = append(responseObject.SharedCells, t.GetWorkspace())
			return nil
		}); e != nil {
			return e
		}
	}

	// Load the current user teams, to check if the current user is part of one of them
	roleCli := idmc.RoleServiceClient(ctx)
	var uuids []string
	for _, role := range targetUserAccessList.GetRoles() {
		uuids = append(uuids, role.Uuid)
	}
	roleQ, _ := anypb.New(&idm.RoleSingleQuery{
		Uuid:   uuids,
		IsTeam: true,
	})
	limitSubjects, _ := auth.SubjectsForResourcePolicyQuery(ctx, &rest.ResourcePolicyQuery{Type: rest.ResourcePolicyQuery_CONTEXT})
	rStreamer, e := roleCli.SearchRole(ctx, &idm.SearchRoleRequest{
		Query: &service2.Query{
			SubQueries: []*anypb.Any{roleQ},
			ResourcePolicyQuery: &service2.ResourcePolicyQuery{
				Subjects: limitSubjects,
			},
		},
	})
	if e := commons.ForEach(rStreamer, e, func(t *idm.SearchRoleResponse) error {
		responseObject.BelongsToTeams = append(responseObject.BelongsToTeams, t.GetRole())
		return nil
	}); e != nil {
		return e
	}

	return rsp.WriteEntity(responseObject)

}

// Recommend computes recommendations for home page by loading activities, bookmarks, and finally workspaces
func (h *GraphHandler) Recommend(req *restful.Request, rsp *restful.Response) error {
	request := &rest.RecommendRequest{}
	if e := req.ReadEntity(request); e != nil {
		return e
	}
	ctx := req.Request.Context()

	// Return empty if accessList i  s empty
	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil || len(accessList.GetWorkspaces()) == 0 {
		return rsp.WriteEntity(&rest.RecommendResponse{})
	}
	uName, _ := permissions.FindUserNameInContext(ctx)
	ak := map[string]struct{}{}
	var an, bn []*tree.Node

	router := compose.UuidClient(h.runtimeContext)

	showActivities := config.Get("services", common.ServiceRestNamespace_+common.ServiceGraph, "recommendations", "activities").Default(true).Bool()
	showBookmarks := config.Get("services", common.ServiceRestNamespace_+common.ServiceGraph, "recommendations", "bookmarks").Default(true).Bool()

	wg := &sync.WaitGroup{}
	if showActivities {
		wg.Add(1)
		go func() {
			defer wg.Done()

			// Load activities
			ac := activity.NewActivityServiceClient(grpc.ResolveConn(h.runtimeContext, common.ServiceActivity))
			acReq := &activity.StreamActivitiesRequest{
				Context:     activity.StreamContext_USER_ID,
				ContextData: uName,
				PointOfView: activity.SummaryPointOfView_ACTOR,
				BoxName:     "outbox",
				Limit:       int64(request.Limit) * 2,
			}
			if streamer, er := ac.StreamActivities(ctx, acReq); er == nil {
				for {
					resp, e := streamer.Recv()
					if e != nil {
						break
					}
					a := resp.GetActivity()
					if a.Object == nil || a.Object.Name == "" {
						continue
					}
					if a.Object.Type == activity.ObjectType_Delete {
						continue
					}
					if a.Object.Type != activity.ObjectType_Document && a.Object.Type != activity.ObjectType_Folder {
						continue
					}
					if _, already := ak[a.Object.Id]; already {
						continue
					}
					n := &tree.Node{Uuid: a.Object.Id}
					n.MustSetMeta("reco-annotation", fmt.Sprintf("activity:%d", a.Updated.GetSeconds()))
					an = append(an, n)
					ak[a.Object.Id] = struct{}{}
				}
			}
		}()
	}

	if showBookmarks {
		wg.Add(1)
		go func() {
			defer wg.Done()
			subjects, e := auth.SubjectsForResourcePolicyQuery(ctx, nil)
			if e != nil {
				return
			}
			// Append Subjects
			sr := &idm.SearchUserMetaRequest{
				Namespace: meta.ReservedNamespaceBookmark,
				ResourceQuery: &service2.ResourcePolicyQuery{
					Subjects: subjects,
				},
			}

			userMetaClient := idmc.UserMetaServiceClient(ctx)
			stream, er := userMetaClient.SearchUserMeta(ctx, sr)
			if er != nil {
				return
			}
			for {
				resp, e := stream.Recv()
				if e != nil {
					break
				}
				if resp == nil {
					continue
				}
				node := &tree.Node{Uuid: resp.GetUserMeta().GetNodeUuid()}
				node.MustSetMeta("reco-annotation", "bookmark")
				bn = append(bn, node)
			}
		}()
	}

	wg.Wait()
	t := time.Now()

	for _, n := range bn {
		if _, already := ak[n.Uuid]; already {
			continue
		}
		an = append(an, n)
	}
	resp := &rest.RecommendResponse{}
	throttle := make(chan struct{}, 10)
	nwg := &sync.WaitGroup{}
	nwg.Add(len(an))
	nn := make(chan *tree.Node)
	nnDone := make(chan bool, 1)
	go func() {
		for n := range nn {
			resp.Nodes = append(resp.Nodes, n)
		}
		close(nnDone)
	}()
	for _, n := range an {
		throttle <- struct{}{}
		go func(in *tree.Node) {
			defer func() {
				nwg.Done()
				<-throttle
			}()
			if r, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: in}); er == nil {
				node := r.GetNode()
				if len(node.AppearsIn) == 0 || node.AppearsIn[0].Path == "" { // empty Path = workspace root
					return
				}
				node.Path = path.Join(node.AppearsIn[0].WsSlug, node.AppearsIn[0].Path)
				node.MustSetMeta("reco-annotation", in.GetStringMeta("reco-annotation"))
				node.MustSetMeta("repository_id", node.AppearsIn[0].WsUuid)
				//resp.Nodes = append(resp.Nodes, node.WithoutReservedMetas())
				nn <- node.WithoutReservedMetas()
			}
		}(n)
	}
	nwg.Wait()
	close(nn)
	<-nnDone

	log.Logger(ctx).Debug("--- Load Nodes Time", zap.Duration("nodes", time.Since(t)))

	// Not enough data, load accessible workspaces as nodes
	if len(resp.Nodes) < int(request.Limit) {
		pr := compose.PathClient(h.runtimeContext)
		_ = pr.ListNodesWithCallback(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}}, func(ctx context.Context, node *tree.Node, err error) error {
			if err == nil && node.Type != tree.NodeType_UNKNOWN {
				if wsu := node.GetStringMeta("ws_uuid"); wsu != "" {
					node.MustSetMeta("repository_id", wsu)
					node.MustSetMeta("reco-annotation", "workspace")
				}
				if wsl := node.GetStringMeta("ws_label"); wsl != "" {
					node.MustSetMeta("name", wsl)
				}
				resp.Nodes = append(resp.Nodes, node)
			}
			return nil
		}, false)
	}

	return rsp.WriteEntity(resp)
}
