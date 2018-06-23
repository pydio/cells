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
	"path/filepath"

	"github.com/micro/go-micro/client"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/lang"
)

func compress(ctx context.Context, selectedPathes []string, targetNodePath string, format string, languages ...string) (string, error) {

	T := lang.Bundle().GetTranslationFunc(languages...)
	jobUuid := uuid.NewUUID().String()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name

	err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

		for i, path := range selectedPathes {
			node := &tree.Node{Path: path}
			_, node, nodeErr := inputFilter(ctx, node, "sel")
			log.Logger(ctx).Debug("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
			if nodeErr != nil {
				return nodeErr
			}
			selectedPathes[i] = node.Path
		}

		if targetNodePath != "" {
			node := &tree.Node{Path: targetNodePath}
			_, node, nodeErr := inputFilter(ctx, node, "sel")
			if nodeErr != nil {
				log.Logger(ctx).Error("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
				return nodeErr
			}
			targetNodePath = node.Path
		}

		log.Logger(ctx).Debug("Submitting selected pathes for compression", zap.Any("pathes", selectedPathes))

		job := &jobs.Job{
			ID:             "compress-folders-" + jobUuid,
			Owner:          userName,
			Label:          T("Jobs.User.Compress"),
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID: "actions.archive.compress",
					Parameters: map[string]string{
						"format": format,
						"target": targetNodePath, // NOT USED YET - TODO
					},
					NodesSelector: &jobs.NodesSelector{
						Collect: true,
						Pathes:  selectedPathes,
					},
				},
			},
		}

		cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
		_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return er

	})

	return jobUuid, err

}

func extract(ctx context.Context, selectedNode string, targetPath string, format string, languages ...string) (string, error) {

	jobUuid := uuid.NewUUID().String()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name
	T := lang.Bundle().GetTranslationFunc(languages...)

	err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

		node := &tree.Node{Path: selectedNode}
		_, node, nodeErr := inputFilter(ctx, node, "sel")
		if nodeErr != nil {
			log.Logger(ctx).Error("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
			return nodeErr
		}
		selectedNode = node.Path

		if targetPath != "" {
			node := &tree.Node{Path: targetPath}
			_, node, nodeErr := inputFilter(ctx, node, "sel")
			if nodeErr != nil {
				log.Logger(ctx).Error("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
				return nodeErr
			}
			targetPath = node.Path
		}

		job := &jobs.Job{
			ID:             "extract-archive-" + jobUuid,
			Owner:          userName,
			Label:          T("Jobs.User.Extract"),
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID: "actions.archive.extract",
					Parameters: map[string]string{
						"format": format,
						"target": targetPath,
					},
					NodesSelector: &jobs.NodesSelector{
						Pathes: []string{selectedNode},
					},
				},
			},
		}

		cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
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

	jobUuid := uuid.NewUUID().String()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name

	err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

		for i, path := range selectedPathes {
			node := &tree.Node{Path: path}
			_, node, nodeErr := inputFilter(ctx, node, "sel")
			log.Logger(ctx).Debug("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
			if nodeErr != nil {
				return nodeErr
			}
			selectedPathes[i] = node.Path
		}

		if targetNodePath != "" {
			var dir, base string
			if targetIsParent {
				dir = targetNodePath
			} else {
				dir, base = filepath.Split(targetNodePath)
			}
			node := &tree.Node{Path: dir}
			_, node, nodeErr := inputFilter(ctx, node, "sel")
			if nodeErr != nil {
				log.Logger(ctx).Error("Filtering Input Node Parent", zap.Any("node", node), zap.Error(nodeErr))
				return nodeErr
			}
			if targetIsParent {
				targetNodePath = node.Path
			} else {
				targetNodePath = node.Path + "/" + base
			}
		}

		var targetParent = ""
		if targetIsParent {
			targetParent = "true"
		}
		log.Logger(ctx).Info("Creating copy/move job", zap.Any("paths", selectedPathes), zap.String("target", targetNodePath))

		job := &jobs.Job{
			ID:             "copy-move-" + jobUuid,
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

		cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
		_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return er

	})

	return jobUuid, err
}

func backgroundDelete(ctx context.Context, selectedPathes []string, childrenOnly bool, languages ...string) (string, error) {

	T := lang.Bundle().GetTranslationFunc(languages...)

	taskLabel := T("Jobs.User.Delete")

	jobUuid := uuid.NewUUID().String()
	claims := ctx.Value(claim.ContextKey).(claim.Claims)
	userName := claims.Name

	err := getRouter().WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

		for i, path := range selectedPathes {
			node := &tree.Node{Path: path}
			_, node, nodeErr := inputFilter(ctx, node, "sel")
			log.Logger(ctx).Debug("Filtering Input Node", zap.Any("node", node), zap.Error(nodeErr))
			if nodeErr != nil {
				return nodeErr
			}
			selectedPathes[i] = node.Path
		}

		log.Logger(ctx).Debug("Creating background delete job", zap.Any("pathes", selectedPathes), zap.Bool("childrenOnly", childrenOnly))

		var params = map[string]string{}
		if childrenOnly {
			params["childrenOnly"] = "true"
		}

		job := &jobs.Job{
			ID:             "delete-" + jobUuid,
			Owner:          userName,
			Label:          taskLabel,
			Inactive:       false,
			Languages:      languages,
			MaxConcurrency: 1,
			AutoStart:      true,
			AutoClean:      true,
			Actions: []*jobs.Action{
				{
					ID:         "actions.tree.delete",
					Parameters: params,
					NodesSelector: &jobs.NodesSelector{
						//Collect: true,
						Pathes: selectedPathes,
					},
				},
			},
		}

		cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
		_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
		return er

	})

	return jobUuid, err
}

func syncDatasource(ctx context.Context, dsName string, languages ...string) (string, error) {

	T := lang.Bundle().GetTranslationFunc(languages...)

	jobUuid := "resync-ds-" + dsName
	cli := jobs.NewJobServiceClient(registry.GetClient(common.SERVICE_JOBS))
	if resp, er := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: jobUuid}); er == nil && resp.Job != nil {

		client.Publish(ctx, client.NewPublication(common.TOPIC_TIMER_EVENT, &jobs.JobTriggerEvent{
			JobID:  jobUuid,
			RunNow: true,
		}))
		return jobUuid, nil
	}

	job := &jobs.Job{
		ID:             "resync-ds-" + dsName,
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          T("Jobs.User.ResyncDS", map[string]string{"DsName": dsName}),
		Inactive:       false,
		Languages:      languages,
		MaxConcurrency: 1,
		AutoStart:      true,
		Actions: []*jobs.Action{
			{
				ID: "actions.cmd.resync",
				Parameters: map[string]string{
					"service": common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_SYNC_ + dsName,
				},
			},
		},
	}

	_, er := cli.PutJob(ctx, &jobs.PutJobRequest{Job: job})
	return jobUuid, er

}
