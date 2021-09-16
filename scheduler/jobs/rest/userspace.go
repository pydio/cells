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
	"path"
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/cells/common/config"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/lang"
)

func compress(ctx context.Context, selectedPathes []string, targetNodePath string, format string, languages ...string) (string, error) {

	T := lang.Bundle().GetTranslationFunc(languages...)
	jobUuid := "compress-folders-" + uuid.New()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name
	if format != "zip" && format != "tar" && format != "tar.gz" {
		return "", fmt.Errorf("unsupported format, please use one of zip, tar or tar.gz")
	}

	err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

		var targetSize int64
		for i, p := range selectedPathes {
			node := &tree.Node{Path: p}
			srcCtx, node, nodeErr := inputFilter(ctx, node, "in")
			log.Logger(ctx).Debug("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
			if nodeErr != nil {
				return nodeErr
			}
			if err := getRouter().WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: node}); err != nil {
				return err
			}
			if resp, e := getRouter().GetClientsPool().GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: node}); e != nil {
				return e
			} else {
				targetSize += resp.GetNode().GetSize()
			}
			selectedPathes[i] = node.Path
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
			if err := getRouter().WrappedCanApply(nil, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: node}); err != nil {
				return err
			}
			targetNodePath = node.Path
		}

		log.Logger(ctx).Debug("Submitting selected pathes for compression", zap.Int("pathes length", len(selectedPathes)))
		params := map[string]string{
			"format": format,
			"target": targetNodePath,
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
						Pathes:  selectedPathes,
					},
				},
			},
		}

		cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
		_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return er

	})

	return jobUuid, err

}

func extract(ctx context.Context, selectedNode string, targetPath string, format string, languages ...string) (string, error) {

	jobUuid := "extract-archive-" + uuid.New()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name
	T := lang.Bundle().GetTranslationFunc(languages...)

	err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

		node := &tree.Node{Path: selectedNode}
		srcCtx, node, nodeErr := inputFilter(ctx, node, "in")
		if nodeErr != nil {
			log.Logger(ctx).Error("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
			return nodeErr
		}
		archiveNode := node.Path
		if err := getRouter().WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: node}); err != nil {
			return err
		}
		var archiveSize int64
		if resp, e := getRouter().GetClientsPool().GetTreeClient().ReadNode(srcCtx, &tree.ReadNodeRequest{Node: node}); e != nil {
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
		if err := getRouter().WrappedCanApply(nil, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: realNode}); err != nil {
			return err
		}

		params := map[string]string{
			"format": format,
			"target": targetPath,
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
						Pathes: []string{archiveNode},
					},
				},
			},
		}

		cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
		_, err := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return err

	})

	return jobUuid, err

}

func dirCopy(ctx context.Context, selectedPathes []string, targetNodePath string, targetIsParent bool, move bool, languages ...string) (string, error) {

	T := lang.Bundle().GetTranslationFunc(languages...)

	taskType := "copy"
	taskLabel := T("Jobs.User.DirCopy")
	if move {
		taskType = "move"
		taskLabel = T("Jobs.User.DirMove")
	}

	jobUuid := "copy-move-" + uuid.New()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name
	sourceId := "in"
	targetId := "in"
	if move {
		sourceId = "from"
		targetId = "to"
	}

	err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

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
		for i, p := range selectedPathes {
			node := &tree.Node{Path: p}
			srcCtx, node, nodeErr := inputFilter(ctx, node, sourceId)
			if nodeErr != nil {
				return nodeErr
			}
			// Check perms first
			if rErr := getRouter().WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: node}); rErr != nil {
				return rErr
			}
			// Load node to retrieve its size
			r, e := getRouter().GetClientsPool().GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: node.Path}})
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
				if sErr := getRouter().WrappedCanApply(srcCtx, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_PATH, Source: r.Node, Target: checkNode}); sErr != nil {
					return sErr
				}
			} else {
				/*
					// Already checked above
					if rErr := getRouter().WrappedCanApply(srcCtx, nil, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: r.Node}); rErr != nil {
						return rErr
					}
				*/
				if er := getRouter().WrappedCanApply(nil, targetCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: checkNode}); er != nil {
					return er
				}
			}
			loadedNodes = append(loadedNodes, r.Node)
			selectedPathes[i] = node.Path
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

		log.Logger(ctx).Info("Creating copy/move job", zap.Int("paths length", len(selectedPathes)), zap.String("target", targetNodePath))
		if move && strings.Contains(targetNodePath, common.RecycleBinName) {
			// Update node meta before moving
			metaClient := tree.NewNodeReceiverClient(common.ServiceGrpcNamespace_+common.ServiceMeta, defaults.NewClient())
			for _, n := range loadedNodes {
				metaNode := &tree.Node{Uuid: n.GetUuid()}
				metaNode.SetMeta(common.MetaNamespaceRecycleRestore, n.Path)
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
						"target":       targetNodePath,
						"targetParent": targetParent,
						"recursive":    "true",
						"create":       "true",
					},
					NodesSelector: &jobs.NodesSelector{
						//Collect: true,
						Pathes: selectedPathes,
					},
				},
			},
		}

		cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
		_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return er

	})

	return jobUuid, err
}

func syncDatasource(ctx context.Context, dsName string, languages ...string) (string, error) {

	T := lang.Bundle().GetTranslationFunc(languages...)

	jobUuid := "resync-ds-" + dsName
	cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
	if resp, er := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: jobUuid}); er == nil && resp.Job != nil {
		client.Publish(ctx, client.NewPublication(common.TopicTimerEvent, &jobs.JobTriggerEvent{
			JobID:  jobUuid,
			RunNow: true,
		}))
		return jobUuid, nil
	}
	if e := disallowTemplate(map[string]string{
		"dsName": dsName,
	}); e != nil {
		return "", e
	}

	job := &jobs.Job{
		ID:             jobUuid,
		Owner:          common.PydioSystemUsername,
		Label:          T("Jobs.User.ResyncDS", map[string]string{"DsName": dsName}),
		Inactive:       false,
		Languages:      languages,
		MaxConcurrency: 1,
		AutoStart:      true,
		Actions: []*jobs.Action{
			{
				ID: "actions.cmd.resync",
				Parameters: map[string]string{
					"service": common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + dsName,
				},
			},
		},
	}

	_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
	return jobUuid, er

}

// wgetTasks launch one or many background task for downloading URL to the storage
func wgetTasks(ctx context.Context, parentPath string, urls []string, languages ...string) ([]string, error) {

	T := lang.Bundle().GetTranslationFunc(languages...)
	taskLabel := T("Jobs.User.Wget")
	router := getRouter()

	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name
	var jobUuids []string

	var parentNode, fullPathParentNode *tree.Node
	if resp, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parentPath}}); e != nil {
		return []string{}, e
	} else {
		parentNode = resp.Node
	}

	// Compute node real path, and check that its writeable as well
	if innerOp, e := router.CanApply(ctx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_CREATE, Target: parentNode}); e == nil {
		fullPathParentNode = innerOp.GetTarget()
	} else {
		return []string{}, errors.Forbidden(common.ServiceJobs, "Parent Node is not writeable")
	}
	/*
		if err := router.WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
			updateCtx, realParent, e := inputFilter(ctx, parentNode, "sel")
			if e != nil {
				return e
			} else {
				accessList, e := views.AccessListFromContext(updateCtx)
				if e != nil {
					return e
				}
				// First load ancestors or grab them from BranchInfo
				ctx, parents, err := views.AncestorsListFromContext(updateCtx, realParent, "in", getRouter().GetClientsPool(), false)
				if err != nil {
					return err
				}
				if !accessList.CanWrite(ctx, parents...) {
					return errors.Forbidden(common.ServiceJobs, "Parent Node is not writeable")
				}
				fullPathParentNode = realParent
			}

			return nil
		}); err != nil {
			return jobUuids, err
		}
	*/

	var whiteList, blackList []string
	wl := config.Get("frontend", "plugin", "uploader.http", "REMOTE_UPLOAD_WHITELIST").String()
	bl := config.Get("frontend", "plugin", "uploader.http", "REMOTE_UPLOAD_BLACKLIST").String()
	if wl != "" {
		whiteList = strings.Split(wl, ",")
	}
	if bl != "" {
		blackList = strings.Split(bl, ",")
	}
	cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
	for _, u := range urls {
		parsed, e := url.Parse(u)
		if e != nil {
			return nil, e
		}
		if (len(whiteList) > 0 && !hostListCheck(whiteList, parsed)) || (len(blackList) > 0 && hostListCheck(blackList, parsed)) {
			return nil, fmt.Errorf("hostname %s is not allowed", parsed.Hostname())
		}
		jobUuid := "wget-" + uuid.New()
		jobUuids = append(jobUuids, jobUuid)

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
			return jobUuids, err
		}
		/*
			if err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
				updateCtx, realTarget, e := inputFilter(ctx, &tree.Node{Path: path.Join(parentPath, basename)}, "sel")
				if e != nil {
					return e
				} else {
					accessList, e := views.AccessListFromContext(updateCtx)
					if e != nil {
						return e
					}
					// First load ancestors or grab them from BranchInfo
					ctx, parents, err := views.AncestorsListFromContext(updateCtx, realTarget, "in", getRouter().GetClientsPool(), true)
					if err != nil {
						return err
					}
					if !accessList.CanWrite(ctx, parents...) {
						return errors.Forbidden(common.ServiceJobs, "Parent Node is not writeable")
					}
				}
				return nil
			}); err != nil {
				return jobUuids, err
			}
		*/
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
						Pathes: []string{path.Join(fullPathParentNode.Path, basename)},
					},
				},
			},
		}

		_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		if er != nil {
			return jobUuids, er
		}
	}
	return jobUuids, nil

}

func p8migration(ctx context.Context, jsonParams string) (string, error) {

	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	if claims.Profile != common.PydioProfileAdmin {
		return "", errors.Forbidden("user.job.forbidden", "you are not allowed to create this job")
	}
	jobUuid := "pydio8-data-import"
	// Parse JsonParams
	type Action struct {
		Name   string            `json:"name"`
		Params map[string]string `json:"params"`
	}
	var data []*Action
	if err := json.Unmarshal([]byte(jsonParams), &data); err != nil {
		return "", err
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
	log.Logger(ctx).Info("Got Actions", zap.Int("actions length", len(data)))
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

	log.Logger(ctx).Info("Posting Job", zap.Any("job", job))

	cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
	if _, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job}); er == nil {
		<-time.After(2 * time.Second)
		client.Publish(ctx, client.NewPublication(common.TopicTimerEvent, &jobs.JobTriggerEvent{
			JobID:  jobUuid,
			RunNow: true,
		}))
		return jobUuid, nil
	} else {
		return "", er
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
		if v != jobs.EvaluateFieldStr(context.Background(), jobs.ActionMessage{}, v) {
			return errors.New("format.invalid", "invalid format detected", 403)
		}
	}
	return nil
}
