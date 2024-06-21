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

package nodes

import (
	"context"
	"fmt"
	"io"
	"math"
	"path"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/i18n"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type (
	sessionIDKey struct{}
)

const (
	// Consider move takes 1s per 100 MB of data to copy
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

func extractDSFlat(ctx context.Context, handler Handler, sourceNode, targetNode *tree.Node) (innerFlat, srcFlat, targetFlat bool) {
	if router, ok := handler.(Client); ok {
		// We passed a router, call is external, use WrapCallback
		router.WrapCallback(func(inputFilter FilterFunc, outputFilter FilterFunc) error {
			srcCtx, _, _ := inputFilter(ctx, sourceNode, "from")
			tgtCtx, _, _ := inputFilter(ctx, targetNode, "to")
			srcDS, _ := GetBranchInfo(srcCtx, "from")
			tgtDS, _ := GetBranchInfo(tgtCtx, "to")
			if srcDS.Name == tgtDS.Name && srcDS.FlatStorage {
				innerFlat = true
			}
			targetFlat = tgtDS.FlatStorage
			srcFlat = srcDS.FlatStorage
			return nil
		})
	} else {
		// We passed a Handler, we are already in the routing stack, contexts should be loaded
		srcDS, _ := GetBranchInfo(ctx, "from")
		tgtDS, _ := GetBranchInfo(ctx, "to")
		if srcDS.Name == tgtDS.Name && srcDS.FlatStorage {
			innerFlat = true
		}
		targetFlat = tgtDS.FlatStorage
		srcFlat = srcDS.FlatStorage
	}
	return
}

// Is403 checks if error is not nil and has code 403
func Is403(e error) bool {
	return errors.Is(e, errors.StatusForbidden)
}

// CopyMoveNodes performs a recursive copy or move operation of a node to a new location. It can be inter- or intra-datasources.
// It will eventually pass contextual metadata like X-Pydio-Session (to batch event inside the SYNC) or X-Pydio-Move (to
// reconcile creates and deletes when move is done between two differing datasources).
func CopyMoveNodes(ctx context.Context, router Handler, sourceNode *tree.Node, targetNode *tree.Node, move bool, isTask bool, statusChan chan string, progressChan chan float32, tFunc ...i18n.TranslateFunc) (oErr error) {

	innerFlat, sourceFlat, targetFlat := extractDSFlat(ctx, router, sourceNode, targetNode)

	if innerFlat && move {
		log.Logger(ctx).Debug("Move on Flat storage : switching to direct index update")
		_, e := router.UpdateNode(ctx, &tree.UpdateNodeRequest{From: sourceNode, To: targetNode})
		return e
	}

	sessionPrefix := common.SyncSessionPrefixCopy
	if move {
		sessionPrefix = common.SyncSessionPrefixMove
	}
	session := sessionPrefix + uuid.New()

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
				broker.MustPublish(context.Background(), common.TopicIndexEvent, &tree.IndexEvent{
					SessionForceClose: session,
				})
				if locker != nil {
					locker.Unlock(ctx)
				}
			}()
		} else if targetFlat && locker != nil {
			locker.Unlock(ctx)
		}
	}()

	publishError := func(dsName, errorPath string) {
		broker.MustPublish(context.Background(), common.TopicIndexEvent, &tree.IndexEvent{
			ErrorDetected:  true,
			DataSourceName: dsName,
			ErrorPath:      errorPath,
		})
	}

	// Setting up logger
	logger := log.Logger(ctx)
	var taskLogger log.ZapLogger
	taskLogger = log.TasksLogger(ctx)
	/*
		if isTask {
			taskLogger = log.TasksLogger(ctx)
		} else {
			taskLogger = zap.New(zapcore.NewNopCore())
		}
	*/

	// Read root of target to detect if it is on the same datasource as sourceNode
	var crossDs bool
	var sourceDs, targetDs string
	sourceDs = sourceNode.GetStringMeta(common.MetaNamespaceDatasourceName)
	if move {
		if tDs := targetNode.GetStringMeta(common.MetaNamespaceDatasourceName); tDs != "" {
			targetDs = tDs
			crossDs = targetDs != sourceDs
		} else {
			parts := strings.Split(strings.Trim(targetNode.Path, "/"), "/")
			if len(parts) > 0 {
				if testRoot, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: parts[0]}}); e == nil {
					targetDs = testRoot.Node.GetStringMeta(common.MetaNamespaceDatasourceName)
					crossDs = targetDs != sourceDs
				}
			}
		}
	}
	var childLockDir, childLockBase string
	if parentTarget, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Dir(targetNode.Path)}}); e == nil {
		childLockDir = parentTarget.GetNode().Uuid
		childLockBase = path.Base(targetNode.Path)
	}

	if !IsUnitTestEnv { // Do not trigger during unit tests as it calls ACL service
		if move {
			log.Logger(ctx).Debug("Setting Lock on SourceNode with session " + session)
			locker = permissions.NewLockSession(sourceNode.Uuid, session, time.Second*30)
		} else {
			locker = permissions.NewLockSession("", session, time.Second*30)
		}
		if childLockDir != "" {
			log.Logger(ctx).Debug("Setting ChildLock on TargetNode Parent")
			locker.AddChildTarget(childLockDir, childLockBase)
		}
		// Will be unlocked by sync process, or if targetFlat, manually unlock
		if err := locker.Lock(ctx); err != nil {
			log.Logger(ctx).Warn("Could not init lockSession", zap.Error(err))
		}
	}

	if !sourceNode.IsLeaf() {

		if targetFlat || sourceFlat {
			log.Logger(ctx).Debug("[Flat Target] Creating target folder before copy")
			// Manually create target folder
			tgtUuid := uuid.New()
			tgt := ctx
			if move {
				tgtUuid = sourceNode.Uuid
				tgt = propagator.WithAdditionalMetadata(tgt, map[string]string{common.XPydioMoveUuid: session})
			}
			if _, e := router.CreateNode(tgt, &tree.CreateNodeRequest{Node: &tree.Node{
				Uuid:  tgtUuid,
				Path:  targetNode.Path,
				Type:  tree.NodeType_COLLECTION,
				MTime: time.Now().Unix(),
			}, IndexationSession: session}); e != nil {
				return e
			}

		}

		prefixPathSrc := strings.TrimRight(sourceNode.Path, "/")
		prefixPathTarget := strings.TrimRight(targetNode.Path, "/")
		targetDsPath := targetNode.GetStringMeta(common.MetaNamespaceDatasourcePath)
		skipAclContext := WithSkipAclCheck(ctx)

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
		defer streamer.CloseSend()
		var statErrors int
		var foldersCount, fileCounts int

		for {
			child, cE := streamer.Recv()
			if cE != nil {
				break
			}
			if child == nil {
				continue
			}
			if child.Node.IsLeaf() {
				if _, statErr := router.ReadNode(skipAclContext, &tree.ReadNodeRequest{Node: child.Node, ObjectStats: true}); statErr != nil {
					statErrors++
				}
				totalSize += child.Node.Size
				fileCounts++
			} else {
				foldersCount++
			}
			children = append(children, child.Node)
		}
		if statErrors > 0 {
			// There are some missing children, this copy/move operation will fail - interrupt now
			publishError(sourceDs, sourceNode.Path)
			return fmt.Errorf("errors found while copy/move node, stopping")
		}

		if len(children) > 0 {
			cMess := fmt.Sprintf("There are %v children to move", len(children))
			logger.Info(cMess)
			taskLogger.Info(cMess)
		}
		//total := len(children)

		if !move || targetFlat || sourceFlat {
			// For Copy case, first create new folders with fresh UUID - For FlatTarget, create with previous node Uuid
			for fI, childNode := range children {
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
				createContext := skipAclContext
				sess := session
				if (targetFlat || sourceFlat) && move {
					if sourceFlat && fileCounts == 0 && fI == len(children)-1 {
						log.Logger(ctx).Info("Sending session close on last folder")
						sess = common.SyncSessionClose_ + session
					}
					createContext = propagator.WithAdditionalMetadata(createContext, map[string]string{
						common.XPydioMoveUuid: session,
					})
					folderNode.Uuid = childNode.Uuid
				}
				if targetDsPath != "" {
					folderNode.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Join(targetDsPath, relativePath))
				}
				log.Logger(ctx).Info("Creating folder", folderNode.ZapPath(), folderNode.ZapUuid())
				_, e := router.CreateNode(createContext, &tree.CreateNodeRequest{Node: folderNode, IndexationSession: sess, UpdateIfExists: true})
				if e != nil {
					logger.Error("-- Create Folder ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
					publishError(targetDs, folderNode.Path)
					panic(e)
				}
				logger.Debug("-- Copy Folder Success ", zap.String("to", targetPath), childNode.Zap())
				taskLogger.Info("-- Copied Folder To " + targetPath)
			}
		}
		if move {
			// For move, update lock expiration based on total size
			updateLockerForByteSize(ctx, locker, totalSize, len(children))
		}

		wg := &sync.WaitGroup{}
		queue := make(chan struct{}, 4)

		t := time.Now()
		var lastNode *tree.Node
		var errs []error
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
				e := processCopyMove(skipAclContext, router, session, move, crossDs, sourceDs, targetDs, sourceFlat, targetFlat, false, childNode, prefixPathSrc, prefixPathTarget, targetDsPath, logger, publishError, statusChan, progress, tFunc...)
				if Is403(e) {
					childrenMoved++
					taskLogger.Info("-- Ignoring " + childNode.Path + " (" + e.Error() + ")")
				} else if e != nil {
					errs = append(errs, e)
				} else {
					childrenMoved++
					taskLogger.Info("-- Copy/Move Success for " + childNode.Path)
				}
			}()

		}
		wg.Wait()
		if len(errs) > 0 {
			panic(errs[0])
		}
		if lastNode != nil {
			// Now process very last node
			e := processCopyMove(skipAclContext, router, session, move, crossDs, sourceDs, targetDs, sourceFlat, targetFlat, true, lastNode, prefixPathSrc, prefixPathTarget, targetDsPath, logger, publishError, statusChan, progress, tFunc...)
			if Is403(e) {
				childrenMoved++
				taskLogger.Info("-- Ignoring " + lastNode.Path + " (" + e.Error() + ")")
			} else if e != nil {
				panic(e)
			} else {
				childrenMoved++
				taskLogger.Info("-- Copy/Move Success for " + lastNode.Path)
			}
		}
		log.Logger(ctx).Info("Recursive copy operation timing", zap.Duration("duration", time.Since(t)))

	}

	if childrenMoved > 0 {
		log.Logger(ctx).Info(fmt.Sprintf("Successfully copied or moved %v, now moving parent node", childrenMoved))
	}

	// Now Copy/Move initial node
	if sourceNode.IsLeaf() {

		updateLockerForByteSize(ctx, locker, sourceNode.Size, 1)

		// Prepare Meta for Copy/Delete operations. If Move across DS or Copy, we send directly the close- session
		// as this will be a one shot operation on each datasource.
		copyMeta := make(map[string]string)
		copyCtxMeta := make(map[string]string)
		deleteMeta := make(map[string]string)
		closeSession := common.SyncSessionClose_ + session
		if move {
			copyMeta[common.XAmzMetaDirective] = "COPY"
			deleteMeta[common.XPydioSessionUuid] = closeSession
			if crossDs {
				copyCtxMeta[common.XPydioSessionUuid] = closeSession
				// Identify copy/delete across 2 datasources
				copyCtxMeta[common.XPydioMoveUuid] = session
				deleteMeta[common.XPydioMoveUuid] = session
			} else {
				copyCtxMeta[common.XPydioSessionUuid] = session
			}
		} else {
			copyMeta[common.XAmzMetaDirective] = "REPLACE"
			copyCtxMeta[common.XPydioSessionUuid] = closeSession
		}
		statusChan <- copyMoveStatusKey(sourceNode.Path, move, tFunc...)

		_, e := router.CopyObject(propagator.WithAdditionalMetadata(ctx, copyCtxMeta), sourceNode, targetNode, &models.CopyRequestData{
			Metadata: copyMeta,
			Progress: &copyPgReader{offset: 0, total: sourceNode.Size, progressChan: progressChan},
		})
		if e != nil {
			publishError(sourceDs, sourceNode.Path)
			publishError(targetDs, targetNode.Path)
			panic(e)
		}
		// Remove Source N
		if move {
			ctx = propagator.WithAdditionalMetadata(ctx, deleteMeta)
			_, moveErr := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: sourceNode})
			if moveErr != nil {
				logger.Error("-- Delete Source Error / Reverting Copy", zap.Error(moveErr), sourceNode.Zap())
				router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: targetNode})
				publishError(sourceDs, sourceNode.Path)
				panic(moveErr)
			}
		}
	} else {
		if move && sourceFlat {

			// Flat source : remove original folder
			log.Logger(ctx).Info("Removing source folder after move")
			// Manually create target folder
			tgt := propagator.WithAdditionalMetadata(ctx, map[string]string{common.XPydioMoveUuid: session})
			if _, e := router.DeleteNode(tgt, &tree.DeleteNodeRequest{Node: sourceNode}); e != nil {
				return e
			}

			if !targetFlat && childrenMoved == 0 {
				// Moved only an empty folder - make sure to close sync session
				_ = broker.Publish(context.Background(), common.TopicIndexEvent, &tree.IndexEvent{
					SessionForceClose: session,
				})
			}

		}
		if !move && !targetFlat {

			// Now create root target in index, except in Flat mode
			session = common.SyncSessionClose_ + session
			logger.Debug("-- Copying sourceNode with empty Uuid - Close Session")
			targetNode.Type = tree.NodeType_COLLECTION
			// Warning - It may have been already created by createParentIfNotExists, do not override UUID !
			if r, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: targetNode}); e == nil && r != nil {
				targetNode.Uuid = r.GetNode().GetUuid()
			}
			_, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: targetNode, IndexationSession: session, UpdateIfExists: true})
			if e != nil {
				panic(e)
			}
			taskLogger.Info("-- Copied sourceNode with empty Uuid - Close Session")

		}
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
	log.Logger(ctx).Debug("Updating lock expiration to ", zap.Duration("duration", newD))
	locker.UpdateExpiration(ctx, newD)
}

func copyMoveStatusKey(keyPath string, move bool, tFunc ...i18n.TranslateFunc) string {
	var statusPath = keyPath
	if path.Base(statusPath) == common.PydioSyncHiddenFile {
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

func processCopyMove(ctx context.Context, handler Handler, session string, move, crossDs bool, sourceDs, targetDs string, sourceFlat, targetFlat, closeSession bool, childNode *tree.Node, prefixPathSrc, prefixPathTarget, targetDsPath string, logger log.ZapLogger, publishError func(string, string), statusChan chan string, progress io.Reader, tFunc ...i18n.TranslateFunc) error {

	childPath := childNode.Path
	relativePath := strings.TrimPrefix(childPath, prefixPathSrc+"/")
	targetPath := prefixPathTarget + "/" + relativePath
	targetNode := &tree.Node{Path: targetPath}
	if targetDsPath != "" {
		targetNode.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Join(targetDsPath, relativePath))
	}
	var justCopied *tree.Node
	justCopied = nil
	isHidden := path.Base(childPath) == common.PydioSyncHiddenFile
	// Copy files - For "Copy" operation or targetFlat, do NOT copy .pydio files
	if childNode.IsLeaf() && !(isHidden && (!move || targetFlat)) {

		logger.Info("Copy "+childNode.Path+" to "+targetPath, zap.Bool("isHidden", isHidden), zap.Bool("targetFlat", targetFlat))

		statusChan <- copyMoveStatusKey(relativePath, move, tFunc...)

		meta := make(map[string]string, 1)
		ctxMeta := make(map[string]string)
		if move {
			meta[common.XAmzMetaDirective] = "COPY"
		} else {
			meta[common.XAmzMetaDirective] = "REPLACE"
		}
		ctxMeta[common.XPydioSessionUuid] = session
		if crossDs {
			/*
				if idx == len(children)-1 {
					meta[common.XPydioSessionUuid] = "close-" + session
				}
			*/
			if closeSession {
				ctxMeta[common.XPydioSessionUuid] = common.SyncSessionClose_ + session
			}
			if move {
				ctxMeta[common.XPydioMoveUuid] = session
			}
		}
		_, e := handler.CopyObject(propagator.WithAdditionalMetadata(ctx, ctxMeta), childNode, targetNode, &models.CopyRequestData{
			Metadata: meta,
			Progress: progress,
		})
		if Is403(e) {
			logger.Warn("-- Copy Ignored", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
			return e
		}
		if e != nil {
			logger.Error("-- Copy ERROR", zap.Error(e), zap.Any("from", childNode.Path), zap.Any("to", targetPath))
			publishError(sourceDs, childNode.Path)
			publishError(targetDs, targetPath)
			return e
		}
		justCopied = targetNode
		logger.Debug("-- Copy Success: ", zap.String("to", targetPath), childNode.Zap())

	}

	// Remove original for move case - Skip folders for flat targets, as they are removed recursively
	if move && !(!childNode.IsLeaf() && sourceFlat) {
		// If we're sending the last Delete here - then we close the session at the same time
		originalSession := session
		if closeSession {
			session = common.SyncSessionClose_ + session
		}
		delCtx := ctx
		if crossDs {
			delCtx = propagator.WithAdditionalMetadata(ctx, map[string]string{common.XPydioMoveUuid: originalSession})
		}
		_, moveErr := handler.DeleteNode(delCtx, &tree.DeleteNodeRequest{Node: childNode, IndexationSession: session})
		if moveErr != nil {
			log.Logger(ctx).Error("-- Delete Error / Reverting Copy", zap.Error(moveErr), childNode.Zap())
			if justCopied != nil {
				if _, revertErr := handler.DeleteNode(delCtx, &tree.DeleteNodeRequest{Node: justCopied}); revertErr != nil {
					log.Logger(ctx).Error("---- Could not Revert", zap.Error(revertErr), justCopied.Zap())
				}
			}
			if Is403(moveErr) {
				moveErr = fmt.Errorf("some original objects are not allowed to be deleted") // replace by a non-403 to trigger error
			} else {
				publishError(sourceDs, childNode.Path)
			}
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
