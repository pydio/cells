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

package grpc

import (
	"context"
	"fmt"
	"net/http"
	"runtime/debug"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	servicecontext "github.com/pydio/cells/common/service/context"
	cindex "github.com/pydio/cells/common/sql/index"
	"github.com/pydio/cells/common/utils/mtree"
	"github.com/pydio/cells/data/source/index"
	"github.com/pydio/cells/data/source/index/sessions"
)

// TreeServer definition.
type TreeServer struct {
	DataSourceName     string
	DataSourceInternal bool
	client             client.Client
	sessionStore       sessions.DAO
}

/* =============================================================================
 *  Server public Methods
 * ============================================================================ */

func init() {}

func getDAO(ctx context.Context, session string) index.DAO {

	dao := cindex.NewFolderSizeCacheDAO(
		cindex.NewHiddenFileDuplicateRemoverDAO(servicecontext.GetDAO(ctx).(index.DAO)),
	)

	if session != "" {
		if dao := index.GetDAOCache(session); dao != nil {
			return dao.(index.DAO)
		}
		return index.NewDAOCache(session, dao).(index.DAO)
	}

	return dao
}

// NewTreeServer factory.
func NewTreeServer(ds *object.DataSource) *TreeServer {
	return &TreeServer{
		DataSourceName:     ds.Name,
		DataSourceInternal: ds.IsInternal(),
		client:             client.NewClient(),
		sessionStore:       sessions.NewSessionMemoryStore(),
	}
}

// setDataSourceMeta adds the datasource name as metadata, and eventually the internal flag
func (s *TreeServer) setDataSourceMeta(node *mtree.TreeNode) {
	node.SetMeta(common.MetaNamespaceDatasourceName, s.DataSourceName)
	if s.DataSourceInternal {
		node.SetMeta(common.MetaNamespaceDatasourceInternal, true)
	}
}

// updateMeta simplifies the dao.SetNodeMeta call
func (s *TreeServer) updateMeta(dao index.DAO, node *mtree.TreeNode, reqNode *tree.Node) (previousEtag string, contentChange bool, err error) {
	if node.IsLeaf() {
		previousEtag = node.Etag
		if previousEtag != common.NodeFlagEtagTemporary {
			contentChange = true
		}
	}
	// Replace meta
	node.Size = reqNode.Size
	node.Etag = reqNode.Etag
	node.Type = reqNode.Type
	node.MTime = reqNode.MTime
	node.Mode = reqNode.Mode
	err = dao.SetNodeMeta(node)
	return
}

// CreateNode implementation for the TreeServer.
func (s *TreeServer) CreateNode(ctx context.Context, req *tree.CreateNodeRequest, resp *tree.CreateNodeResponse) (err error) {

	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in CreateNode: %s. Node path was %s", r, req.Node.Path)
			fmt.Printf("%s\n", debug.Stack())
		}
	}()

	dao := getDAO(ctx, req.GetIndexationSession())
	name := servicecontext.GetServiceName(ctx)

	var node *mtree.TreeNode
	var previousEtag string
	eventType := tree.NodeChangeEvent_CREATE

	inSession := req.IndexationSession != ""

	reqUUID := req.GetNode().GetUuid()
	updateIfExists := req.GetUpdateIfExists() || !req.GetNode().IsLeaf()

	log.Logger(ctx).Debug("CreateNode", req.GetNode().Zap())

	// Updating node based on UUID
	if reqUUID != "" {
		if node, err = dao.GetNodeByUUID(reqUUID); err != nil {
			return errors.Forbidden(name, "Could not retrieve by uuid: %s", err.Error())
		} else if node != nil && updateIfExists {
			if etag, content, err := s.updateMeta(dao, node, req.GetNode()); err != nil {
				return errors.Forbidden(name, "Could not replace previous node: %s", err.Error())
			} else {
				previousEtag = etag
				if content && previousEtag != common.NodeFlagEtagTemporary {
					eventType = tree.NodeChangeEvent_UPDATE_CONTENT
				}
				node.Path = req.GetNode().GetPath()
				s.setDataSourceMeta(node)
				if err := s.UpdateParentsAndNotify(ctx, dao, req.GetNode().GetSize(), eventType, nil, node, req.IndexationSession); err != nil {
					return errors.InternalServerError(common.ServiceDataIndex_, "Error while updating parents: %s", err.Error())
				}
				resp.Success = true
				resp.Node = node.Node
				return nil
			}
		} else if node != nil {
			return errors.New(name, fmt.Sprintf("A node with same UUID already exists. Pass updateIfExists parameter if you are sure to override. %v", err), http.StatusConflict)
		}
	}

	reqPath := safePath(req.GetNode().GetPath())
	var path mtree.MPath
	var created []*mtree.TreeNode
	var exists bool
	if updateIfExists {
		// First search node by path to avoid false created value
		if existing, _, err := dao.Path(reqPath, false, req.GetNode()); err == nil && existing != nil {
			path = existing
			exists = true
		}
	}
	if !exists {
		path, created, err = dao.Path(reqPath, true, req.GetNode())
		if err != nil {
			return errors.InternalServerError(name, "Error while inserting node: %s", err.Error())
		}
	}

	// Checking if we have a node with the same path
	if len(created) == 0 {
		if updateIfExists {
			node, _ = dao.GetNode(path)
			if etag, content, err := s.updateMeta(dao, node, req.GetNode()); err != nil {
				return errors.Forbidden(name, "Could not replace previous node: %s", err.Error())
			} else {
				previousEtag = etag
				if content && previousEtag != common.NodeFlagEtagTemporary {
					eventType = tree.NodeChangeEvent_UPDATE_CONTENT
				}
			}
		} else {
			return errors.New(name, "Node path already in use", http.StatusConflict)
		}
	} else if len(created) > 1 && !updateIfExists && !inSession {
		// Special case : when not in indexation mode, if node creation
		// has triggered creation of parents, send notifications for parents as well
		for _, parent := range created[:len(created)-1] {
			s.setDataSourceMeta(parent)
			client.Publish(ctx, client.NewPublication(common.TopicIndexChanges, &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_CREATE,
				Target: parent.Node,
			}))
		}
	}

	if node == nil {
		node, err = dao.GetNode(path)
		if err != nil || node == nil {
			return fmt.Errorf("could not retrieve node %s", reqPath)
		}
	}

	// Updating Commits - This is never used, avoid overhead of an insert
	/*
		newEtag := req.GetNode().GetEtag()
		if node.IsLeaf() && newEtag != common.NodeFlagEtagTemporary && (previousEtag == "" || newEtag != previousEtag) {
			if err := dao.PushCommit(node); err != nil {
				log.Logger(ctx).Error("Error while pushing commit for node", node.Zap(), zap.Error(err))
			}
		}
	*/

	node.Path = reqPath
	s.setDataSourceMeta(node)

	// Propagate mime meta
	if req.GetNode().GetStringMeta(common.MetaNamespaceMime) != "" {
		node.SetMeta(common.MetaNamespaceMime, req.GetNode().GetStringMeta(common.MetaNamespaceMime))
	}

	if err := s.UpdateParentsAndNotify(ctx, dao, req.GetNode().GetSize(), eventType, nil, node, req.IndexationSession); err != nil {
		return errors.InternalServerError(common.ServiceDataIndex_, "Error while updating parents: %s", err.Error())
	}

	resp.Success = true
	resp.Node = node.Node

	return nil
}

// ReadNode implementation for the TreeServer.
func (s *TreeServer) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, resp *tree.ReadNodeResponse) error {

	defer track(ctx, "ReadNode", time.Now(), req, resp)

	var session = ""
	md, has := metadata.FromContext(ctx)
	if has {
		if s, ok := md["x-indexation-session"]; ok {
			session = s
		}
	}

	dao := getDAO(ctx, session)

	name := servicecontext.GetServiceName(ctx)

	var node *mtree.TreeNode
	var err error

	if req.GetNode().GetPath() == "" && req.GetNode().GetUuid() != "" {

		node, err = dao.GetNodeByUUID(req.GetNode().GetUuid())
		if err != nil || node == nil {
			return errors.NotFound(name, "Could not find node by UUID with %s ", req.GetNode().GetUuid())
		}

		// In the case we've retrieve the node by uuid, we need to retrieve the path
		var path []string
		for pnode := range dao.GetNodes(node.MPath.Parents()...) {
			path = append(path, pnode.Name())
		}
		path = append(path, node.Name())
		node.Path = safePath(strings.Join(path, "/"))

	} else {
		reqPath := safePath(req.GetNode().GetPath())

		path, _, err := dao.Path(reqPath, false)
		if err != nil {
			return errors.InternalServerError(name, "Error while retrieving path [%s], cause: %s", reqPath, err.Error())
		}
		if path == nil {
			//return errors.New("Could not retrieve file path")
			// Do not return error, or send a file not exists?
			return errors.NotFound(name, "Could not retrieve node %s", reqPath)
		}
		node, err = dao.GetNode(path)
		if err != nil {
			if len(path) == 1 && path[0] == 1 {
				// This is the root node, let's create it
				node = index.NewNode(&tree.Node{
					Uuid: "ROOT",
					Type: tree.NodeType_COLLECTION,
				}, path, []string{""})
				if err = dao.AddNode(node); err != nil {
					return err
				}
			} else {
				return errors.NotFound(name, "Could not retrieve node %s", reqPath)
			}
		}

		node.Path = reqPath
	}

	resp.Success = true

	s.setDataSourceMeta(node)

	if req.WithExtendedStats && !node.IsLeaf() {
		folderCount, fileCount := dao.GetNodeChildrenCounts(node.MPath)
		node.SetMeta("ChildrenCount", folderCount+fileCount)
		node.SetMeta("ChildrenFolders", folderCount)
		node.SetMeta("ChildrenFiles", fileCount)
	}

	resp.Node = node.Node

	return nil
}

// ListNodes implementation for the TreeServer.
func (s *TreeServer) ListNodes(ctx context.Context, req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesStream) error {

	defer track(ctx, "ListNodes", time.Now(), req, resp)

	dao := getDAO(ctx, "")
	name := servicecontext.GetServiceName(ctx)

	defer resp.Close()

	if req.Ancestors && req.Recursive {
		return errors.InternalServerError(name, "Please use either Recursive (children) or Ancestors (parents) flag, but not both.")
	}

	// Special case for  "Ancestors", node can have either Path or Uuid
	// There is no need to compute additional stats here (folderSize)
	if req.Ancestors {

		var node *mtree.TreeNode
		var err error
		if req.GetNode().GetPath() == "" && req.GetNode().GetUuid() != "" {

			node, err = dao.GetNodeByUUID(req.GetNode().GetUuid())
			if err != nil {
				return errors.NotFound(name, "could not find node by UUID with %s, cause: %s", req.GetNode().GetUuid(), err.Error())
			}

		} else {

			reqPath := safePath(req.GetNode().GetPath())
			path, _, err := dao.Path(reqPath, false)
			if err != nil {
				return errors.InternalServerError(name, "cannot retrieve path for %s, cause: %s", reqPath, err.Error())
			}
			if path == nil {
				return errors.NotFound(name, "Could not retrieve node %s", reqPath)
			}
			node, err = dao.GetNode(path)
			if err != nil {
				return errors.InternalServerError(name, "cannot get node at %s, cause: %s", reqPath, err.Error())
			}
		}

		// Get Ancestors tree and rebuild pathes for each
		var path []string
		nodes := []*mtree.TreeNode{}
		for pnode := range dao.GetNodes(node.MPath.Parents()...) {
			path = append(path, pnode.Name())
			pnode.Path = safePath(strings.Join(path, "/"))
			nodes = append(nodes, pnode)
		}
		// Now Reverse Slice
		last := len(nodes) - 1
		for i := 0; i < len(nodes)/2; i++ {
			nodes[i], nodes[last-i] = nodes[last-i], nodes[i]
		}
		for _, n := range nodes {
			resp.Send(&tree.ListNodesResponse{Node: n.Node})
		}

	} else {
		reqNode := req.GetNode()
		reqPath := safePath(reqNode.GetPath())

		path, _, err := dao.Path(reqPath, false)
		if err != nil {
			return errors.InternalServerError(name, "cannot resolve path %s, cause: %s", reqPath, err.Error())
		}

		if path == nil {
			return errors.NotFound(name, "Could not retrieve node %s", reqPath)
		}

		if req.WithCommits {
			rootNode, _ := dao.GetNode(path)
			if err := dao.ResyncDirtyEtags(rootNode); err != nil {
				log.Logger(ctx).Error("could not re-sync dirty etags", rootNode.Zap(), zap.Error(err))
			}
		}

		var c chan interface{}
		if req.Recursive {
			c = dao.GetNodeTree(path)
		} else {
			c = dao.GetNodeChildren(path)
		}

		// Additional filters
		metaFilter := tree.NewMetaFilter(reqNode)
		hasFilter := metaFilter.Parse()
		limitDepth := metaFilter.LimitDepth()

		log.Logger(ctx).Debug("Listing nodes on DS with Filter", zap.Int32("req.FilterType", int32(req.FilterType)), zap.Bool("true", req.FilterType == tree.NodeType_COLLECTION))

		names := strings.Split(reqPath, "/")
		var receivedErr error
		for obj := range c {
			node, isNode := obj.(*mtree.TreeNode)
			if !isNode {
				receivedErr = obj.(error)
				break
			}

			if req.FilterType == tree.NodeType_COLLECTION && node.Type == tree.NodeType_LEAF {
				continue
			}
			if req.Recursive && node.Path == reqPath {
				continue
			}

			if node.Level > cap(names) {
				newNames := make([]string, len(names), node.Level)
				copy(newNames, names)
				names = newNames
			}

			names = names[0:node.Level]
			names[node.Level-1] = node.Name()

			node.Path = safePath(strings.Join(names, "/"))

			s.setDataSourceMeta(node)

			if hasFilter && !metaFilter.Match(node.Name(), node.Node) {
				continue
			}
			if req.FilterType == tree.NodeType_LEAF && node.Type == tree.NodeType_COLLECTION {
				continue
			}
			if limitDepth > 0 && node.Level != limitDepth {
				continue
			}
			resp.Send(&tree.ListNodesResponse{Node: node.Node})
		}
		if receivedErr != nil {
			return receivedErr
		}
	}

	return nil
}

// UpdateNode implementation for the TreeServer.
func (s *TreeServer) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest, resp *tree.UpdateNodeResponse) (err error) {
	defer track(ctx, "UpdateNode", time.Now(), req, resp)

	log.Logger(ctx).Debug("Entering UpdateNode")
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in UpdateNode: %s. Params From:%s, To:%s", r, req.From.Path, req.To.Path)
		}
		log.Logger(ctx).Debug("Finished UpdateNode")
	}()

	// dao := servicecontext.GetDAO(ctx).(index.DAO)
	dao := getDAO(ctx, req.GetIndexationSession())
	name := servicecontext.GetServiceName(ctx)

	reqFromPath := safePath(req.GetFrom().GetPath())
	reqToPath := safePath(req.GetTo().GetPath())

	var pathFrom, pathTo mtree.MPath
	var nodeFrom, nodeTo *mtree.TreeNode

	if pathFrom, _, err = dao.Path(reqFromPath, false); err != nil {
		return errors.InternalServerError(name, "cannot resolve pathFrom %s, cause: %s", reqFromPath, err.Error())
	}
	if pathFrom == nil {
		return errors.NotFound(name, "Could not retrieve node %s", req.From.Path)
	}
	if nodeFrom, err = dao.GetNode(pathFrom); err != nil {
		return errors.NotFound(name, "Could not retrieve node %s", req.From.Path)
	}

	if cache, o := dao.(cindex.CacheDAO); o {

		pathTo, nodeTo, err = cache.PathCreateNoAdd(reqToPath)

	} else {
		if pathTo, _, err = dao.Path(reqToPath, true); err != nil {
			return errors.InternalServerError(name, "cannot resolve pathTo %s, cause: %s", reqToPath, err.Error())
		}
		if nodeTo, err = dao.GetNode(pathTo); err != nil {
			return errors.NotFound(name, "Could not retrieve node %s", req.From.Path)
		}

		// Legacy : to Avoid Duplicate error when using a CacheDAO - Flush now and after delete.
		dao.Flush(false)

		// First of all, we delete the existing node
		if nodeTo != nil {
			if err = dao.DelNode(nodeTo); err != nil {
				return errors.InternalServerError(name, "Could not delete former to node at %s", req.To.Path)
			}
		}

		dao.Flush(false)
	}

	nodeFrom.Path = reqFromPath
	nodeTo.Path = reqToPath

	s.setDataSourceMeta(nodeFrom)
	s.setDataSourceMeta(nodeTo)

	if err = dao.MoveNodeTree(nodeFrom, nodeTo); err != nil {
		return err
	}

	newNode, err := dao.GetNode(pathTo)
	if err == nil && newNode != nil {
		newNode.Path = reqToPath
		s.setDataSourceMeta(newNode)
		if err := s.UpdateParentsAndNotify(ctx, dao, nodeFrom.GetSize(), tree.NodeChangeEvent_UPDATE_PATH, nodeFrom, newNode, req.IndexationSession); err != nil {
			return errors.InternalServerError(common.ServiceDataIndex_, "error while updating parents:  %s", err.Error())
		}
	}

	resp.Success = true

	return nil
}

// DeleteNode implementation for the TreeServer.
func (s *TreeServer) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest, resp *tree.DeleteNodeResponse) (err error) {

	log.Logger(ctx).Debug("DeleteNode", zap.Any("request", req))
	defer track(ctx, "DeleteNode", time.Now(), req, resp)
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in DeleteNode: %s. Node path was %s", r, req.Node.Path)
		}
	}()

	dao := getDAO(ctx, req.GetIndexationSession())
	name := servicecontext.GetServiceName(ctx)

	reqPath := safePath(req.GetNode().GetPath())

	path, _, pE := dao.Path(reqPath, false)
	if pE != nil {
		return errors.NotFound(name, "Could not compute path %s (%s)", reqPath, pE.Error())
	}

	node, err := dao.GetNode(path)
	if err != nil {
		return errors.NotFound(name, "Could not retrieve node %s", reqPath)
	}
	node.Path = reqPath
	s.setDataSourceMeta(node)
	var childrenEvents []*tree.NodeChangeEvent
	if node.Type == tree.NodeType_COLLECTION {
		c := dao.GetNodeTree(path)
		names := strings.Split(reqPath, "/")
		var treeErr error
		for obj := range c {
			child, ok := obj.(*mtree.TreeNode)
			if !ok {
				treeErr = obj.(error)
				break
			}
			if child.Name() == common.PydioSyncHiddenFile {
				continue
			}
			if child.Level > cap(names) {
				newNames := make([]string, len(names), child.Level)
				copy(newNames, names)
				names = newNames
			}
			names = names[0:child.Level]
			names[child.Level-1] = child.Name()
			child.Path = safePath(strings.Join(names, "/"))
			s.setDataSourceMeta(child)
			childrenEvents = append(childrenEvents, &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_DELETE,
				Source: child.Node,
				Silent: true,
			})
		}
		if treeErr != nil {
			return treeErr
		}
	}

	if err := dao.DelNode(node); err != nil {
		return errors.InternalServerError(name, "Could not delete node at %s, cause: %s", reqPath, err.Error())
	}

	if err := s.UpdateParentsAndNotify(ctx, dao, node.Size, tree.NodeChangeEvent_DELETE, node, nil, req.IndexationSession); err != nil {
		return errors.InternalServerError(common.ServiceDataIndex_, "Error while updating parents: %s", err.Error())
	}

	if len(childrenEvents) > 0 {
		var batcher sessions.SessionBatcher
		if req.IndexationSession != "" {
			sess, batch, err := s.sessionStore.ReadSession(req.IndexationSession)
			if err == nil && sess != nil {
				batcher = batch
			}
		}
		for _, ev := range childrenEvents {
			if batcher != nil {
				batcher.Notify(common.TopicIndexChanges, ev)
			} else {
				client.Publish(ctx, client.NewPublication(common.TopicIndexChanges, ev))
			}
			<-time.After(100 * time.Microsecond)
		}

	}

	resp.Success = true
	return nil
}

// OpenSession opens an indexer session.
func (s *TreeServer) OpenSession(ctx context.Context, req *tree.OpenSessionRequest, resp *tree.OpenSessionResponse) error {
	log.Logger(ctx).Info("Opening Indexation Session " + req.GetSession().GetUuid())

	s.sessionStore.PutSession(req.GetSession())
	resp.Session = req.GetSession()
	return nil

}

// FlushSession allows to flsuh what's in the dao cache for the current session to ensure we are up to date moving on to the next phase of the indexation.
func (s *TreeServer) FlushSession(ctx context.Context, req *tree.FlushSessionRequest, resp *tree.FlushSessionResponse) error {
	session, _, _ := s.sessionStore.ReadSession(req.GetSession().GetUuid())
	if session != nil {
		log.Logger(ctx).Info("Flushing Indexation Session " + req.GetSession().GetUuid())

		dao := getDAO(ctx, session.GetUuid())
		err := dao.Flush(false)
		if err != nil {
			log.Logger(ctx).Error("Error while flushing indexation Session "+req.GetSession().GetUuid(), zap.Error(err))
			return err
		}
	}

	resp.Session = req.GetSession()
	return nil
}

// CloseSession closes an indexer session.
func (s *TreeServer) CloseSession(ctx context.Context, req *tree.CloseSessionRequest, resp *tree.CloseSessionResponse) error {

	session, batcher, _ := s.sessionStore.ReadSession(req.GetSession().GetUuid())
	if session != nil {
		log.Logger(ctx).Info("Closing Indexation Session " + req.GetSession().GetUuid())

		dao := getDAO(ctx, session.GetUuid())

		err := dao.Flush(true)
		batcher.Flush(ctx, dao)

		s.sessionStore.DeleteSession(req.GetSession())
		if err != nil {
			log.Logger(ctx).Error("Error while closing (flush) indexation Session "+req.GetSession().GetUuid(), zap.Error(err))
			return err
		}
	}
	resp.Session = req.GetSession()
	return nil

}

// CleanResourcesBeforeDelete ensure all resources are cleant before deleting.
func (s *TreeServer) CleanResourcesBeforeDelete(ctx context.Context, request *object.CleanResourcesRequest, response *object.CleanResourcesResponse) error {
	dao := servicecontext.GetDAO(ctx).(index.DAO)
	err, msg := dao.CleanResourcesOnDeletion()
	if err != nil {
		response.Success = false
	} else {
		response.Success = true
		response.Message = msg
	}
	return err
}

// UpdateParentsAndNotify update the parents nodes and notify the tree of the event that occurred.
func (s *TreeServer) UpdateParentsAndNotify(ctx context.Context, dao index.DAO, deltaSize int64, eventType tree.NodeChangeEvent_EventType, sourceNode *mtree.TreeNode, targetNode *mtree.TreeNode, sessionUuid string) error {

	var batcher sessions.SessionBatcher
	var session *tree.IndexationSession
	if sessionUuid != "" {
		sess, batch, err := s.sessionStore.ReadSession(sessionUuid)
		if err == nil && sess != nil {
			session = sess
			batcher = batch
		}
	}

	// Init Event from source/target parameters
	var event *tree.NodeChangeEvent
	mpathes := make(map[*mtree.MPath]int64)
	if sourceNode == nil {
		// CREATE
		mpathes[&targetNode.MPath] = deltaSize
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Target: targetNode.Node,
		}
	} else if targetNode == nil {
		// DELETE
		mpathes[&sourceNode.MPath] = -deltaSize
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Source: sourceNode.Node,
		}
	} else {
		// UPDATE
		mpathFrom := sourceNode.MPath
		mpathTo := targetNode.MPath
		if mpathFrom.Parent().String() == mpathTo.Parent().String() {
			mpathes[&mpathFrom] = 0
		} else {
			mpathes[&mpathFrom] = -sourceNode.Size
			mpathes[&mpathTo] = sourceNode.Size
		}
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Source: sourceNode.Node,
			Target: targetNode.Node,
		}
	}

	// Enrich Event Metadata field
	if md, ok := metadata.FromContext(ctx); ok {
		if event.Metadata == nil {
			event.Metadata = make(map[string]string, len(md))
		}
		for k, v := range md {
			for _, header := range common.XSpecialPydioHeaders {
				// May return special headers in lowercase, we don't want that.
				if k == strings.ToLower(header) {
					k = header
					break
				}
			}
			event.Metadata[k] = v
		}
	}

	// Publish either to batcher or to broker directly
	if batcher != nil && session != nil {
		event.Silent = session.Silent
		batcher.Notify(common.TopicIndexChanges, event)
	} else {
		client.Publish(ctx, client.NewPublication(common.TopicIndexChanges, event))
	}

	return nil
}

// CreateNodeStream implementation for the TreeServer.
func (s *TreeServer) CreateNodeStream(ctx context.Context, stream tree.NodeReceiverStream_CreateNodeStreamStream) error {
	var (
		err error
		req *tree.CreateNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp := &tree.CreateNodeResponse{}
		err = s.CreateNode(ctx, req, rsp)
		if err != nil {
			break
		}

		err = stream.Send(rsp)
		if err != nil {
			break
		}
	}

	stream.Close()
	return err
}

func track(ctx context.Context, fn string, start time.Time, req interface{}, resp interface{}) {
	log.Logger(ctx).Debug(fn, zap.Duration("time", time.Since(start)), zap.Any("req", req), zap.Any("resp", resp))
}

func safePath(str string) string {
	return fmt.Sprintf("/%s", strings.TrimLeft(str, "/"))
}
