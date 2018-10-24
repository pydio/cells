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
	"path"
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
	Copy              bool
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
	c.Copy = !c.Move

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

	targetNode := &tree.Node{
		Path: c.TargetPlaceholder,
	}
	if c.TargetIsParent {
		targetNode.Path = filepath.Join(targetNode.Path, filepath.Base(sourceNode.Path))
	}

	log.Logger(ctx).Debug("Copy/Move target path is", targetNode.ZapPath(), zap.Bool("targetIsParent", c.TargetIsParent))

	// Do not copy on itself, ignore
	if targetNode.Path == input.Nodes[0].Path {
		return input, nil
	}

	// Handle already existing
	c.suffixPathIfNecessary(ctx, targetNode)

	readR, readE := c.Client.ReadNode(ctx, &tree.ReadNodeRequest{Node: sourceNode})
	if readE != nil {
		log.Logger(ctx).Error("Read Source", zap.Error(readE))
		return input.WithError(readE), readE
	}
	sourceNode = readR.Node
	output := input
	childrenMoved := 0

	session := uuid.New()

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
		var children []*tree.Node
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

		// For Copy case, first create new folders with fresh UUID
		if c.Copy {
			for _, childNode := range children {
				if childNode.IsLeaf() {
					continue
				}

				childPath := childNode.Path
				relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
				targetPath := prefixPathTarget + "/" + relativePath
				channels.StatusMsg <- "Copying " + childPath

				folderNode := childNode.Clone()
				folderNode.Path = targetPath
				folderNode.Uuid = uuid.New()
				_, e := c.Client.CreateNode(ctx, &tree.CreateNodeRequest{Node: folderNode, IndexationSession: session, UpdateIfExists: true})
				if e != nil {
					log.Logger(ctx).Error("-- Create Folder ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
					return output.WithError(e), e
				}
				log.Logger(ctx).Debug("-- Copy Folder Success ", zap.String("to", targetPath), childNode.Zap())
			}
		}

		for idx, childNode := range children {

			childPath := childNode.Path
			relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
			targetPath := prefixPathTarget + "/" + relativePath

			// Copy files - For "Copy" operation, do NOT copy .pydio files
			if childNode.IsLeaf() && (c.Move || path.Base(childPath) != common.PYDIO_SYNC_HIDDEN_FILE_META) {

				log.Logger(ctx).Debug("Copy " + childNode.Path + " to " + targetPath)

				channels.StatusMsg <- "Copying " + childPath

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
				log.Logger(ctx).Debug("-- Copy Success: ", zap.String("to", targetPath), childNode.Zap())

			}

			// Remove original for move case
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
		log.Logger(ctx).Info(fmt.Sprintf("Successfully copied or moved %v, now moving parent node", childrenMoved))
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

	} else if c.Copy {
		session = "close-" + session
		log.Logger(ctx).Info("-- Copying sourceNode with empty Uuid")
		targetNode.Type = tree.NodeType_COLLECTION
		_, e := c.Client.CreateNode(ctx, &tree.CreateNodeRequest{Node: targetNode, IndexationSession: session, UpdateIfExists: true})
		if e != nil {
			return output.WithError(e), e
		}
	}

	output.AppendOutput(&jobs.ActionOutput{
		Success: true,
	})

	return output, nil
}

func (c *CopyMoveAction) suffixPathIfNecessary(ctx context.Context, targetNode *tree.Node) {
	exists := func(node *tree.Node) bool {
		t, e := c.Client.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
		return e == nil && t.Node != nil
	}
	i := 1
	ext := path.Ext(targetNode.Path)
	noExt := strings.TrimSuffix(targetNode.Path, ext)
	for {
		if exists(targetNode) {
			targetNode.Path = fmt.Sprintf("%s-%d%s", noExt, i, ext)
			targetNode.SetMeta("name", path.Base(targetNode.Path))
			i++
		} else {
			break
		}
	}
}
