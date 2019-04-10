package views

import (
	"context"
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/pborman/uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	context2 "github.com/pydio/cells/common/utils/context"
)

// CopyMoveNodes performs a recursive copy or move operation of a node to a new location. It can be inter- or intra-datasources.
// It will eventually pass contextual metadata like X-Pydio-Session (to batch event inside the SYNC) or X-Pydio-Move (to
// reconciliate creates and deletes when move is done between two differing datasources).
func CopyMoveNodes(ctx context.Context, router Handler, sourceNode *tree.Node, targetNode *tree.Node, move bool, recursive bool, isTask bool, statusChan chan string, progressChan chan float32) (oErr error) {

	session := uuid.New()
	defer func() {
		// Make sure all sessions are purged !
		if p := recover(); p != nil {
			log.Logger(ctx).Error("Error during copy/move", zap.Error(p.(error)))
			oErr = p.(error)
			go func() {
				<-time.After(2 * time.Second)
				log.Logger(ctx).Debug("Force close session now:" + session)
				client.Publish(ctx, client.NewPublication(common.TOPIC_INDEX_EVENT, &tree.IndexEvent{
					SessionForceClose: session,
				}))
			}()
		}
	}()
	publishError := func(dsName, errorPath string) {
		client.Publish(ctx, client.NewPublication(common.TOPIC_INDEX_EVENT, &tree.IndexEvent{
			ErrorDetected:  true,
			DataSourceName: dsName,
			ErrorPath:      errorPath,
		}))
	}
	childrenMoved := 0
	logger := log.Logger(ctx)
	var taskLogger *zap.Logger
	if isTask {
		taskLogger = log.TasksLogger(ctx)
	} else {
		taskLogger = zap.New(zapcore.NewNopCore())
	}
	// Read root of target to detect if it is on the same datasource as sourceNode
	var crossDs bool
	var sourceDs, targetDs string
	sourceDs = sourceNode.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
	if move {
		if tDs := targetNode.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME); tDs != "" {
			targetDs = tDs
			crossDs = targetDs != sourceDs
		} else {
			parts := strings.Split(strings.Trim(targetNode.Path, "/"), "/")
			if len(parts) > 0 {
				if testRoot, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parts[0]}}); e == nil {
					targetDs = testRoot.Node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
					crossDs = targetDs != sourceDs
				}
			}
		}
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
		var statErrors int

		for {
			child, cE := streamer.Recv()
			if cE != nil {
				break
			}
			if child == nil {
				continue
			}
			if child.Node.IsLeaf() {
				if _, statErr := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: child.Node, ObjectStats: true}); statErr != nil {
					statErrors++
				}
			}
			children = append(children, child.Node)
		}
		if statErrors > 0 {
			// There are some missing childrens, this copy/move operation will fail - interrupt now
			publishError(sourceDs, sourceNode.Path)
			return fmt.Errorf("Errors found while copy/move node, stopping")
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
					publishError(targetDs, folderNode.Path)
					panic(e)
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
				if crossDs {
					if idx == len(children)-1 {
						meta["X-Pydio-Session"] = "close-" + session
					}
					if move {
						meta["X-Pydio-Move"] = childNode.Uuid
					}
				}
				_, e := router.CopyObject(ctx, childNode, targetNode, &CopyRequestData{Metadata: meta})
				if e != nil {
					logger.Error("-- Copy ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
					publishError(sourceDs, childNode.Path)
					publishError(targetDs, targetPath)
					panic(e)
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
				delCtx := ctx
				if crossDs {
					delCtx = context2.WithAdditionalMetadata(ctx, map[string]string{"X-Pydio-Move": childNode.Uuid})
				}
				_, moveErr := router.DeleteNode(delCtx, &tree.DeleteNodeRequest{Node: childNode, IndexationSession: session})
				if moveErr != nil {
					log.Logger(ctx).Error("-- Delete Error", zap.Error(moveErr), childNode.Zap())
					publishError(sourceDs, childNode.Path)
					panic(moveErr)
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
			if crossDs {
				meta["X-Pydio-Move"] = sourceNode.Uuid
			}
		} else {
			meta["X-Amz-Metadata-Directive"] = "REPLACE"
		}
		_, e := router.CopyObject(ctx, sourceNode, targetNode, &CopyRequestData{Metadata: meta})
		if e != nil {
			publishError(sourceDs, sourceNode.Path)
			publishError(targetDs, targetNode.Path)
			panic(e)
		}
		// Remove Source Node
		if move {
			if crossDs {
				ctx = context2.WithAdditionalMetadata(ctx, map[string]string{"X-Pydio-Move": sourceNode.Uuid})
			}
			_, moveErr := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: sourceNode})
			if moveErr != nil {
				logger.Error("-- Delete Source Error", zap.Error(moveErr), sourceNode.Zap())
				publishError(sourceDs, sourceNode.Path)
				panic(moveErr)
			}
		}

	} else if !move {
		session = "close-" + session
		logger.Debug("-- Copying sourceNode with empty Uuid - Close Session")
		targetNode.Type = tree.NodeType_COLLECTION
		_, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: targetNode, IndexationSession: session, UpdateIfExists: true})
		if e != nil {
			panic(e)
		}
		taskLogger.Info("-- Copied sourceNode with empty Uuid - Close Session")
	}

	if move {
		// Send an optimistic event => s3 operations are done, let's update UX before indexation is finished
		optimisticTarget := sourceNode.Clone()
		optimisticTarget.Path = targetNode.Path
		optimisticTarget.SetMeta("name", path.Base(targetNode.Path))
		log.Logger(ctx).Debug("Finished move - Sending Optimistic Event", sourceNode.Zap("from"), optimisticTarget.Zap("to"))
		client.Publish(ctx, client.NewPublication(common.TOPIC_TREE_CHANGES, &tree.NodeChangeEvent{
			Optimistic: true,
			Type:       tree.NodeChangeEvent_UPDATE_PATH,
			Source:     sourceNode,
			Target:     optimisticTarget,
		}))
	}

	return
}
