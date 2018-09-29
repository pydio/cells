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

// Package rest exposes a simple API used by admins to query the whole tree directly without going through routers.
package rest

import (
	"strings"

	"github.com/emicklei/go-restful"
	"go.uber.org/zap"

	"fmt"

	"github.com/pborman/uuid"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/common/views"
	rest_meta "github.com/pydio/cells/data/meta/rest"
	"github.com/pydio/cells/scheduler/lang"
)

type Handler struct {
	rest_meta.Handler
}

var (
	providerClient tree.NodeProviderClient
)

func getClient() tree.NodeProviderClient {
	if providerClient == nil {
		providerClient = views.NewStandardRouter(views.RouterOptions{AdminView: true, BrowseVirtualNodes: true, AuditEvent: false})
	}
	return providerClient
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"TreeService", "AdminTreeService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return func(s string) string {
		return strings.Replace(s, "{Node}", "{Node:*}", 1)
	}
}

func (h *Handler) BulkStatNodes(req *restful.Request, resp *restful.Response) {

	// This is exactly the same a MetaService => BulkStatNodes
	h.GetBulkMeta(req, resp)

}

func (h *Handler) HeadNode(req *restful.Request, resp *restful.Response) {

	nodeRequest := &tree.ReadNodeRequest{
		Node: &tree.Node{
			Path: req.PathParameter("Node"),
		},
	}

	router := h.GetRouter()

	response, err := router.ReadNode(req.Request.Context(), nodeRequest)
	if err != nil {
		resp.WriteError(404, err)
		return
	}

	response.Node = response.Node.WithoutReservedMetas()
	resp.WriteEntity(response)

}

func (h *Handler) CreateNodes(req *restful.Request, resp *restful.Response) {

	var input rest.CreateNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	ctx := req.Request.Context()
	output := &rest.NodesCollection{}

	log.Logger(ctx).Info("Got CreateNodes Request", zap.Any("r", input))
	router := h.GetRouter()
	for _, n := range input.Nodes {
		if !n.IsLeaf() {
			r, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: n})
			if e != nil {
				service.RestError500(req, resp, e)
				return
			}
			output.Children = append(output.Children, r.Node)
		} else {
			contents := " " // Use simple space for empty files
			if n.GetStringMeta("Contents") != "" {
				contents = n.GetStringMeta("Contents")
			}
			_, e := router.PutObject(ctx, n, strings.NewReader(contents), &views.PutRequestData{Size: int64(len(contents))})
			if e != nil {
				service.RestError500(req, resp, e)
				return
			}
			output.Children = append(output.Children, n.WithoutReservedMetas())
		}
	}

	resp.WriteEntity(output)

}

func (h *Handler) DeleteNodes(req *restful.Request, resp *restful.Response) {

	var input rest.DeleteNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	ctx := req.Request.Context()
	username, _ := utils.FindUserNameInContext(ctx)
	languages := utils.UserLanguagesFromRestRequest(req)
	T := lang.Bundle().GetTranslationFunc(languages...)
	output := &rest.DeleteNodesResponse{}
	router := h.GetRouter()

	deleteJobs := newDeleteJobs()
	metaClient := tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient())

	for _, node := range input.Nodes {
		read, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
		if er != nil {
			service.RestErrorDetect(req, resp, er)
			return
		}
		if eLock := utils.CheckContentLock(ctx, read.Node); eLock != nil {
			service.RestErrorDetect(req, resp, eLock)
			return
		}
		e := router.WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
			ctx, filtered, _ := inputFilter(ctx, node, "in")
			_, ancestors, e := views.AncestorsListFromContext(ctx, filtered, "in", router.GetClientsPool(), false)
			if e != nil {
				return e
			}
			if sourceInRecycle(ctx, filtered, ancestors) {
				// THIS IS A REAL DELETE NOW !
				log.Logger(ctx).Info("Delete Node: this is a real delete")
				deleteJobs.RealDeletes = append(deleteJobs.RealDeletes, filtered.Path)
			} else if recycleRoot, e := findRecycleForSource(ctx, filtered, ancestors); e == nil {
				// MOVE TO RECYCLE INSTEAD OF DELETING
				log.Logger(ctx).Info("Delete Node / found RecycleRoot : ", zap.Any("n", recycleRoot))
				rPath := strings.TrimSuffix(recycleRoot.Path, "/") + "/" + common.RECYCLE_BIN_NAME
				// If moving to recycle, save current path as metadata for later restore operation
				metaNode := &tree.Node{Uuid: ancestors[0].Uuid}
				metaNode.SetMeta(common.META_NAMESPACE_RECYCLE_RESTORE, ancestors[0].Path)
				if _, e := metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: metaNode, Silent: true}); e != nil {
					log.Logger(ctx).Error("Could not store recycle_restore metadata for node", zap.Error(e))
				}
				deleteJobs.RecycleMoves[rPath] = append(deleteJobs.RecycleMoves[rPath], filtered.Path)
				if _, ok := deleteJobs.RecyclesNodes[rPath]; !ok {
					deleteJobs.RecyclesNodes[rPath] = &tree.Node{Path: rPath, Type: tree.NodeType_COLLECTION}
				}
			} else {
				// we don't know what to do!
				return fmt.Errorf("cannot find proper root for recycling: %s", e.Error())
			}
			return nil
		})
		if e != nil {
			service.RestError500(req, resp, e)
			return
		}
	}

	cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
	moveLabel := T("Jobs.User.MoveRecycle")
	fullPathRouter := views.NewStandardRouter(views.RouterOptions{AdminView: true})
	for recyclePath, selectedPaths := range deleteJobs.RecycleMoves {

		// Create recycle bins now, to make sure user is notified correctly
		recycleNode := deleteJobs.RecyclesNodes[recyclePath]
		if _, e := fullPathRouter.ReadNode(ctx, &tree.ReadNodeRequest{Node: recycleNode}); e != nil {
			_, e := fullPathRouter.CreateNode(ctx, &tree.CreateNodeRequest{Node: recycleNode})
			if e != nil {
				log.Logger(ctx).Error("Could not create recycle node, it will be created during the move but may not appear to the user")
			} else {
				log.Logger(ctx).Info("Recycle bin created before launching move task", recycleNode.ZapPath())
			}
		}

		jobUuid := uuid.New()
		job := &jobs.Job{
			ID:             "copy-move-" + jobUuid,
			Owner:          username,
			Label:          moveLabel,
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID: "actions.tree.copymove",
					Parameters: map[string]string{
						"type":         "move",
						"target":       recyclePath,
						"targetParent": "true",
						"recursive":    "true",
						"create":       "true",
					},
					NodesSelector: &jobs.NodesSelector{
						Pathes: selectedPaths,
					},
				},
			},
		}
		if _, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
			service.RestError500(req, resp, er)
			return
		} else {
			output.DeleteJobs = append(output.DeleteJobs, &rest.BackgroundJobResult{
				Uuid:  jobUuid,
				Label: moveLabel,
			})
		}

	}

	if len(deleteJobs.RealDeletes) > 0 {

		taskLabel := T("Jobs.User.Delete")
		jobUuid := uuid.New()
		job := &jobs.Job{
			ID:             "delete-" + jobUuid,
			Owner:          username,
			Label:          taskLabel,
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID:         "actions.tree.delete",
					Parameters: map[string]string{},
					NodesSelector: &jobs.NodesSelector{
						Pathes: deleteJobs.RealDeletes,
					},
				},
			},
		}
		if _, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
			service.RestError500(req, resp, er)
			return
		} else {
			output.DeleteJobs = append(output.DeleteJobs, &rest.BackgroundJobResult{
				Uuid:  jobUuid,
				Label: taskLabel,
			})
		}

	}

	resp.WriteEntity(output)

}

func (h *Handler) RestoreNodes(req *restful.Request, resp *restful.Response) {

	var input rest.RestoreNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	output := &rest.RestoreNodesResponse{}
	ctx := req.Request.Context()
	username, _ := utils.FindUserNameInContext(ctx)
	languages := utils.UserLanguagesFromRestRequest(req)
	T := lang.Bundle().GetTranslationFunc(languages...)
	moveLabel := T("Jobs.User.DirMove")

	router := h.GetRouter()
	cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))

	e := router.WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
		for _, n := range input.Nodes {
			ctx, filtered, _ := inputFilter(ctx, n, "in")
			r, e := router.GetClientsPool().GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: filtered})
			if e != nil {
				log.Logger(ctx).Error("[restore] Cannot find source node", zap.Error(e))
				return e
			}
			currentFullPath := filtered.Path
			originalFullPath := r.GetNode().GetStringMeta(common.META_NAMESPACE_RECYCLE_RESTORE)
			if originalFullPath == "" {
				return fmt.Errorf("cannot find restore location for selected node")
			}
			if r.GetNode().IsLeaf() {
				moveLabel = T("Jobs.User.FileMove")
			} else {
				moveLabel = T("Jobs.User.DirMove")
			}

			log.Logger(ctx).Info("Should restore node", zap.String("from", currentFullPath), zap.String("to", originalFullPath))
			jobUuid := uuid.New()
			job := &jobs.Job{
				ID:             "copy-move-" + jobUuid,
				Owner:          username,
				Label:          moveLabel,
				Inactive:       false,
				Languages:      languages,
				MaxConcurrency: 1,
				AutoStart:      true,
				AutoClean:      true,
				Actions: []*jobs.Action{
					{
						ID: "actions.tree.copymove",
						Parameters: map[string]string{
							"type":      "move",
							"target":    originalFullPath,
							"recursive": "true",
							"create":    "true",
						},
						NodesSelector: &jobs.NodesSelector{
							Pathes: []string{currentFullPath},
						},
					},
				},
			}
			if _, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
				return er
			} else {
				output.RestoreJobs = append(output.RestoreJobs, &rest.BackgroundJobResult{
					Uuid:  jobUuid,
					Label: moveLabel,
				})
			}
		}

		return nil
	})

	if e != nil {
		service.RestError500(req, resp, e)
	} else {
		resp.WriteEntity(output)
	}

}

func (h *Handler) ListAdminTree(req *restful.Request, resp *restful.Response) {

	var input tree.ListNodesRequest
	if err := req.ReadEntity(&input); err != nil {
		resp.WriteError(500, err)
		return
	}

	parentResp, err := getClient().ReadNode(req.Request.Context(), &tree.ReadNodeRequest{
		Node:        input.Node,
		WithCommits: input.WithCommits,
	})
	if err != nil {
		resp.WriteError(404, err)
		return
	}

	streamer, err := getClient().ListNodes(req.Request.Context(), &input)
	if err != nil {
		resp.WriteError(500, err)
		return
	}
	defer streamer.Close()
	output := &rest.NodesCollection{
		Parent: parentResp.Node.WithoutReservedMetas(),
	}
	for {
		if resp, e := streamer.Recv(); e == nil {
			if resp.Node == nil {
				continue
			}
			output.Children = append(output.Children, resp.Node.WithoutReservedMetas())
		} else {
			break
		}
	}

	resp.WriteEntity(output)

}

func (h *Handler) StatAdminTree(req *restful.Request, resp *restful.Response) {

	var input tree.ReadNodeRequest
	if err := req.ReadEntity(&input); err != nil {
		resp.WriteError(500, err)
		return
	}

	response, err := getClient().ReadNode(req.Request.Context(), &input)
	if err != nil {
		resp.WriteError(500, err)
		return
	}

	response.Node = response.Node.WithoutReservedMetas()
	resp.WriteEntity(response)

}
