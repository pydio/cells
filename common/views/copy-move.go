package views

import (
	"context"
	"fmt"
	"path"
	"strings"

	"github.com/pborman/uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

func CopyMoveNodes(ctx context.Context, router Handler, sourceNode *tree.Node, targetNode *tree.Node, move bool, recursive bool, isTask bool, statusChan chan string, progressChan chan float32) error {

	session := uuid.New()
	childrenMoved := 0
	logger := log.Logger(ctx)
	var taskLogger *zap.Logger
	if isTask {
		taskLogger = log.TasksLogger(ctx)
	} else {
		taskLogger = zap.New(zapcore.NewNopCore())
	}

	if recursive && !sourceNode.IsLeaf() {

		prefixPathSrc := strings.TrimRight(sourceNode.Path, "/")
		prefixPathTarget := strings.TrimRight(targetNode.Path, "/")
		targetDsPath := targetNode.GetStringMeta(common.META_NAMESPACE_DATASOURCE_PATH)

		// List all children and move them all
		streamer, err := router.ListNodes(ctx, &tree.ListNodesRequest{
			Node:      sourceNode,
			Recursive: true,
		})
		if err != nil {
			logger.Error("Copy/move - List Nodes", zap.Error(err))
			return err
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
			cMess := fmt.Sprintf("There are %v children to move", len(children))
			logger.Info(cMess)
			taskLogger.Info(cMess)
		}
		total := len(children)

		// For Copy case, first create new folders with fresh UUID
		if !move {
			for _, childNode := range children {
				if childNode.IsLeaf() {
					continue
				}

				childPath := childNode.Path
				relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
				targetPath := prefixPathTarget + "/" + relativePath
				statusChan <- "Copying " + childPath

				folderNode := childNode.Clone()
				folderNode.Path = targetPath
				folderNode.Uuid = uuid.New()
				if targetDsPath != "" {
					folderNode.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, path.Join(targetDsPath, relativePath))
				}
				_, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: folderNode, IndexationSession: session, UpdateIfExists: true})
				if e != nil {
					logger.Error("-- Create Folder ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
					return e
				}
				logger.Debug("-- Copy Folder Success ", zap.String("to", targetPath), childNode.Zap())
				taskLogger.Info("-- Copied Folder To " + targetPath)
			}
		}

		for idx, childNode := range children {

			childPath := childNode.Path
			relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
			targetPath := prefixPathTarget + "/" + relativePath
			targetNode := &tree.Node{Path: targetPath}
			if targetDsPath != "" {
				targetNode.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, path.Join(targetDsPath, relativePath))
			}
			// Copy files - For "Copy" operation, do NOT copy .pydio files
			if childNode.IsLeaf() && (move || path.Base(childPath) != common.PYDIO_SYNC_HIDDEN_FILE_META) {

				logger.Debug("Copy " + childNode.Path + " to " + targetPath)
				statusChan <- "Copying " + childPath

				meta := make(map[string]string, 1)
				if move {
					meta["X-Amz-Metadata-Directive"] = "COPY"
				} else {
					meta["X-Amz-Metadata-Directive"] = "REPLACE"
				}
				meta["X-Pydio-Session"] = session
				_, e := router.CopyObject(ctx, childNode, targetNode, &CopyRequestData{Metadata: meta})
				if e != nil {
					logger.Error("-- Copy ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
					return e
				}
				logger.Debug("-- Copy Success: ", zap.String("to", targetPath), childNode.Zap())
				taskLogger.Info("-- Copied file to: " + targetPath)

			}

			// Remove original for move case
			if move {
				// If we're sending the last Delete here - then we close the session at the same time
				if idx == len(children)-1 {
					session = "close-" + session
				}
				_, moveErr := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: childNode, IndexationSession: session})
				if moveErr != nil {
					log.Logger(ctx).Error("-- Delete Error", zap.Error(moveErr), childNode.Zap())
					return moveErr
				}
				logger.Debug("-- Delete Success " + childNode.Path)
				taskLogger.Info("-- Delete Success for " + childNode.Path)
			}

			childrenMoved++
			progressChan <- float32(childrenMoved) / float32(total)

		}

	}

	if childrenMoved > 0 {
		log.Logger(ctx).Info(fmt.Sprintf("Successfully copied or moved %v, now moving parent node", childrenMoved))
	}

	// Now Copy/Move initial node
	if sourceNode.IsLeaf() {
		meta := make(map[string]string, 1)
		if move {
			meta["X-Amz-Metadata-Directive"] = "COPY"
		} else {
			meta["X-Amz-Metadata-Directive"] = "REPLACE"
		}
		_, e := router.CopyObject(ctx, sourceNode, targetNode, &CopyRequestData{Metadata: meta})
		if e != nil {
			return e
		}
		// Remove Source Node
		if move {
			_, moveErr := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: sourceNode})
			if moveErr != nil {
				logger.Error("-- Delete Source Error", zap.Error(moveErr), sourceNode.Zap())
				return moveErr
			}
		}

	} else if !move {
		session = "close-" + session
		logger.Debug("-- Copying sourceNode with empty Uuid - Close Session")
		targetNode.Type = tree.NodeType_COLLECTION
		_, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: targetNode, IndexationSession: session, UpdateIfExists: true})
		if e != nil {
			return e
		}
		taskLogger.Info("-- Copied sourceNode with empty Uuid - Close Session")
	}

	return nil
}
