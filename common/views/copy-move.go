package views

import (
	"context"
	"fmt"
	"io"
	"math"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/nicksnyder/go-i18n/i18n"
	"github.com/pborman/uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/utils/permissions"
)

type (
	sessionIDKey struct{}
)

const (
	// Consider move takes 1s per 100MB of data to copy
	lockExpirationRatioSize   = 1024 * 1024 * 100
	lockExpirationRatioNumber = 25
)

// WithSessionID returns a context which knows its service assigned color
func WithSessionID(ctx context.Context, session string) context.Context {
	return context.WithValue(ctx, sessionIDKey{}, session)
}

// GetSessionID returns the session ID in context
func GetSessionID(ctx context.Context) (string, bool) {
	res, ok := ctx.Value(sessionIDKey{}).(string)
	return res, ok
}

// CopyMoveNodes performs a recursive copy or move operation of a node to a new location. It can be inter- or intra-datasources.
// It will eventually pass contextual metadata like X-Pydio-Session (to batch event inside the SYNC) or X-Pydio-Move (to
// reconciliate creates and deletes when move is done between two differing datasources).
func CopyMoveNodes(ctx context.Context, router Handler, sourceNode *tree.Node, targetNode *tree.Node, move bool, recursive bool, isTask bool, statusChan chan string, progressChan chan float32, tFunc ...i18n.TranslateFunc) (oErr error) {

	session := uuid.New()
	childrenMoved := 0
	var totalSize int64

	var locker permissions.SessionLocker
	ctx = WithSessionID(ctx, session)

	// Make sure all sessions are purged !
	defer func() {
		if p := recover(); p != nil {
			log.Logger(ctx).Error("Error during copy/move", zap.Error(p.(error)))
			oErr = p.(error)
			go func() {
				<-time.After(10 * time.Second)
				log.Logger(ctx).Info("Forcing close session " + session + " and unlock")
				client.Publish(context.Background(), client.NewPublication(common.TOPIC_INDEX_EVENT, &tree.IndexEvent{
					SessionForceClose: session,
				}))
				if locker != nil {
					locker.Unlock(ctx)
				}
			}()
		}
	}()

	// TODO - should be its own function really ?
	publishError := func(dsName, errorPath string) {
		client.Publish(context.Background(), client.NewPublication(common.TOPIC_INDEX_EVENT, &tree.IndexEvent{
			ErrorDetected:  true,
			DataSourceName: dsName,
			ErrorPath:      errorPath,
		}))
	}

	// Setting up logger
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

	if move && !IsUnitTestEnv { // Do not trigger during unit tests as it calls ACL service
		log.Logger(ctx).Info("Setting Lock on Node with session " + session)
		locker = permissions.NewLockSession(sourceNode.Uuid, session, time.Second*30)
		// Will be unlocked by sync process
		if err := locker.Lock(ctx); err != nil {
			log.Logger(ctx).Warn("Could not init lockSession", zap.Error(err))
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
				totalSize += child.Node.Size
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
		//total := len(children)

		if !move {
			// For Copy case, first create new folders with fresh UUID
			for _, childNode := range children {
				if childNode.IsLeaf() {
					continue
				}

				childPath := childNode.Path
				relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
				targetPath := prefixPathTarget + "/" + relativePath

				statusChan <- copyMoveStatusKey(relativePath, move, tFunc...)

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
		} else {
			// For move, update lock expiration based on total size
			updateLockerForByteSize(ctx, locker, totalSize, len(children))
		}

		wg := &sync.WaitGroup{}
		queue := make(chan struct{}, 4)

		t := time.Now()
		var lastNode *tree.Node
		var errors []error
		progress := &copyPgReader{
			progressChan: progressChan,
			total:        totalSize,
		}
		for idx, childNode := range children {

			if idx == len(children)-1 {
				lastNode = childNode
				continue
			}
			// copy for inner function
			childNode := childNode

			wg.Add(1)
			queue <- struct{}{}
			go func() {
				defer func() {
					<-queue
					defer wg.Done()
				}()
				e := processCopyMove(ctx, router, session, move, crossDs, sourceDs, targetDs, false, childNode, prefixPathSrc, prefixPathTarget, targetDsPath, logger, publishError, statusChan, progress, tFunc...)
				if e != nil {
					errors = append(errors, e)
				} else {
					childrenMoved++
					taskLogger.Info("-- Copy/Move Success for " + childNode.Path)
				}
			}()

		}
		wg.Wait()
		if len(errors) > 0 {
			panic(errors[0])
		}
		if lastNode != nil {
			// Now process very last node
			e := processCopyMove(ctx, router, session, move, crossDs, sourceDs, targetDs, true, lastNode, prefixPathSrc, prefixPathTarget, targetDsPath, logger, publishError, statusChan, progress, tFunc...)
			if e != nil {
				panic(e)
			}
			childrenMoved++
			taskLogger.Info("-- Copy/Move Success for " + lastNode.Path)
		}
		log.Logger(ctx).Info("Recursive copy operation timing", zap.Duration("duration", time.Now().Sub(t)))

	}

	if childrenMoved > 0 {
		log.Logger(ctx).Info(fmt.Sprintf("Successfully copied or moved %v, now moving parent node", childrenMoved))
	}

	// Now Copy/Move initial node
	if sourceNode.IsLeaf() {

		updateLockerForByteSize(ctx, locker, sourceNode.Size, 1)

		// Prepare Meta for Copy/Delete operations. If Move accross DS or Copy, we send directly the close- session
		// as this will be a one shot operation on each datasource.
		copyMeta := make(map[string]string)
		deleteMeta := make(map[string]string)
		closeSession := common.SyncSessionClose_ + session
		if move {
			copyMeta[common.X_AMZ_META_DIRECTIVE] = "COPY"
			deleteMeta[common.XPydioSessionUuid] = closeSession
			if crossDs {
				copyMeta[common.XPydioSessionUuid] = closeSession
				// Identify copy/delete across 2 datasources
				copyMeta[common.XPydioMoveUuid] = sourceNode.Uuid
				deleteMeta[common.XPydioMoveUuid] = sourceNode.Uuid
			} else {
				copyMeta[common.XPydioSessionUuid] = session
			}
		} else {
			copyMeta[common.X_AMZ_META_DIRECTIVE] = "REPLACE"
			copyMeta[common.XPydioSessionUuid] = closeSession
		}
		statusChan <- copyMoveStatusKey(sourceNode.Path, move, tFunc...)

		_, e := router.CopyObject(ctx, sourceNode, targetNode, &CopyRequestData{
			Metadata: copyMeta,
			Progress: &copyPgReader{offset: 0, total: sourceNode.Size, progressChan: progressChan},
		})
		if e != nil {
			publishError(sourceDs, sourceNode.Path)
			publishError(targetDs, targetNode.Path)
			panic(e)
		}
		// Remove Source Node
		if move {
			ctx = context2.WithAdditionalMetadata(ctx, deleteMeta)
			_, moveErr := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: sourceNode})
			if moveErr != nil {
				logger.Error("-- Delete Source Error / Reverting Copy", zap.Error(moveErr), sourceNode.Zap())
				router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: targetNode})
				publishError(sourceDs, sourceNode.Path)
				panic(moveErr)
			}
		}

	} else if !move {
		session = common.SyncSessionClose_ + session
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

func updateLockerForByteSize(ctx context.Context, locker permissions.SessionLocker, totalSize int64, numberOfFiles int) {
	if locker == nil {
		return
	}
	countRatio := math.Ceil(float64(numberOfFiles) / float64(lockExpirationRatioNumber))
	ratio := math.Ceil(float64(totalSize) / float64(lockExpirationRatioSize))
	r := math.Max(countRatio, ratio) + 2
	newD := time.Duration(int64(r) * int64(time.Second))
	log.Logger(ctx).Info("Updating lock expiration to ", zap.Duration("duration", newD))
	locker.UpdateExpiration(ctx, newD)
}

func copyMoveStatusKey(keyPath string, move bool, tFunc ...i18n.TranslateFunc) string {
	var statusPath = keyPath
	if path.Base(statusPath) == common.PYDIO_SYNC_HIDDEN_FILE_META {
		statusPath = path.Dir(statusPath)
	}
	statusPath = path.Base(statusPath)
	status := "Copying " + statusPath
	tKey := "Jobs.User.CopyingItem"
	if move {
		status = "Moving " + statusPath
		tKey = "Jobs.User.MovingItem"
	}
	if len(tFunc) > 0 {
		status = strings.Replace(tFunc[0](tKey), "%s", statusPath, -1)
	}
	return status
}

func processCopyMove(ctx context.Context, handler Handler, session string, move, crossDs bool, sourceDs, targetDs string, closeSession bool, childNode *tree.Node, prefixPathSrc, prefixPathTarget, targetDsPath string, logger *zap.Logger, publishError func(string, string), statusChan chan string, progress io.Reader, tFunc ...i18n.TranslateFunc) error {

	childPath := childNode.Path
	relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
	targetPath := prefixPathTarget + "/" + relativePath
	targetNode := &tree.Node{Path: targetPath}
	if targetDsPath != "" {
		targetNode.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, path.Join(targetDsPath, relativePath))
	}
	var justCopied *tree.Node
	justCopied = nil
	// Copy files - For "Copy" operation, do NOT copy .pydio files
	if childNode.IsLeaf() && (move || path.Base(childPath) != common.PYDIO_SYNC_HIDDEN_FILE_META) {

		logger.Debug("Copy " + childNode.Path + " to " + targetPath)

		statusChan <- copyMoveStatusKey(relativePath, move, tFunc...)

		meta := make(map[string]string, 1)
		if move {
			meta[common.X_AMZ_META_DIRECTIVE] = "COPY"
		} else {
			meta[common.X_AMZ_META_DIRECTIVE] = "REPLACE"
		}
		meta[common.XPydioSessionUuid] = session
		if crossDs {
			/*
				if idx == len(children)-1 {
					meta[common.XPydioSessionUuid] = "close-" + session
				}
			*/
			if closeSession {
				meta[common.XPydioSessionUuid] = common.SyncSessionClose_ + session
			}
			if move {
				meta[common.XPydioMoveUuid] = childNode.Uuid
			}
		}
		_, e := handler.CopyObject(ctx, childNode, targetNode, &CopyRequestData{
			Metadata: meta,
			Progress: progress,
		})
		if e != nil {
			logger.Error("-- Copy ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
			publishError(sourceDs, childNode.Path)
			publishError(targetDs, targetPath)
			return e
		}
		justCopied = targetNode
		logger.Debug("-- Copy Success: ", zap.String("to", targetPath), childNode.Zap())

	}

	// Remove original for move case
	if move {
		// If we're sending the last Delete here - then we close the session at the same time
		if closeSession {
			session = common.SyncSessionClose_ + session
		}
		delCtx := ctx
		if crossDs {
			delCtx = context2.WithAdditionalMetadata(ctx, map[string]string{common.XPydioMoveUuid: childNode.Uuid})
		}
		_, moveErr := handler.DeleteNode(delCtx, &tree.DeleteNodeRequest{Node: childNode, IndexationSession: session})
		if moveErr != nil {
			log.Logger(ctx).Error("-- Delete Error / Reverting Copy", zap.Error(moveErr), childNode.Zap())
			if justCopied != nil {
				if _, revertErr := handler.DeleteNode(delCtx, &tree.DeleteNodeRequest{Node: justCopied}); revertErr != nil {
					log.Logger(ctx).Error("---- Could not Revert", zap.Error(revertErr), justCopied.Zap())
				}
			}
			publishError(sourceDs, childNode.Path)
			return moveErr
		}
		logger.Debug("-- Delete Success " + childNode.Path)
	}

	return nil
}

type copyPgReader struct {
	offset       int64
	total        int64
	progressChan chan float32
}

func (c *copyPgReader) Read(p []byte) (n int, err error) {
	c.offset += int64(len(p))
	c.progressChan <- float32(c.offset) / float32(c.total)
	return len(p), nil
}
