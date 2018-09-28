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

package tree

import (
	"context"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

type CopyMoveAction struct {
	Client            views.Handler
	Move              bool
	Recursive         bool
	TargetPlaceholder string
	CreateFolder      bool
	TargetIsParent    bool
}

var (
	copyMoveActionName = "actions.tree.copymove"
)

// GetName returns this action unique identifier
func (c *CopyMoveAction) GetName() string {
	return copyMoveActionName
}

// Init passes parameters to the action
func (c *CopyMoveAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {

	if c.Client == nil {
		c.Client = views.NewStandardRouter(views.RouterOptions{AdminView: true})
	}

	if action.Parameters == nil {
		return errors.InternalServerError(common.SERVICE_JOBS, "Could not find parameters for CopyMove action")
	}
	var tOk bool
	c.TargetPlaceholder, tOk = action.Parameters["target"]
	if !tOk {
		return errors.InternalServerError(common.SERVICE_JOBS, "Could not find parameters for CopyMove action")
	}
	c.Move = false
	if actionType, ok := action.Parameters["type"]; ok && actionType == "move" {
		c.Move = true
	}

	if createParam, ok := action.Parameters["create"]; ok {
		c.CreateFolder, _ = strconv.ParseBool(createParam)
	}

	if targetParent, ok := action.Parameters["targetParent"]; ok && targetParent == "true" {
		c.TargetIsParent = true
	}

	if recurseParam, ok := action.Parameters["recursive"]; ok {
		c.Recursive, _ = strconv.ParseBool(recurseParam)
	}

	return nil
}

// Run the actual action code
func (c *CopyMoveAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}
	sourceNode := input.Nodes[0]

	// Todo - handle target already existing with -X suffix?
	targetNode := &tree.Node{
		Path: c.TargetPlaceholder,
	}
	if c.TargetIsParent {
		targetNode.Path = filepath.Join(targetNode.Path, filepath.Base(sourceNode.Path))
	}

	log.Logger(ctx).Debug("Copy/Move target path is", targetNode.ZapPath(), zap.Bool("targetIsParent", c.TargetIsParent))

	if targetNode.Path == input.Nodes[0].Path {
		// Do not copy on itself, ignore
		return input, nil
	}

	readR, readE := c.Client.ReadNode(ctx, &tree.ReadNodeRequest{Node: sourceNode})
	if readE != nil {
		log.Logger(ctx).Error("Read Source", zap.Error(readE))
		return input.WithError(readE), readE
	}
	sourceNode = readR.Node
	output := input
	childrenMoved := 0

	session := uuid.NewUUID().String()

	if c.Recursive && !sourceNode.IsLeaf() {

		prefixPathSrc := strings.TrimRight(sourceNode.Path, "/")
		prefixPathTarget := strings.TrimRight(targetNode.Path, "/")
		// List all children and move them all
		streamer, err := c.Client.ListNodes(ctx, &tree.ListNodesRequest{
			Node:      sourceNode,
			Recursive: true,
		})
		if err != nil {
			log.Logger(ctx).Error("List Nodes", zap.Error(err))
			return input.WithError(readE), readE
		}
		children := []*tree.Node{}
		defer streamer.Close()

		for {
			child, cE := streamer.Recv()
			if cE != nil {
				break
			}
			if child == nil {
				continue
			}
			children = append(children, child.Node)
		}

		if len(children) > 0 {
			log.Logger(ctx).Info(fmt.Sprintf("There are %v children to move", len(children)))
		}
		total := len(children)

		for idx, childNode := range children {

			childPath := childNode.Path
			relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
			targetPath := prefixPathTarget + "/" + relativePath

			channels.StatusMsg <- "Copying " + childPath

			// CREATE NEW FILES - DO NOT HANDLE PYDIO_SYNC_HIDDEN_FILE_META, HANDLE FOLDERS INSTEAD

			log.Logger(ctx).Info("Copy/Move " + childNode.Path + " to " + targetPath)
			folderExists := false
			if !childNode.IsLeaf() || filepath.Base(targetPath) == common.PYDIO_SYNC_HIDDEN_FILE_META {
				if cResp, cE := c.Client.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: targetPath}}); cE == nil && cResp.Node != nil {
					log.Logger(ctx).Debug("-- Ignoring folder move/copy as it already exists")
					folderExists = true
				}
			}

			if !folderExists {

				if childNode.IsLeaf() {

					meta := make(map[string]string, 1)
					if c.Move {
						meta["X-Amz-Metadata-Directive"] = "COPY"
					} else {
						meta["X-Amz-Metadata-Directive"] = "REPLACE"
					}
					meta["X-Pydio-Session"] = session
					_, e := c.Client.CopyObject(ctx, childNode, &tree.Node{Path: targetPath}, &views.CopyRequestData{Metadata: meta})
					if e != nil {
						log.Logger(ctx).Error("-- Copy ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
						return output.WithError(e), e
					}
					log.Logger(ctx).Debug("-- Copy Success: " + childNode.Path)

				} else {

					folderNode := childNode.Clone()
					folderNode.Path = targetPath
					if !c.Move {
						folderNode.Uuid = uuid.NewUUID().String()
					}
					_, e := c.Client.CreateNode(ctx, &tree.CreateNodeRequest{Node: folderNode, IndexationSession: session})
					if e != nil {
						log.Logger(ctx).Error("-- Create Folder ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
						return output.WithError(e), e
					}
					log.Logger(ctx).Debug("-- Create Folder Success " + childNode.Path)

				}
			}

			// REMOVE SOURCE IF NECESSARY - DO REMOVE PYDIO_SYNC_HIDDEN_FILE_META
			if c.Move {

				// If we're sending the last Delete here - then we close the session at the same time
				if idx == len(children)-1 {
					session = "close-" + session
				}

				_, moveErr := c.Client.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: childNode, IndexationSession: session})
				if moveErr != nil {
					log.Logger(ctx).Error("-- Delete Error", zap.Error(moveErr))
					return output.WithError(moveErr), moveErr
				}
				log.Logger(ctx).Debug("-- Delete Success " + childNode.Path)
				output.AppendOutput(&jobs.ActionOutput{
					StringBody: "Moved file " + childPath + " to " + targetPath,
				})
			} else {
				output.AppendOutput(&jobs.ActionOutput{
					StringBody: "Copied file " + childPath + " to " + targetPath,
				})
			}
			childrenMoved++
			channels.Progress <- float32(childrenMoved) / float32(total)

		}

	}

	if childrenMoved > 0 {
		log.Logger(ctx).Info(fmt.Sprintf("Successfully moved %v, now moving parent node", childrenMoved))
	}

	// Now Copy/Move initial node
	if sourceNode.IsLeaf() {
		meta := make(map[string]string, 1)
		if c.Move {
			meta["X-Amz-Metadata-Directive"] = "COPY"
		} else {
			meta["X-Amz-Metadata-Directive"] = "REPLACE"
		}
		_, e := c.Client.CopyObject(ctx, sourceNode, targetNode, &views.CopyRequestData{Metadata: meta})
		if e != nil {
			return output.WithError(e), e
		}
		output = output.WithNode(targetNode)
		// Remove Source Node
		if c.Move {
			_, moveErr := c.Client.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: sourceNode})
			if moveErr != nil {
				return output.WithError(moveErr), moveErr
			}
		}

	} else if !c.Move {
		// Create PYDIO_SYNC_HIDDEN_FILE_META - Original ones are already deleted in previous step
		/*
			if c.Move {
				log.Logger(ctx).Info("-- Moving sourceNode " + sourceNode.Path + " with uuid " + sourceNode.Uuid)
				targetNode.Uuid = sourceNode.Uuid
			} else {
			}
		*/
		session = "close-" + session

		log.Logger(ctx).Info("-- Copying sourceNode with empty Uuid")
		targetNode.Type = tree.NodeType_COLLECTION
		_, e := c.Client.CreateNode(ctx, &tree.CreateNodeRequest{Node: targetNode, IndexationSession: session})
		if e != nil {
			return output.WithError(e), e
		}

		/*
			if c.Move {
				log.Logger(ctx).Info("-- Remove original PYDIO_SYNC_HIDDEN_FILE_META")
				_, e2 := c.Client.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{
					Path:sourceNode.Path + "/" + common.PYDIO_SYNC_HIDDEN_FILE_META,
					Type: tree.NodeType_LEAF,
				}})
				if e2 != nil {
					log.Logger(ctx).Info("-- Could not delete ", zap.String("p", sourceNode.Path + "/" + common.PYDIO_SYNC_HIDDEN_FILE_META))
					return output.WithError(e2), e2
				}
			}
		*/

	}

	output.AppendOutput(&jobs.ActionOutput{
		Success: true,
	})

	return output, nil
}
