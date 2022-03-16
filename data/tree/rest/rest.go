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

// Package rest exposes a simple API used by admins to query the whole tree directly without going through routers.
package rest

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/acl"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/i18n"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/mtree"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/pydio/cells/v4/common/utils/uuid"
	rest_meta "github.com/pydio/cells/v4/data/meta/rest"
	"github.com/pydio/cells/v4/data/templates"
	"github.com/pydio/cells/v4/scheduler/lang"
)

type Handler struct {
	rest_meta.Handler
}

var (
	providerClient tree.NodeProviderClient
)

func getClient(ctx context.Context) tree.NodeProviderClient {
	if providerClient == nil {
		providerClient = compose.PathClient(ctx, nodes.AsAdmin(), nodes.WithVirtualNodesBrowsing())
	}
	return providerClient
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *Handler) SwaggerTags() []string {
	return []string{"TreeService", "AdminTreeService"}
}

// Filter returns a function to filter the swagger path
func (h *Handler) Filter() func(string) string {
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
		service.RestError404(req, resp, err)
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
	if len(input.Nodes) == 0 {
		service.RestError500(req, resp, fmt.Errorf("please provide at least one node to create"))
		return
	}

	ctx := req.Request.Context()
	output := &rest.NodesCollection{}

	log.Logger(ctx).Debug("Got CreateNodes Request", zap.Any("request", input))
	router := h.GetRouter()
	var session string
	var folderPaths []string
	folderChecks := make(map[string]string)
	if len(input.Nodes) > 1 {
		input.Nodes = h.deduplicateByPath(input.Nodes)
		session = uuid.New()
	}
	for i, n := range input.Nodes {
		if !n.IsLeaf() {
			// Additional folders checks for non-flat storages
			if info, err := router.BranchInfoForNode(ctx, n); err != nil {
				service.RestError500(req, resp, err)
			} else if !info.FlatStorage {
				folderPaths = append(folderPaths, n.Path)
				folderChecks[n.Path] = n.Path
			}

			if session != "" && i == len(input.Nodes)-1 {
				session = common.SyncSessionClose_ + session
			}
			r, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: n, IndexationSession: session})
			if e != nil {
				service.RestError500(req, resp, e)
				if session != "" {
					// Make sure to close the session
					broker.MustPublish(ctx, common.TopicIndexEvent, &tree.IndexEvent{
						SessionForceClose: session,
					})
				}
				return
			}
			output.Children = append(output.Children, r.Node.WithoutReservedMetas())
		} else {
			var reader io.Reader
			var length int64
			meta := map[string]string{}
			if input.TemplateUUID != "" {
				provider := templates.GetProvider()
				node, err := provider.ByUUID(input.TemplateUUID)
				if err != nil {
					service.RestErrorDetect(req, resp, err)
					return
				}
				var e error
				reader, length, e = node.Read()
				if e != nil {
					service.RestError500(req, resp, fmt.Errorf("Cannot read template!"))
					return
				}

			} else {
				contents := " " // Use simple space for empty files
				if n.GetStringMeta(common.MetaNamespaceContents) != "" {
					contents = n.GetStringMeta(common.MetaNamespaceContents)
				}
				meta[common.XContentType] = "text/plain"
				length = int64(len(contents))
				reader = strings.NewReader(contents)
			}
			_, e := router.PutObject(ctx, n, reader, &models.PutRequestData{Size: length, Metadata: meta})
			if e != nil {
				service.RestError500(req, resp, e)
				return
			}
			output.Children = append(output.Children, n.WithoutReservedMetas())
		}
	}

	if session != "" && len(folderPaths) > 0 {
		log.Logger(ctx).Debug("Blocking request before all folders were created (checking .pydio)", zap.Any("remaining", folderChecks))
		pref := mtree.CommonPrefix('/', folderPaths...)
		if _, ok := folderChecks[pref]; ok {
			// Check root folder
			std.Retry(ctx, func() error {
				_, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: pref}})
				if e != nil {
					return e
				}
				delete(folderChecks, pref)
				return nil
			})
		}
		e := std.Retry(ctx, func() error {
			s, e := router.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: pref}, Recursive: true})
			if e != nil {
				return e
			}
			defer s.CloseSend()
			for {
				r, er := s.Recv()
				if er != nil {
					break
				}
				if strings.HasSuffix(r.Node.Path, common.PydioSyncHiddenFile) {
					delete(folderChecks, strings.TrimRight(strings.TrimSuffix(r.Node.Path, common.PydioSyncHiddenFile), "/"))
				}
			}
			if len(folderChecks) > 0 {
				log.Logger(ctx).Debug("Checking that all folders were created", zap.Any("remaining", folderChecks))
				return fmt.Errorf("not all folders detected, retry")
			}
			return nil
		}, 3*time.Second, 50*time.Second)
		if e == nil {
			log.Logger(ctx).Info("Rest CreateNodes successfully passed folders creation checks", zap.Int("created number", len(folderPaths)))
		}
	}
	resp.WriteEntity(output)

}

// DeleteNodes either moves to recycle bin or definitively removes nodes.
func (h *Handler) DeleteNodes(req *restful.Request, resp *restful.Response) {

	var input rest.DeleteNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	} else if len(input.Nodes) == 0 {
		service.RestError500(req, resp, fmt.Errorf("please provide at least one node"))
		return
	}
	if len(input.Nodes) > 1 {
		input.Nodes = h.deduplicateByPath(input.Nodes)
	}

	ctx := req.Request.Context()
	username, _ := permissions.FindUserNameInContext(ctx)
	languages := i18n.UserLanguagesFromRestRequest(req, config.Get())
	T := lang.Bundle().GetTranslationFunc(languages...)
	output := &rest.DeleteNodesResponse{}
	router := h.GetRouter()

	deleteJobs := newDeleteJobs()
	metaClient := tree.NewNodeReceiverClient(grpc.GetClientConnFromCtx(ctx, common.ServiceMeta))

	for _, node := range input.Nodes {
		if read, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node}); er != nil {
			service.RestErrorDetect(req, resp, er)
			return
		} else {
			node = read.Node
		}
		e := router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
			ctx, filtered, _ := inputFilter(ctx, node, "in")
			_, ancestors, e := nodes.AncestorsListFromContext(ctx, filtered, "in", router.GetClientsPool(), false)
			if e != nil {
				return e
			}
			bi, ok := nodes.GetBranchInfo(ctx, "in")
			if !ok {
				return fmt.Errorf("cannot find branch info for this node")
			}
			for _, rootID := range bi.RootUUIDs {
				if rootID == node.Uuid {
					return fmt.Errorf("please do not modify directly the root of a workspace")
				}
			}
			attributes := bi.LoadAttributes()
			if input.RemovePermanently || attributes.SkipRecycle || sourceInRecycle(ctx, filtered, ancestors) {
				// This is a real delete!
				if er := router.WrappedCanApply(ctx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_DELETE, Source: filtered}); er != nil {
					return er
				}
				// Additional check for child locks to secure recycle bin empty operation
				if permissions.HasChildLocks(ctx, filtered) {
					return errors.New("children.locks", "Resource is currently busy, please retry later", 423)
				}
				log.Logger(ctx).Info(fmt.Sprintf("Definitively deleting [%s]", node.GetPath()))
				deleteJobs.Deletes = append(deleteJobs.Deletes, node.GetPath()) // Pass user-scope path
				log.Auditer(ctx).Info(
					fmt.Sprintf("Definitively deleted [%s]", node.GetPath()),
					log.GetAuditId(common.AuditNodeMovedToBin),
					node.ZapUuid(),
					node.ZapPath(),
				)
			} else if recycleRoot, e := findRecycleForSource(ctx, filtered, ancestors); e == nil {
				// Moving to recycle bin
				rPath := strings.TrimSuffix(recycleRoot.Path, "/") + "/" + common.RecycleBinName
				log.Logger(ctx).Info(fmt.Sprintf("Deletion: moving [%s] to recycle bin %s", node.GetPath(), rPath))
				// If moving to recycle, save current path as metadata for later restore operation
				metaNode := &tree.Node{Uuid: ancestors[0].Uuid}
				metaNode.MustSetMeta(common.MetaNamespaceRecycleRestore, ancestors[0].Path)
				if _, e := metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: metaNode, Silent: true}); e != nil {
					log.Logger(ctx).Error("Could not store recycle_restore metadata for node", zap.Error(e))
				}
				deleteJobs.RecycleMoves[rPath] = append(deleteJobs.RecycleMoves[rPath], filtered.Path)
				if _, ok := deleteJobs.RecyclesNodes[rPath]; !ok {
					deleteJobs.RecyclesNodes[rPath] = &tree.Node{Path: rPath, Type: tree.NodeType_COLLECTION}
				}

				// Check permissions
				srcCtx, srcNode, _ := inputFilter(ctx, node, "from")
				_, recycleOut, _ := outputFilter(ctx, deleteJobs.RecyclesNodes[rPath], "to")
				targetCtx, recycleIn, _ := inputFilter(ctx, recycleOut, "to")
				recycleIn.MustSetMeta(common.RecycleBinName, "true")
				if er := router.WrappedCanApply(srcCtx, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_PATH, Source: srcNode, Target: recycleIn}); er != nil {
					return er
				}

				log.Auditer(ctx).Info(
					fmt.Sprintf("Moved [%s] to recycle bin", node.GetPath()),
					log.GetAuditId(common.AuditNodeMovedToBin),
					node.ZapUuid(),
					node.ZapPath(),
				)
			} else {
				// we don't know what to do!
				return fmt.Errorf("cannot find proper root for recycling: %s", e.Error())
			}
			return nil
		})
		if e != nil {
			service.RestErrorDetect(req, resp, e)
			return
		}
	}

	cli := jobs.NewJobServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceJobs))
	moveLabel := T("Jobs.User.MoveRecycle")
	fullPathRouter := compose.PathClientAdmin(h.RuntimeCtx)
	for recyclePath, selectedPaths := range deleteJobs.RecycleMoves {

		// Create recycle bins now, to make sure user is notified correctly
		recycleNode := deleteJobs.RecyclesNodes[recyclePath]
		if _, e := fullPathRouter.ReadNode(ctx, &tree.ReadNodeRequest{Node: recycleNode}); e != nil {
			_, e := fullPathRouter.CreateNode(ctx, &tree.CreateNodeRequest{Node: recycleNode, IndexationSession: "close-create-recycle"})
			if e != nil {
				log.Logger(ctx).Error("Could not create recycle node, it will be created during the move but may not appear to the user")
			} else {
				log.Logger(ctx).Info("Recycle bin created before launching move task", recycleNode.ZapPath())
			}
		}

		jobUuid := "copy-move-" + uuid.New()
		q, _ := anypb.New(&tree.Query{
			Paths: selectedPaths,
		})

		job := &jobs.Job{
			ID:             jobUuid,
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
						Query: &service2.Query{SubQueries: []*anypb.Any{q}},
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

	if len(deleteJobs.Deletes) > 0 {

		taskLabel := T("Jobs.User.Delete")
		jobUuid := "delete-" + uuid.New()
		job := &jobs.Job{
			ID:             jobUuid,
			Owner:          username,
			Label:          taskLabel,
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID: "actions.tree.delete",
					Parameters: map[string]string{
						"scope": "owner",
					},
					NodesSelector: &jobs.NodesSelector{
						Pathes: deleteJobs.Deletes,
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

// CreateSelection creates a temporary selection to be stored and used by a later action, currently only download.
func (h *Handler) CreateSelection(req *restful.Request, resp *restful.Response) {

	var input rest.CreateSelectionRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	} else if len(input.Nodes) == 0 {
		service.RestError500(req, resp, fmt.Errorf("please provide at least one node"))
		return
	}
	if len(input.Nodes) > 1 {
		input.Nodes = h.deduplicateByPath(input.Nodes)
	}
	ctx := req.Request.Context()
	username, _ := permissions.FindUserNameInContext(ctx)
	selectionUuid := uuid.New()
	dcClient := docstore.NewDocStoreClient(grpc.GetClientConnFromCtx(ctx, common.ServiceDocStore))
	data, _ := json.Marshal(input.Nodes)
	if _, e := dcClient.PutDocument(ctx, &docstore.PutDocumentRequest{
		StoreID:    common.DocStoreIdSelections,
		DocumentID: selectionUuid,
		Document: &docstore.Document{
			Owner: username,
			Data:  string(data),
			ID:    selectionUuid,
		},
	}); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	response := &rest.CreateSelectionResponse{
		Nodes:         input.Nodes,
		SelectionUUID: selectionUuid,
	}
	resp.WriteEntity(response)

}

// RestoreNodes moves corresponding nodes to their initial location before deletion.
func (h *Handler) RestoreNodes(req *restful.Request, resp *restful.Response) {

	var input rest.RestoreNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	} else if len(input.Nodes) == 0 {
		service.RestError500(req, resp, fmt.Errorf("please provide at least one node"))
		return
	}
	if len(input.Nodes) > 1 {
		input.Nodes = h.deduplicateByPath(input.Nodes)
	}
	output := &rest.RestoreNodesResponse{}
	ctx := req.Request.Context()
	username, _ := permissions.FindUserNameInContext(ctx)
	languages := i18n.UserLanguagesFromRestRequest(req, config.Get())
	T := lang.Bundle().GetTranslationFunc(languages...)
	moveLabel := T("Jobs.User.DirMove")

	router := h.GetRouter()
	cli := jobs.NewJobServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceJobs))
	restoreTargets := make(map[string]struct{}, len(input.Nodes))

	e := router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
		for _, n := range input.Nodes {
			ctx, filtered, _ := inputFilter(ctx, n, "in")
			r, e := router.GetClientsPool().GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: filtered})
			if e != nil {
				log.Logger(ctx).Error("[restore] Cannot find source node", zap.Error(e))
				return e
			}
			currentFullPath := filtered.Path
			originalFullPath := r.GetNode().GetStringMeta(common.MetaNamespaceRecycleRestore)
			if originalFullPath == "" {
				return fmt.Errorf("cannot find restore location for selected node")
			}
			if _, already := restoreTargets[originalFullPath]; already {
				return fmt.Errorf("trying to restore to nodes on the same location")
			}
			restoreTargets[originalFullPath] = struct{}{}
			if r.GetNode().IsLeaf() {
				moveLabel = T("Jobs.User.FileMove")
			} else {
				moveLabel = T("Jobs.User.DirMove")
			}
			targetNode := &tree.Node{Path: originalFullPath}
			_, ancestors, e := nodes.AncestorsListFromContext(ctx, targetNode, "in", router.GetClientsPool(), true)
			if e != nil {
				return e
			}
			accessList := acl.MustFromContext(ctx)
			if !accessList.CanWrite(ctx, ancestors...) {
				return errors.Forbidden("node.not.writeable", "Original location is not writable")
			}
			log.Logger(ctx).Info("Should restore node", zap.String("from", currentFullPath), zap.String("to", originalFullPath))
			jobUuid := "copy-move-" + uuid.New()
			q, _ := anypb.New(&tree.Query{
				Paths: []string{currentFullPath},
			})
			job := &jobs.Job{
				ID:             jobUuid,
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
							Query: &service2.Query{SubQueries: []*anypb.Any{q}},
						},
					},
				},
			}
			if _, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
				return er
			} else {
				output.RestoreJobs = append(output.RestoreJobs, &rest.BackgroundJobResult{
					Uuid:     jobUuid,
					Label:    moveLabel,
					NodeUuid: r.GetNode().Uuid,
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
		service.RestError500(req, resp, err)
		return
	}

	parentResp, err := getClient(h.RuntimeCtx).ReadNode(req.Request.Context(), &tree.ReadNodeRequest{
		Node:      input.Node,
		StatFlags: input.StatFlags,
	})
	if err != nil {
		service.RestError404(req, resp, err)
		return
	}

	streamer, err := getClient(h.RuntimeCtx).ListNodes(req.Request.Context(), &input)
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}
	defer streamer.CloseSend()
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
		service.RestError500(req, resp, err)
		return
	}

	response, err := getClient(h.RuntimeCtx).ReadNode(req.Request.Context(), &input)
	if err != nil {
		service.RestError500(req, resp, err)
		return
	}

	response.Node = response.Node.WithoutReservedMetas()
	resp.WriteEntity(response)

}

// deduplicateByPath takes a slice of nodes and make sure there are no duplicates based on their path
func (h *Handler) deduplicateByPath(nn []*tree.Node) (out []*tree.Node) {

	seen := make(map[string]struct{}, len(nn))
	j := 0
	for _, n := range nn {
		if _, ok := seen[n.Path]; ok {
			continue
		}
		seen[n.Path] = struct{}{}
		nn[j] = n
		j++
	}
	return nn[:j]

}
