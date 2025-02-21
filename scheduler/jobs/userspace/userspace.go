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

package userspace

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"path"
	"slices"
	"strings"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/client/commons/treec"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware/keys"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/filesystem"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/data/templates"
	grpc_jobs "github.com/pydio/cells/v5/scheduler/jobs/grpc"
	"github.com/pydio/cells/v5/scheduler/lang"
)

func DeleteNodesTask(ctx context.Context, router nodes.Client, selectedPaths []string, permanently bool, languages ...string) ([]*jobs.Job, error) {

	var jj []*jobs.Job
	username, _ := permissions.FindUserNameInContext(ctx)
	T := lang.Bundle().T(languages...)
	selectedPaths = std.Unique(selectedPaths)

	delJobs := NewDeleteJobs()
	metaClient := treec.ServiceNodeReceiverClient(ctx, common.ServiceMeta)

	for _, nodePath := range selectedPaths {
		read, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: nodePath}})
		if er != nil {
			return nil, er
		}
		node := read.GetNode()

		e := router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
			ctx, filtered, _ := inputFilter(ctx, node, "in")
			_, ancestors, e := nodes.AncestorsListFromContext(ctx, filtered, "in", false)
			if e != nil {
				return e
			}
			bi, er := nodes.GetBranchInfo(ctx, "in")
			if er != nil {
				return er
			}
			for _, rootID := range bi.RootUUIDs {
				if rootID == node.Uuid {
					return fmt.Errorf("please do not modify directly the root of a workspace")
				}
			}
			attributes := bi.LoadAttributes()
			if permanently || attributes.SkipRecycle || SourceInRecycle(ctx, filtered, ancestors) {
				// This is a real delete!
				if er := router.WrappedCanApply(ctx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_DELETE, Source: filtered}); er != nil {
					return er
				}
				// Additional check for child locks to secure recycle bin empty operation
				if permissions.HasChildrenLocks(ctx, filtered) {
					return errors.WithStack(errors.StatusLocked)
				}
				log.Logger(ctx).Info(fmt.Sprintf("Definitively deleting [%s]", node.GetPath()))
				delJobs.Deletes = append(delJobs.Deletes, node.GetPath()) // Pass user-scope path
				log.Auditer(ctx).Info(
					fmt.Sprintf("Definitively deleted [%s]", node.GetPath()),
					log.GetAuditId(common.AuditNodeMovedToBin),
					node.ZapUuid(),
					node.ZapPath(),
				)
			} else if recycleRoot, e := FindRecycleForSource(ctx, filtered, ancestors); e == nil {
				// Moving to recycle bin
				rPath := strings.TrimSuffix(recycleRoot.Path, "/") + "/" + common.RecycleBinName
				log.Logger(ctx).Info(fmt.Sprintf("Deletion: moving [%s] to recycle bin %s", node.GetPath(), rPath))
				// If moving to recycle, save current path as metadata for later restore operation
				metaNode := &tree.Node{Uuid: ancestors[0].Uuid}
				metaNode.MustSetMeta(common.MetaNamespaceRecycleRestore, ancestors[0].Path)
				if _, e := metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: metaNode, Silent: true}); e != nil {
					log.Logger(ctx).Error("Could not store recycle_restore metadata for node", zap.Error(e))
				}
				if _, ok := delJobs.RecycleMoves[rPath]; !ok {
					delJobs.RecycleMoves[rPath] = &RecycleMoves{Workspace: bi.Workspace}
				}
				if _, ok := delJobs.RecyclesNodes[rPath]; !ok {
					delJobs.RecyclesNodes[rPath] = &tree.Node{Path: rPath, Type: tree.NodeType_COLLECTION}
				}
				delJobs.RecycleMoves[rPath].Sources = append(delJobs.RecycleMoves[rPath].Sources, filtered.Path)

				// Check permissions
				srcCtx, srcNode, _ := inputFilter(ctx, node, "from")
				_, recycleOut, _ := outputFilter(ctx, delJobs.RecyclesNodes[rPath], "to")
				targetCtx, recycleIn, _ := inputFilter(ctx, recycleOut, "to")
				recycleIn.MustSetMeta(common.RecycleBinName, "true")
				if er := router.WrappedCanApply(srcCtx, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_PATH, Source: srcNode, Target: recycleIn}); er != nil {
					return er
				}

				log.Auditer(ctx).Info(
					fmt.Sprintf("Moving [%s] to recycle bin", node.GetPath()),
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
			return nil, e
		}
	}

	cli := jobsc.JobServiceClient(ctx)
	moveLabel := T("Jobs.User.MoveRecycle")
	fullPathRouter := compose.PathClientAdmin()
	for recyclePath, rMoves := range delJobs.RecycleMoves {

		// Create recycle bins now, to make sure user is notified correctly
		recycleNode := delJobs.RecyclesNodes[recyclePath]
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
			Paths: rMoves.Sources,
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
						Query: &service.Query{SubQueries: []*anypb.Any{q}},
					},
				},
			},
		}
		ctx = propagator.WithAdditionalMetadata(ctx, map[string]string{
			keys.CtxWorkspaceUuid: rMoves.Workspace.UUID,
		})
		if resp, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
			return nil, er
		} else {
			jj = append(jj, resp.GetJob())
		}
	}

	if len(delJobs.Deletes) > 0 {

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
						Pathes: delJobs.Deletes,
					},
				},
			},
		}
		if resp, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
			return nil, er
		} else {
			jj = append(jj, resp.GetJob())
		}

	}

	return jj, nil
}

func CompressTask(ctx context.Context, router nodes.Client, selectedPaths []string, targetNodePath string, format string, languages ...string) (*jobs.Job, error) {

	T := lang.Bundle().T(languages...)
	selectedPaths = std.Unique(selectedPaths)
	var out *jobs.Job
	jobUuid := "compress-folders-" + uuid.New()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name
	permError := errors.WithMessage(errors.StatusForbidden, "Some files or folder are not allowed to be read or downloaded, you cannot build this archive")
	if format != "zip" && format != "tar" && format != "tar.gz" {
		return nil, fmt.Errorf("unsupported format, please use one of zip, tar or tar.gz")
	}
	initialPaths := append([]string{}, selectedPaths...)
	initialTarget := targetNodePath

	err := router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {

		var targetSize int64
		for _, p := range selectedPaths {
			node := &tree.Node{Path: p}
			srcCtx, node, nodeErr := inputFilter(ctx, node, "in")
			if nodeErr != nil {
				return nodeErr
			}
			node.MustSetMeta("acl-check-download", true)
			if err := router.WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: node}); err != nil {
				return permError
			}
			resp, e := router.GetClientsPool(ctx).GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if e != nil {
				return e
			}
			/*
				if !resp.GetNode().IsLeaf() {
					// Check children for permissions as well
					childrenStream, e := router.GetClientsPool().GetTreeClient().ListNodes(ctx, &tree.ListNodesRequest{Node: node, Recursive: true})
					if e != nil {
						return e
					}
					for {
						c, er := childrenStream.Recv()
						if er != nil {
							break
						}
						cNode := c.GetNode()
						cNode.MustSetMeta("acl-check-download", true)
						if err := router.WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: cNode}); err != nil {
							childrenStream.Close()
							return permError
						}
					}
					childrenStream.Close()
				}*/
			targetSize += resp.GetNode().GetSize()
			//selectedPaths[i] = node.Path
		}

		if targetNodePath != "" {
			node := &tree.Node{Path: targetNodePath}
			targetCtx, node, nodeErr := inputFilter(ctx, node, "in")
			if nodeErr != nil {
				log.Logger(ctx).Error("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
				return nodeErr
			}
			// Assume archive size will be as big as all files (we cannot not know in advance)
			node.Size = targetSize
			if err := router.WrappedCanApply(nil, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: node}); err != nil {
				return err
			}
			//targetNodePath = node.Path
		}

		params := map[string]string{
			"format": format,
			"target": initialTarget,
			"scope":  "owner",
		}
		if e := disallowTemplate(params); e != nil {
			return e
		}

		job := &jobs.Job{
			ID:             jobUuid,
			Owner:          userName,
			Label:          T("Jobs.User.Compress"),
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID:         "actions.archive.compress",
					Parameters: params,
					NodesSelector: &jobs.NodesSelector{
						Collect: true,
						Pathes:  initialPaths,
					},
				},
			},
		}

		resp, er := jobsc.JobServiceClient(ctx).PutJob(ctx, &jobs.PutJobRequest{Job: job})
		if er == nil {
			out = resp.GetJob()
		}
		return er

	})

	return out, err

}

func ExtractTask(ctx context.Context, router nodes.Client, selectedNode string, targetPath string, format string, languages ...string) (*jobs.Job, error) {

	jobUuid := "extract-archive-" + uuid.New()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name
	T := lang.Bundle().T(languages...)
	initialTargetPath := targetPath
	var out *jobs.Job

	err := router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {

		node := &tree.Node{Path: selectedNode}
		srcCtx, node, nodeErr := inputFilter(ctx, node, "in")
		if nodeErr != nil {
			log.Logger(ctx).Error("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
			return nodeErr
		}
		if err := router.WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: node}); err != nil {
			return err
		}
		var archiveSize int64
		if resp, e := router.GetClientsPool(ctx).GetTreeClient().ReadNode(srcCtx, &tree.ReadNodeRequest{Node: node}); e != nil {
			return e
		} else {
			archiveSize = resp.GetNode().GetSize()
		}

		targetNode := &tree.Node{Path: targetPath}
		if targetPath == "" {
			targetNode.Path = path.Dir(selectedNode)
		}
		targetCtx, realNode, nodeErr := inputFilter(ctx, targetNode, "in")
		if nodeErr != nil {
			log.Logger(ctx).Error("Filtering Input Node", zap.Any("node", targetNode), zap.Error(nodeErr))
			return nodeErr
		}
		if targetPath != "" {
			targetPath = realNode.Path
		}
		realNode.Size = archiveSize
		if err := router.WrappedCanApply(nil, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: realNode}); err != nil {
			return err
		}

		params := map[string]string{
			"format": format,
			"scope":  "owner",
			"target": initialTargetPath,
		}
		if e := disallowTemplate(params); e != nil {
			return e
		}

		job := &jobs.Job{
			ID:             jobUuid,
			Owner:          userName,
			Label:          T("Jobs.User.Extract"),
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID:         "actions.archive.extract",
					Parameters: params,
					NodesSelector: &jobs.NodesSelector{
						Pathes: []string{selectedNode},
					},
				},
			},
		}

		resp, err := jobsc.JobServiceClient(ctx).PutJob(ctx, &jobs.PutJobRequest{Job: job})
		if err == nil {
			out = resp.GetJob()
		}
		return err

	})

	return out, err

}

func CopyMoveTask(ctx context.Context, router nodes.Client, selectedPaths []string, targetNodePath string, targetIsParent bool, move bool, languages ...string) (*jobs.Job, error) {

	T := lang.Bundle().T(languages...)
	selectedPaths = std.Unique(selectedPaths)

	taskType := "copy"
	taskLabel := T("Jobs.User.DirCopy")
	if move {
		taskType = "move"
		taskLabel = T("Jobs.User.DirMove")
	}

	var outJob *jobs.Job
	jobUuid := "copy-move-" + uuid.New()
	userName, _ := permissions.FindUserNameInContext(ctx)

	sourceId := "in"
	targetId := "in"
	if move {
		sourceId = "from"
		targetId = "to"
	}
	var ownerPaths []string
	ownerPaths = append(ownerPaths, selectedPaths...)
	ownerTarget := targetNodePath

	err := router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {

		var dir, base string
		if targetIsParent {
			dir = targetNodePath
		} else {
			dir, base = path.Split(targetNodePath)
		}
		targetNode := &tree.Node{Path: dir}
		targetCtx, targetNode, nodeErr := inputFilter(ctx, targetNode, targetId)
		if nodeErr != nil {
			log.Logger(ctx).Error("Filtering Input Node Parent", zap.Any("node", targetNode), zap.Error(nodeErr))
			return nodeErr
		}

		var targetParent = ""
		if targetIsParent {
			targetNodePath = targetNode.Path
			targetParent = "true"
		} else {
			targetNodePath = targetNode.Path + "/" + base
		}

		var createSize int64
		var loadedNodes []*tree.Node
		for i, p := range selectedPaths {
			node := &tree.Node{Path: p}
			srcCtx, node, nodeErr := inputFilter(ctx, node, sourceId)
			if nodeErr != nil {
				return nodeErr
			}
			if rErr := router.WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: node}); rErr != nil {
				return rErr
			}
			r, e := router.GetClientsPool(ctx).GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: node.Path}})
			if e != nil {
				return e
			}
			createSize += r.Node.Size
			targetNode.Size = r.Node.Size
			checkNode := targetNode.Clone()
			if !targetIsParent { // Use real target to eventually check for name / extension
				checkNode.Path = targetNodePath
			}
			if move {
				if sErr := router.WrappedCanApply(srcCtx, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_PATH, Source: r.Node, Target: checkNode}); sErr != nil {
					return sErr
				}
			} else {
				if er := router.WrappedCanApply(nil, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_CONTENT, Target: checkNode}); er != nil {
					return er
				}
			}
			loadedNodes = append(loadedNodes, r.Node)
			selectedPaths[i] = node.Path
		}

		if len(loadedNodes) > 1 {
			if move {
				taskLabel = T("Jobs.User.MultipleMove")
			} else {
				taskLabel = T("Jobs.User.MultipleCopy")
				// Additional pre-check for full copy size
				targetNode.Size = createSize
				if er := router.WrappedCanApply(nil, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: targetNode}); er != nil {
					return er
				}
			}
		} else if len(loadedNodes) == 1 && loadedNodes[0].IsLeaf() {
			if move {
				taskLabel = T("Jobs.User.FileMove")
			} else {
				taskLabel = T("Jobs.User.FileCopy")
			}
		}

		var pZap zapcore.Field
		if len(selectedPaths) > 20 {
			pZap = log.DangerouslyZapSmallSlice("20 first paths", selectedPaths[:20])
		} else {
			pZap = log.DangerouslyZapSmallSlice("paths", selectedPaths)
		}
		log.Logger(ctx).Info("Creating copy/move job", pZap, zap.String("target", targetNodePath))
		if move && strings.Contains(targetNodePath, common.RecycleBinName) {
			// Update node meta before moving
			metaClient := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC))
			for _, n := range loadedNodes {
				metaNode := &tree.Node{Uuid: n.GetUuid()}
				metaNode.MustSetMeta(common.MetaNamespaceRecycleRestore, n.Path)
				_, e := metaClient.CreateNode(ctx, &tree.CreateNodeRequest{Node: metaNode})
				if e != nil {
					log.Logger(ctx).Error("Error while saving recycle_restore meta", zap.Error(e))
				}
			}
		}

		if e := disallowTemplate(map[string]string{
			"type":         taskType,
			"target":       targetNodePath,
			"targetParent": targetParent,
		}); e != nil {
			return e
		}

		job := &jobs.Job{
			ID:             jobUuid,
			Owner:          userName,
			Label:          taskLabel,
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID: "actions.tree.copymove",
					Parameters: map[string]string{
						"type":         taskType,
						"scope":        "owner",
						"target":       ownerTarget,
						"targetParent": targetParent,
						"recursive":    "true",
						"create":       "true",
					},
					NodesSelector: &jobs.NodesSelector{
						Collect: false,
						Pathes:  ownerPaths,
					},
				},
			},
		}

		resp, er := jobsc.JobServiceClient(ctx).PutJob(ctx, &jobs.PutJobRequest{Job: job})
		if er == nil {
			outJob = resp.GetJob()
		}
		return er

	})

	return outJob, err
}

func SyncDatasourceTask(ctx context.Context, dsName string, languages ...string) (*jobs.Job, error) {

	jobUuid := "resync-ds-" + dsName
	cli := jobsc.JobServiceClient(ctx)
	if resp, er := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: jobUuid}); er == nil && resp.Job != nil {
		broker.MustPublish(ctx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
			JobID:  jobUuid,
			RunNow: true,
		})
		return resp.Job, nil
	}
	if e := disallowTemplate(map[string]string{
		"dsName": dsName,
	}); e != nil {
		return nil, e
	}

	job := grpc_jobs.BuildDataSourceSyncJob(dsName, false, true, languages...)

	resp, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
	if er == nil {
		return resp.GetJob(), nil
	} else {
		return nil, er
	}

}

// WgetTask launch one or many background task for downloading URL to the storage
func WgetTask(ctx context.Context, router nodes.Client, parentPath string, urls []string, languages ...string) ([]*jobs.Job, error) {

	if !config.Get(ctx, config.FrontendPluginPath("uploader.http", config.KeyFrontPluginEnabled)...).Bool() {
		return nil, fmt.Errorf("you are not allowed to use this feature")
	}
	T := lang.Bundle().T(languages...)
	taskLabel := T("Jobs.User.Wget")
	var out []*jobs.Job

	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name

	var parentNode, fullPathParentNode *tree.Node
	if resp, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parentPath}}); e != nil {
		return nil, e
	} else {
		parentNode = resp.Node
	}

	// Compute node real path, and check that its writeable as well
	if innerOp, e := router.CanApply(ctx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: parentNode}); e == nil {
		fullPathParentNode = innerOp.GetTarget()
	} else {
		return nil, errors.WithStack(errors.PathNotWriteable)
	}

	var whiteList, blackList []string
	wl := config.Get(ctx, config.FrontendPluginPath("uploader.http", "REMOTE_UPLOAD_WHITELIST")...).Default("").String()
	bl := config.Get(ctx, config.FrontendPluginPath("uploader.http", "REMOTE_UPLOAD_BLACKLIST")...).Default("localhost").String()
	if wl != "" {
		whiteList = strings.Split(wl, ",")
	}
	if bl != "" {
		blackList = strings.Split(bl, ",")
	}
	cli := jobsc.JobServiceClient(ctx)
	for _, u := range urls {
		parsed, e := url.Parse(u)
		if e != nil {
			return nil, e
		}
		if (len(whiteList) > 0 && !hostListCheck(whiteList, parsed)) || (len(blackList) > 0 && hostListCheck(blackList, parsed)) {
			return nil, fmt.Errorf("hostname %s is not allowed", parsed.Hostname())
		}
		jobUuid := "wget-" + uuid.New()

		var params = map[string]string{
			"url": u,
		}
		cleanUrl := strings.Split(u, "?")[0]
		cleanUrl = strings.Split(cleanUrl, "#")[0]
		basename := path.Base(cleanUrl)
		if basename == "" {
			basename = jobUuid
		}
		// Recheck target node for policies
		if _, err := router.CanApply(ctx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: &tree.Node{Path: path.Join(parentPath, basename)}}); err != nil {
			return nil, err
		}
		if e := disallowTemplate(params); e != nil {
			return nil, e
		}
		job := &jobs.Job{
			ID:             jobUuid,
			Owner:          userName,
			Label:          taskLabel,
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 5,
			AutoStart:      true,
			Actions: []*jobs.Action{
				{
					ID:         "actions.cmd.wget",
					Parameters: params,
					NodesSelector: &jobs.NodesSelector{
						// Here we specifically use Pathes instead of a query as it defines
						// a target node that does NOT exists
						Pathes: []string{path.Join(fullPathParentNode.Path, basename)},
					},
				},
			},
		}

		resp, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		if er != nil {
			return nil, er
		} else {
			out = append(out, resp.GetJob())
		}
	}
	return out, nil

}

func P8migrationTask(ctx context.Context, jsonParams string) (*jobs.Job, error) {

	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	if claims.Profile != common.PydioProfileAdmin {
		return nil, errors.WithMessage(errors.StatusForbidden, "you are not allowed to create this job")
	}
	jobUuid := "pydio8-data-import"
	// Parse JsonParams
	type Action struct {
		Name   string            `json:"name"`
		Params map[string]string `json:"params"`
	}
	var data []*Action
	if err := json.Unmarshal([]byte(jsonParams), &data); err != nil {
		return nil, err
	}
	job := &jobs.Job{
		ID:       jobUuid,
		Label:    "Import Data from Pydio 8",
		Owner:    common.PydioSystemUsername,
		Inactive: false,
		//AutoStart:         true,
		MaxConcurrency: 1,
	}
	rootAction := &jobs.Action{}
	log.Logger(ctx).Info("Got Actions", log.DangerouslyZapSmallSlice("actions", data))
	parentAction := rootAction
	for _, a := range data {
		action := &jobs.Action{
			ID:             a.Name,
			Parameters:     a.Params,
			ChainedActions: []*jobs.Action{},
		}
		parentAction.ChainedActions = append(parentAction.ChainedActions, action)
		parentAction = action
	}
	job.Actions = rootAction.ChainedActions

	log.Logger(ctx).Info("Posting Job", zap.Object("job", job))

	cli := jobsc.JobServiceClient(ctx)
	if resp, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er == nil {
		<-time.After(2 * time.Second)
		broker.MustPublish(ctx, common.TopicTimerEvent, &jobs.JobTriggerEvent{
			JobID:  jobUuid,
			RunNow: true,
		})
		return resp.GetJob(), nil
	} else {
		return nil, er
	}
}

// hostListCheck check if url hostname is in string
func hostListCheck(list []string, u *url.URL) bool {
	h := u.Hostname()
	for _, l := range list {
		if strings.TrimSpace(l) == h {
			return true
		}
	}
	return false
}

func disallowTemplate(params map[string]string) error {
	for _, v := range params {
		if v != jobs.EvaluateFieldStr(context.Background(), &jobs.ActionMessage{}, v) {
			return errors.WithMessage(errors.StatusInternalServerError, "invalid format detected")
		}
	}
	return nil
}

func RestoreTask(ctx context.Context, router nodes.Client, paths []string, languages ...string) ([]*jobs.Job, []*tree.Node, error) {
	paths = std.Unique(paths)
	var jj []*jobs.Job
	var nn []*tree.Node

	username, _ := permissions.FindUserNameInContext(ctx)
	T := lang.Bundle().T(languages...)
	moveLabel := T("Jobs.User.DirMove")
	cli := jobsc.JobServiceClient(ctx)
	restoreTargets := make(map[string]struct{}, len(paths))

	e := router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
		for _, pa := range paths {
			inNode := &tree.Node{Path: pa}
			ctx, filtered, _ := inputFilter(ctx, inNode, "in")
			r, e := router.GetClientsPool(ctx).GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: filtered})
			if e != nil {
				log.Logger(ctx).Error("[restore] Cannot find source node", zap.Error(e))
				return e
			}
			bi, er := nodes.GetBranchInfo(ctx, "in")
			if er != nil {
				return er
			}
			nn = append(nn, r.GetNode())
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
			_, ancestors, e := nodes.AncestorsListFromContext(ctx, targetNode, "in", true)
			if e != nil {
				return e
			}
			accessList := acl.MustFromContext(ctx)
			if !accessList.CanWrite(ctx, ancestors...) {
				return errors.WithMessage(errors.StatusForbidden, "Original location is not writable")
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
							Query: &service.Query{SubQueries: []*anypb.Any{q}},
						},
					},
				},
			}
			ctx = propagator.WithAdditionalMetadata(ctx, map[string]string{
				keys.CtxWorkspaceUuid: bi.Workspace.GetUUID(),
			})
			if resp, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er != nil {
				return er
			} else {
				jj = append(jj, resp.GetJob())
			}
		}

		return nil
	})

	if e != nil {
		return nil, nil, e
	} else {
		return jj, nn, nil
	}

}

// PersistSelection transforms a list of nodes to a selection with a UUID
func PersistSelection(ctx context.Context, nodes []*tree.Node) (string, error) {

	if len(nodes) > 1 {
		nodes = DeduplicateNodes(nodes)
	}
	username, _ := permissions.FindUserNameInContext(ctx)
	selectionUuid := uuid.New()
	dcClient := docstorec.DocStoreClient(ctx)
	data, _ := json.Marshal(nodes)
	if _, e := dcClient.PutDocument(ctx, &docstore.PutDocumentRequest{
		StoreID:    common.DocStoreIdSelections,
		DocumentID: selectionUuid,
		Document: &docstore.Document{
			Owner: username,
			Data:  string(data),
			ID:    selectionUuid,
		},
	}); e != nil {
		return "", e
	}
	return selectionUuid, nil

}

// MkDirsOrFiles creates folders (recursively) or empty files, or files hydrated by existing templates
func MkDirsOrFiles(ctx context.Context, router nodes.Client, nodes []*tree.Node, recursive bool, tplUuid string) (nn []*tree.Node, er error) {

	var session string
	var folderPaths []string
	folderChecks := make(map[string]string)
	if len(nodes) > 1 {
		nodes = DeduplicateNodes(nodes)
		session = uuid.New()
	}
	for i, n := range nodes {
		// Check node does not exist already (by path)
		if _, statErr := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: n, StatFlags: []uint32{tree.StatFlagExistsOnly}}); statErr == nil {
			return nil, errors.WithMessage(errors.StatusConflict, "Please use another file name!")
		}
		if !n.IsLeaf() {
			// And double-check by ID if it is passed as parameter - already done in the PUT flow
			if id := n.GetStringMeta(common.InputResourceUUID); id != "" {
				if _, statErr := compose.UuidClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: id}, StatFlags: []uint32{tree.StatFlagExistsOnly}}); statErr == nil {
					return nil, errors.WithMessage(errors.StatusConflict, "Please use another UUID")
				}
				n.SetUuid(id)
				delete(n.MetaStore, common.InputResourceUUID)
			}
			// Additional folders checks for non-flat storages
			if info, err := router.BranchInfoForNode(ctx, n); err != nil {
				er = err
				return
			} else if !info.FlatStorage {
				folderPaths = append(folderPaths, n.Path)
				folderChecks[n.Path] = n.Path
			}

			if session != "" && i == len(nodes)-1 {
				session = common.SyncSessionClose_ + session
			}
			r, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: n, IndexationSession: session})
			if e != nil {
				if session != "" {
					// Make sure to close the session
					broker.MustPublish(ctx, common.TopicIndexEvent, &tree.IndexEvent{
						SessionForceClose: session,
					})
				}
				er = e
				return
			}
			nn = append(nn, r.GetNode().WithoutReservedMetas())
		} else {
			var reader io.Reader
			var length int64
			meta := map[string]string{}
			if tplUuid != "" {
				provider := templates.GetProvider()
				node, err := provider.ByUUID(ctx, tplUuid)
				if err != nil {
					er = err
					return
				}
				var e error
				reader, length, e = node.Read(ctx)
				if e != nil {
					er = e
					return
				}

			} else {
				contents := "" // Use simple space for empty files
				if n.GetStringMeta(common.MetaNamespaceContents) != "" {
					contents = n.GetStringMeta(common.MetaNamespaceContents)
				}
				meta[common.XContentType] = "text/plain"
				length = int64(len(contents))
				reader = strings.NewReader(contents)
			}
			for k, v := range n.GetMetaStore() {
				// Translate node usermeta to PutRequestData.Meta
				if strings.HasPrefix(k, common.MetaNamespaceUserspacePrefix) {
					meta[common.XAmzMetaPrefix+k] = v
				} else if slices.Contains([]string{common.InputResourceUUID, common.InputVersionId, common.InputDraftMode}, k) {
					meta[common.XAmzMetaPrefix+k] = strings.ReplaceAll(v, "\"", "")
				}
			}
			if _, er = router.PutObject(ctx, n, reader, &models.PutRequestData{Size: length, Metadata: meta}); er != nil {
				return
			} else if newN, err := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: n}); err != nil {
				er = err
				return
			} else {
				nn = append(nn, newN.GetNode().WithoutReservedMetas())
			}
		}
	}

	if session != "" && len(folderPaths) > 0 {
		log.Logger(ctx).Debug("Blocking request before all folders were created (checking .pydio)", zap.Any("remaining", folderChecks))
		pref := filesystem.CommonPrefix('/', folderPaths...)
		if _, ok := folderChecks[pref]; ok {
			// Check root folder
			_ = std.Retry(ctx, func() error {
				_, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: pref}, StatFlags: []uint32{tree.StatFlagExistsOnly}})
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
	return

}

// DeduplicateNodes takes a slice of nodes and make sure there are no duplicates based on their path
func DeduplicateNodes(nn []*tree.Node) (out []*tree.Node) {

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
